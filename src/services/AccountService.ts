import { Service, Inject } from 'typedi';
import { SNS, DynamoDB } from 'aws-sdk';
import crypto from 'crypto';
import { User } from '../models/User';
import { sign } from 'jsonwebtoken';
import { Redis } from 'ioredis';
import { TokenService } from './TokenService';
import { InjectRedis } from '../decorators/InjectRedis';

export interface AuthenticationTokenPayload {
  id: string;
}

@Service()
export class AccountService {
  private client = new DynamoDB.DocumentClient({ region: 'us-east-1' });

  @Inject()
  private tokenService!: TokenService;

  @InjectRedis()
  private redis!: Redis;

  async createAccountRequest(user: User): Promise<string> {
    // Add the ID of the user
    user.id = crypto.randomBytes(32).toString('hex');

    // Create the auth code and send it
    const code = await this.sendAuthenticationCode(user);

    // Store the authentication data
    await this.storeUserAuthenticationData(user, code);

    // Return the request token
    return this.generateUserAuthenticationToken(user, 'create_account_request');
  }

  async createAccountConfirm(token: string, inputCode: string): Promise<string> {
    const { id } = this.getUserAuthenticationTokenPayload(token, 'create_account_request');
    const { user, code } = await this.getUserAuthenticationData(id);

    if (!crypto.timingSafeEqual(Buffer.from(code), Buffer.from(inputCode))) {
      throw new Error('Invalid code');
    }

    await this.client
      .put({
        Item: user,
        TableName: 'users',
      })
      .promise();

    return this.generateUserAuthenticationToken(user, 'auth');
  }

  async loginRequest(phone: string): Promise<string> {
    const res = await this.client
      .get({
        Key: {
          phone,
        },
        TableName: 'users',
      })
      .promise();

    if (!res.Item) {
      throw new Error('User does not exist, please create an account');
    }

    const user = res.Item as User;

    const code = await this.sendAuthenticationCode(user);
    await this.storeUserAuthenticationData(user, code);

    return this.generateUserAuthenticationToken(user, 'login_request');
  }

  async loginConfirm(token: string, inputCode: string): Promise<string> {
    const { id } = this.getUserAuthenticationTokenPayload(token, 'login_request');
    const { user, code } = await this.getUserAuthenticationData(id);

    if (!crypto.timingSafeEqual(Buffer.from(code), Buffer.from(inputCode))) {
      throw new Error('Invalid code');
    }

    return this.generateUserAuthenticationToken(user, 'auth');
  }

  private async sendAuthenticationCode(user: User): Promise<string> {
    const code = this.generateAuthenticationCode();

    const sns = new SNS({
      region: 'us-east-1',
    });

    await sns
      .publish({
        Message: `Your NaviApp login code is ${code}`,
        PhoneNumber: user.phone,
      })
      .promise();

    return code;
  }

  private async storeUserAuthenticationData(user: User, code: string): Promise<void> {
    await this.redis.set(user.id + '_create_request_code', code, 'ex', 30);
    await this.redis.set(user.id + '_create_request_user', JSON.stringify(user), 'ex', 30);
  }

  private async getUserAuthenticationData(id: string): Promise<{ user: User; code: string }> {
    const code = await this.redis.get(id + '_create_request_code');
    const jsonUser = await this.redis.get(id + '_create_request_user');
    if (!code || !jsonUser) {
      throw new Error('This number never requested a code, or the code expired. Please go back and try again.');
    }

    const user = JSON.parse(jsonUser);

    return {
      user,
      code: code,
    };
  }

  private generateAuthenticationCode(): string {
    return crypto
      .randomBytes(3)
      .toString('hex')
      .toUpperCase();
  }

  private generateUserAuthenticationToken(user: User, audience: string): string {
    return this.tokenService.createToken(
      {
        id: user.id,
      },
      {
        audience,
      },
    );
  }

  public getUserAuthenticationTokenPayload(token: string, audience: string): AuthenticationTokenPayload {
    return this.tokenService.extractPayload(token, {
      audience,
    }) as AuthenticationTokenPayload;
  }
}

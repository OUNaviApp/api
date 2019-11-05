import { Service } from 'typedi';
import { sign, verify, SignOptions, VerifyOptions } from 'jsonwebtoken';

@Service()
export class TokenService {
  createToken(payload: string | object, options?: SignOptions): string {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET must be set');
    }
    return sign(payload, process.env.JWT_SECRET, options);
  }

  extractPayload(token: string, options?: VerifyOptions): string | object {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET must be set');
    }
    return verify(token, process.env.JWT_SECRET, options);
  }
}

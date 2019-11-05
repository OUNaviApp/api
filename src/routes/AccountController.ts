import { Body, JsonController, Post } from 'routing-controllers';
import { Inject } from 'typedi';
import { AccountService } from '../services/AccountService';
import { User } from '../models/User';
import { TokenService } from '../services/TokenService';
// Elevator Ramp Hazard

@JsonController('/account')
export class AccountController {
  @Inject()
  private accountService!: AccountService;

  @Post('/create_account_request')
  public async createAccountRequest(@Body() user: User): Promise<string> {
    return this.accountService.createAccountRequest(user);
  }

  @Post('/create_account_confirm')
  public async createAccountConfirm(@Body() data: { token: string; code: string }): Promise<string> {
    return this.accountService.createAccountConfirm(data.token, data.code);
  }

  @Post('/login_request')
  public async loginrequest(@Body() data: { phone: string }): Promise<string> {
    return this.accountService.loginRequest(data.phone);
  }

  @Post('/login_confirm')
  public async loginConfirm(@Body() data: { token: string; code: string }): Promise<string> {
    return this.accountService.loginConfirm(data.token, data.code);
  }
}

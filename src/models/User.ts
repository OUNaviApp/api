import { Length, IsPhoneNumber } from 'class-validator';

export class User {
  public id!: string;

  @IsPhoneNumber('us')
  public phone!: string;

  @Length(1, 100)
  public firstName!: string;

  @Length(1, 100)
  public lastName!: string;

  public markers: string[] = [];
}

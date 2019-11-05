import { IsNumber, IsString, Length } from 'class-validator';

export class Marker {
  public hash!: string;

  public geocode!: string;

  @IsNumber()
  public longitude!: number;

  @IsNumber()
  public latitude!: number;

  @IsString()
  public image!: string;

  @IsString()
  @Length(1, 30)
  public title!: string;

  @IsString()
  @Length(1, 1000)
  public description!: string;
}

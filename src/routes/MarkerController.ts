import {
  JsonController,
  Post,
  Body,
  Authorized,
  Param,
  Delete,
  Put,
  CurrentUser,
  Params,
  Get,
} from 'routing-controllers';
import { Marker } from '../models/Marker';
import * as geohash from 'ngeohash';
import { randomBytes } from 'crypto';
import { Inject } from 'typedi';
import { MarkerService } from '../services/MarkerService';
import { User } from '../models/User';
import { IsLatitude, IsLongitude } from 'class-validator';
// Elevator Ramp Hazard

class Location {
  @IsLatitude()
  public latitude!: number;

  @IsLongitude()
  public longitude!: number;
}

@JsonController('/marker')
export class MarkerController {
  @Inject()
  private markerService!: MarkerService;

  @Post('/')
  @Authorized()
  public async create(@Body() marker: Marker): Promise<Marker> {
    return this.markerService.create(marker);
  }

  // @Get('/')
  // public async get(@Params() params: Location): Promise<Marker[]> {
  //   return this.markerService.getRegion(params.latitude, params.longitude, 25);
  // }

  @Delete('/')
  @Authorized()
  public async delete(@Param('id') id: string): Promise<boolean> {
    const marker = await this.markerService.get(id);
    await this.markerService.delete(marker);
    return true;
  }
}

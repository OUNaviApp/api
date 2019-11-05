import { JsonController, Post, Body, Authorized, Param, Delete, Put, CurrentUser } from 'routing-controllers';
import { Marker } from '../models/Marker';
import * as geohash from 'ngeohash';
import { randomBytes } from 'crypto';
import { Inject } from 'typedi';
import { MarkerService } from '../services/MarkerService';
import { User } from '../models/User';
// Elevator Ramp Hazard

@JsonController('/marker')
export class MarkerController {
  @Inject()
  private markerService!: MarkerService;

  @Post('/')
  @Authorized()
  public async create(@Body() marker: Marker, @CurrentUser({ required: true }) user: User): Promise<Marker> {
    return this.markerService.create(marker, user);
  }

  @Delete('/')
  @Authorized()
  public async delete(@Param('id') id: string, @CurrentUser({ required: true }) user: User): Promise<boolean> {
    const marker = await this.markerService.get(id);
    await this.markerService.delete(marker);
    return true;
  }
}

import { JsonController, Post, Body } from 'routing-controllers';
import { Marker } from '../models/Marker';
import * as geohash from 'ngeohash';
import { randomBytes } from 'crypto';
import { Inject } from 'typedi';
import { MarkerService } from '../services/MarkerService';
// Elevator Ramp Hazard

@JsonController('/marker')
export class MarkerController {
  @Inject()
  private markerService!: MarkerService;

  @Post('/create')
  public async create(@Body() marker: Marker): Promise<Marker> {
    // Allocate for the 64 bit int
    const geocode = Buffer.alloc(8);
    // Geocode and write the 48 bit int to the code
    geocode.writeUIntBE(geohash.encode_int(marker.latitude, marker.longitude, 48), 0, 6);
    const uniq = randomBytes(2).readInt8(0);
    geocode.writeIntBE(uniq, 6, 2);
    marker.geocode = geocode.readBigUInt64BE().toString();
    //https://www.ibm.com/support/knowledgecenter/en/SSCJDQ/com.ibm.swg.im.dashdb.analytics.doc/doc/geo_geohashes.html
    marker.hash = marker.geocode.substr(0, 5);
    await this.markerService.create(marker);

    return marker;
  }
}

import { Service } from 'typedi';
import { Marker } from '../models/Marker';
import * as AWS from 'aws-sdk';
import { randomBytes } from 'crypto';
import geohash from 'ngeohash';
import { User } from '../models/User';

@Service()
export class MarkerService {
  private dynamodb = new AWS.DynamoDB({ region: 'us-east-1' });
  private client = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

  async get(geocode: string): Promise<Marker> {
    const hash = this.getHashFromGeocode(geocode);

    const res = await this.client
      .get({
        Key: {
          hash,
          geocode,
        },
        TableName: 'markers',
      })
      .promise();

    if (!res.Item) {
      throw new Error('No marker exists for that ID');
    }

    return res.Item as Marker;
  }

  async create(marker: Marker, user: User): Promise<Marker> {
    // Allocate for the 64 bit int
    const geocode = Buffer.alloc(8);
    // Geocode and write the 48 bit int to the code
    geocode.writeUIntBE(geohash.encode_int(marker.latitude, marker.longitude, 48), 0, 6);
    const uniq = randomBytes(2).readInt8(0);
    geocode.writeIntBE(uniq, 6, 2);
    marker.geocode = geocode.readBigUInt64BE().toString();
    //https://www.ibm.com/support/knowledgecenter/en/SSCJDQ/com.ibm.swg.im.dashdb.analytics.doc/doc/geo_geohashes.html
    marker.hash = this.getHashFromGeocode(marker.geocode);
    marker.creator = user.id;
    await this.dynamodb
      .putItem({
        Item: {
          hash: { N: marker.hash },
          creator: { S: user.id },
          geocode: { N: marker.geocode },
          longitude: { N: marker.longitude.toString() },
          latitude: { N: marker.latitude.toString() },
          image: { S: marker.image },
          title: { S: marker.title },
          description: { S: marker.description },
        },
        TableName: 'markers',
      })
      .promise();

    return marker;
  }

  public async delete(marker: Marker): Promise<void> {
    await this.client
      .delete({
        Key: {
          hash: marker.hash,
          geocode: marker.geocode,
        },
        TableName: 'markers',
      })
      .promise();
  }

  private getHashFromGeocode(geocode: string): string {
    return geocode.substr(0, 5);
  }
}

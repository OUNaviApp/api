import { Service } from 'typedi';
import { Marker } from '../models/Marker';
import * as AWS from 'aws-sdk';

@Service()
export class MarkerService {
  private dynamodb = new AWS.DynamoDB({ region: 'us-east-1' });

  async create(marker: Marker): Promise<Marker> {
    await this.dynamodb
      .putItem({
        Item: {
          hash: { N: marker.hash },
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
}

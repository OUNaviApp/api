import { Service } from 'typedi';
import { DynamoDB } from 'aws-sdk';
import { User } from '../models/User';

@Service()
export class UserService {
  private client = new DynamoDB.DocumentClient({ region: 'us-east-1' });

  async getFromId(id: string): Promise<User> {
    const res = await this.client
      .query({
        IndexName: 'id-index',
        KeyConditionExpression: '#id = :id',
        ExpressionAttributeNames: {
          '#id': 'id',
        },
        ExpressionAttributeValues: {
          ':id': id,
        },
        TableName: 'users',
      })
      .promise();

    if (!res.Items || res.Items.length !== 1) {
      throw new Error("A user for that ID doesn't exist");
    }

    return res.Items[0] as User;
  }
}

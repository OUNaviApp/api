import Redis from 'ioredis';

export class RedisService {
  private _redis?: Redis.Redis;
  public get redis(): Redis.Redis {
    if (this._redis) {
      return this._redis;
    }
    const redis = new Redis(6379, '127.0.0.1');
    this._redis = redis;
    return redis;
  }
}

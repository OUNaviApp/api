import Container from 'typedi';
import { RedisService } from '../services/RedisService';

export const InjectRedis: () => PropertyDecorator = () => (target, propertyName): void => {
  Object.defineProperty(target, propertyName, {
    get: () => Container.get(RedisService).redis,
  });
};

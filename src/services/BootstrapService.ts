import { Container, Service, Inject } from 'typedi';
import { Express, Request } from 'express';
import express from 'express';
import * as config from '../config';
import { LoggerService } from './LoggerService';
import { useExpressServer, useContainer as useRoutingContainer } from 'routing-controllers';
import { MarkerController } from '../routes/MarkerController';
import { AccountController } from '../routes/AccountController';
import { TokenService } from './TokenService';
import { AccountService } from './AccountService';
import { UserService } from './UserService';

@Service()
export class BootstrapService {
  @Inject()
  private logger!: LoggerService;

  public app!: Express;

  async bootstrap(): Promise<void> {
    useRoutingContainer(Container);
    this.logger.info('Starting bootstrapping process', {
      service: 'Bootstrap',
    });
    this.checkConfiguration();
    this.app = await this.createExpressServer();
    this.logger.info('Bootstrapping complete', {
      service: 'Bootstrap',
    });
  }

  private checkConfiguration(): void {
    if ((config.client as string) === 'CHANGEME' || (config.component as string) === 'CHANGEME') {
      this.logger.warn('Update the config.ts file', {
        service: 'Bootstrap',
      });
    }
  }

  private createExpressServer(): Promise<Express> {
    const app = express();
    useExpressServer(app, {
      controllers: [MarkerController, AccountController],
      cors: true,
      authorizationChecker: async (action, roles) => {
        const req = action.request as Request;

        if (!req.headers.authorization) {
          return false;
        }

        const token = req.headers.authorization.split(' ')[1];
        try {
          const { id } = Container.get(AccountService).getUserAuthenticationTokenPayload(token, 'auth');

          return true;
        } catch {
          throw new Error('Invalid token');
        }
      },
      currentUserChecker: async action => {
        const req = action.request as Request;
        if (!req.headers.authorization) {
          return undefined;
        }

        const token = req.headers.authorization.split(' ')[1];

        try {
          const { id } = Container.get(AccountService).getUserAuthenticationTokenPayload(token, 'auth');
          const user = await Container.get(UserService).getFromId(id);
          return user;
        } catch (e) {
          return undefined;
        }
      },
      validation: {
        skipMissingProperties: true,
      },
    });
    return new Promise(res => {
      app.listen(8481, () => {
        res(app);
      });
      this.logger.info('Server listening on port 8481');
    });
  }
}

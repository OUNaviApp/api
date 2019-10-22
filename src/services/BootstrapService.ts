import { Container, Service, Inject } from 'typedi';
import { Express } from 'express';
import express from 'express';
import * as config from '../config';
import { LoggerService } from './LoggerService';
import { useExpressServer, useContainer as useRoutingContainer } from 'routing-controllers';
import { MarkerController } from '../routes/MarkerController';

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
      controllers: [MarkerController],
      validation: {
        skipMissingProperties: true,
      },
    });
    return new Promise(res => {
      app.listen(8481, () => {
        res(app);
      });
    });
  }
}

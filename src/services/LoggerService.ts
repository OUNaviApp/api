import { Service } from 'typedi';
import { Logger, createLogger, format, transports } from 'winston';
import * as path from 'path';
import * as config from '../config';

@Service()
export class LoggerService {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
      ),
      defaultMeta: { client: config.client, component: config.component },
      transports: [
        new transports.File({ filename: path.join(__dirname, '../../logs/error.log'), level: 'error' }),
        new transports.File({ filename: path.join(__dirname, '../../logs/combined.log') }),
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.timestamp(),
            format.align(),
            format.printf(info => {
              const { timestamp, level, message, ...args } = info;
              const ts = timestamp.slice(0, 19).replace('T', ' ');
              return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
            }),
          ),
        }),
      );
    }
  }

  trace(msg: string, meta?: object): void {
    this.logger.log('trace', msg, meta);
  }

  debug(msg: string, meta?: object): void {
    this.logger.debug(msg, meta);
  }

  info(msg: string, meta?: object): void {
    this.logger.info(msg, meta);
  }

  warn(msg: string, meta?: object): void {
    this.logger.warn(msg, meta);
  }

  error(msg: string, meta?: object): void {
    this.logger.error(msg, meta);
  }

  fatal(msg: string, meta?: object): void {
    this.logger.log('fatal', msg, meta);
  }
}

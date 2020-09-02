import { transports, LoggerOptions, createLogger, format } from 'winston';
import { config } from './config';
import moment from 'moment';

const options: LoggerOptions = {
  exitOnError: false,
  level: config.logLevel,
  format: format.printf(
    info =>
      `[${moment().format('ddd MMM DD YYYY HH:MM:ss:SSS')}] [${info.level}]: ${info.message}\n\r`
  ),
  transports: [new transports.Console({})]
};

export const logger = createLogger(options);
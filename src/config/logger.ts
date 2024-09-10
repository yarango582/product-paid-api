import { createLogger, format, transports } from 'winston';
import { TransformableInfo } from 'logform';
import { ENV } from '../constants/enviroments.constant';
import { removeCircularReferences } from '../utils/circular.util';

const { combine, timestamp, prettyPrint, colorize, align, printf } = format;

const logger = createLogger({
  format: combine(
    colorize(),
    timestamp(),
    prettyPrint(),
    align(),
    printf((info) => printFormat(info)),
  ),
  exitOnError: false,
});

if (process.env.NODE_ENV !== ENV.PRODUCTION) {
  logger.add(new transports.Console());
} else if (process.env.NODE_ENV !== ENV.DEVELOPMENT) {
  logger.add(new transports.File({ filename: './logs/info.log' }));
}

const printFormat = (info: TransformableInfo) => {
  const { timestamp, level, message, ...args } = info;
  const ts = timestamp.slice(0, 19).replace('T', ' ');
  const safeArgs = removeCircularReferences(args);
  return `[${level}]: ${ts} ${message} ${
    Object.keys(safeArgs).length ? JSON.stringify(safeArgs, null, 2) : ''
  }`;
};

const getLogType = (message: any) => {
  const status = Number(message.split('=').pop().replace(/ .*/, ''));
  if (status < 400 || isNaN(status)) {
    return 'info';
  }
  return 'error';
};

export const stream = {
  write: (message: any) => {
    const type = getLogType(message);
    logger.log({ level: type, message: removeCircularReferences(message) });
  },
};

export default logger;

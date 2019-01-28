import { createLogger, format, transports } from 'winston';

const getLogger = () => {
  if (process.env.NODE_ENV === 'test') {
    return createLogger({
      transports: [new transports.Console({ level: 'error' })],
    });
  }
  return createLogger({
    format: format.simple(),
    level: 'debug',
    transports: [new transports.Console()],
  });
};

export default getLogger();

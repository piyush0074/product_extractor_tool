import { createLogger, format, transports } from 'winston';
// import expressWinston from 'express-winston'

const { splat, combine, timestamp, printf } = format;

const formats = combine(timestamp({ format: 'YY-MM-DD HH:MM:SS:MS' }));

const customPrintf = printf(({ timestamps, level, message, meta }) => {
  return `${level}:: ${message} ${meta ? JSON.stringify(meta) : ''}`;
});

const customLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  verbose: 5,
  silly: 6
};

const logger = createLogger({
  level: 'silly',
  format: formats,
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), splat(), customPrintf)
    })
  ],
  exceptionHandlers: new transports.Console({
    format: format.combine(format.json(), format.colorize({ all: true }))
  })
});

export default logger;
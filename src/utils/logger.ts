import { createLogger, transports, format } from 'winston';
import jsonStringify from 'safe-json-stringify';

const timestampDefinition = { format: 'YYYY-MM-DDTHH:mm:ss.SSS Z' };

// Custom console format
const customFormat = format.printf(({ level, message, timestamp, ...rest }): string => {
  const stringifiedRest = jsonStringify(rest);
  return `${timestamp} ${level}: ${message} ${stringifiedRest === '{}' ? '' : stringifiedRest}`;
});

const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(timestampDefinition), format.json()),
  transports: [
    // Write errors to a separate file
    new transports.File({ filename: 'logs/error.log', level: 'error' }),

    // Write all logs (info, warn, error) to combined.log
    new transports.File({ filename: 'logs/combined.log' }),

    // Always log to console (pretty colors + timestamp)
    new transports.Console({
      format: format.combine(format.colorize(), format.timestamp(timestampDefinition), customFormat)
    })
  ]
});

export { logger };

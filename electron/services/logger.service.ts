import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import path from 'path'
import { app } from 'electron'

const logDir = path.join(app.getPath('userData'), 'logs')

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) =>
      `[${timestamp}] [${level.toUpperCase()}] ${stack ?? message}`
    )
  ),
  transports: [
    new DailyRotateFile({
      dirname: logDir,
      filename: 'church-assistant-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxFiles: '14d',
      zippedArchive: true,
    }),
    ...(process.env.NODE_ENV === 'development'
      ? [new winston.transports.Console({ format: winston.format.simple() })]
      : []),
  ],
})

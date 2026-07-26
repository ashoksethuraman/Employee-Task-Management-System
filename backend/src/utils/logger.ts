import winston from 'winston';
import { getCorrelationId } from '@ashok92/correlation-id';

const addCorrelationId = winston.format((info) => {
  const correlationId = getCorrelationId();
  if (correlationId) {
    info.correlationId = correlationId;
  }
  return info;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: {
    service: 'employee-task-backend'
  },
  format: winston.format.combine(
    addCorrelationId(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

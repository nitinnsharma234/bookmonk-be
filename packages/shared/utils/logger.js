import winston from "winston";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom format for development (readable)
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, requestId, service, stack, ...meta }) => {
    let log = `${timestamp} [${level}]`;
    if (service) log += ` [${service}]`;
    if (requestId) log += ` [${requestId}]`;
    log += `: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

// Production format (JSON for log aggregation)
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

/**
 * Creates a Winston logger instance
 * @param {Object} options - Logger configuration options
 * @param {string} options.service - Service name for log identification
 * @param {string} options.level - Log level (default: 'info' in prod, 'debug' in dev)
 * @returns {winston.Logger} Configured logger instance
 */
export function createLogger(options = {}) {
  const { service = "bookzilla", level } = options;
  const isProduction = process.env.NODE_ENV === "production";

  const logger = winston.createLogger({
    level: level || (isProduction ? "info" : "debug"),
    defaultMeta: { service },
    format: isProduction ? prodFormat : devFormat,
    transports: [
      new winston.transports.Console(),
    ],
  });

  // Add file transport for errors in production
  if (isProduction) {
    logger.add(
      new winston.transports.File({
        filename: "logs/error.log",
        level: "error",
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    );
    logger.add(
      new winston.transports.File({
        filename: "logs/combined.log",
        maxsize: 5242880,
        maxFiles: 5,
      })
    );
  }

  return logger;
}

/**
 * Creates a child logger with request context
 * @param {winston.Logger} logger - Parent logger instance
 * @param {Object} context - Request context (requestId, etc.)
 * @returns {winston.Logger} Child logger with context
 */
export function createRequestLogger(logger, context = {}) {
  return logger.child(context);
}

// Default logger instance
export const logger = createLogger();

export default logger;

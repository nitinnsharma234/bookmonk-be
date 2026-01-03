// Middleware exports
export { default as errorHandler } from "./middleware/errorHandler.js";
export { default as asyncHandler } from "./middleware/asyncHandler.js";
export { default as requestId } from "./middleware/requestId.js";
export {
  authenticateToken,
  requireRole,
  requireAdmin,
  optionalAuth,
} from "./middleware/auth.js";

// Utility exports
export { default as ResponseHandler } from "./utils/responseHandler.js";
export { logger, createLogger, createRequestLogger } from "./utils/logger.js";
export { createHttpClient } from "./utils/httpClient.js";
export { validate, rules, body, param, query } from "./utils/validate.js";

// Error classes
export {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  ServiceError,
  BadGatewayError,
  RateLimitError,
} from "./utils/errors.js";

export { generateJwtToken } from "../shared/utils/jwt.js";

import jwt from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";

/**
 * JWT Authentication Middleware
 * Verifies JWT tokens from Authorization header
 *
 * Expected header format: Authorization: Bearer <token>
 *
 * @param {Object} options - Middleware options
 * @param {string} options.secret - JWT secret (defaults to JWT_SECRET env var)
 * @param {string[]} options.algorithms - Allowed algorithms (default: ['HS256'])
 * @returns {Function} Express middleware
 */
export const authenticateToken = (options = {}) => {
  const { secret = process.env.JWT_SECRET, algorithms = ["HS256"] } = options;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(new UnauthorizedError("No authorization token provided"));
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return next(
        new UnauthorizedError(
          "Invalid authorization header format. Use: Bearer <token>"
        )
      );
    }

    const token = parts[1];

    try {
      const decoded = jwt.verify(token, secret, { algorithms });

      // Attach user info to request
      req.user = {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        role: decoded.role,
        ...decoded,
      };

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return next(new UnauthorizedError("Token has expired"));
      }
      if (error.name === "JsonWebTokenError") {
        return next(new UnauthorizedError("Invalid token"));
      }
      return next(new UnauthorizedError("Authentication failed"));
    }
  };
};

/**
 * Role-based Authorization Middleware
 * Checks if authenticated user has required role(s)
 *
 * Must be used AFTER authenticateToken middleware
 *
 * @param {string|string[]} allowedRoles - Role(s) that can access the route
 * @returns {Function} Express middleware
 *
 * @example
 * // Single role
 * router.post('/books', authenticateToken(), requireRole('admin'), controller.create);
 *
 * // Multiple roles
 * router.get('/reports', authenticateToken(), requireRole(['admin', 'manager']), controller.list);
 */
export const requireRole = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    const userRole = req.user.role;

    if (!userRole || !roles.includes(userRole)) {
      return next(
        new ForbiddenError(
          `Access denied. Required role: ${roles.join(" or ")}`
        )
      );
    }

    next();
  };
};

/**
 * Convenience middleware for admin-only routes
 */
export const requireAdmin = requireRole("admin");

/**
 * Optional authentication middleware
 * Extracts user info if token is present, but doesn't require it
 * Useful for routes that behave differently for authenticated users
 *
 * @param {Object} options - Same options as authenticateToken
 * @returns {Function} Express middleware
 */
export const optionalAuth = (options = {}) => {
  const { secret = process.env.JWT_SECRET, algorithms = ["HS256"] } = options;

  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return next();
    }

    const token = parts[1];

    try {
      const decoded = jwt.verify(token, secret, { algorithms });
      req.user = {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        role: decoded.role,
        ...decoded,
      };
    } catch (error) {
      // Token is invalid, but that's okay for optional auth
      // Just don't set req.user
    }

    next();
  };
};

export default {
  authenticateToken,
  requireRole,
  requireAdmin,
  optionalAuth,
};

import { v4 as uuidv4 } from "uuid";

/**
 * Request ID middleware
 * Generates or propagates correlation IDs for distributed tracing
 *
 * - If x-request-id header exists, uses that value
 * - Otherwise, generates a new UUID
 * - Attaches requestId to req object for logging
 * - Sets x-request-id response header for client reference
 *
 * @param {Object} options - Middleware options
 * @param {string} options.headerName - Header name to use (default: 'x-request-id')
 * @returns {Function} Express middleware
 */
const requestId = (options = {}) => {
  const { headerName = "x-request-id" } = options;

  return (req, res, next) => {
    // Get existing request ID from header or generate new one
    const id = req.get(headerName) || uuidv4();

    // Attach to request object for use in handlers and logging
    req.requestId = id;

    // Set response header so client can reference it
    res.set(headerName, id);

    next();
  };
};

export default requestId;

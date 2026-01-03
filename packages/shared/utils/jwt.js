import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

/**
 * Generate JWT token
 * @param {Object|string|Buffer} payload
 * @param {Object} [options] - jwt sign options (expiresIn, issuer, etc.)
 * @returns {string}
 */
export const generateJwtToken = (payload, options = {}) => {
  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Verify JWT token
 * @param {string} token
 * @returns {Object}
 */
export const verifyJwtToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

import { validationResult, body, param, query } from "express-validator";
import { ValidationError } from "./errors.js";

/**
 * Validation middleware that checks express-validator results
 * and throws ValidationError if validation fails
 *
 * Use this after your validation rules
 *
 * @example
 * router.post('/books',
 *   body('title').notEmpty().withMessage('Title is required'),
 *   body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
 *   validate,
 *   controller.create
 * );
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return next(new ValidationError("Validation failed", formattedErrors));
  }

  next();
};

/**
 * Common validation rules factory
 * Pre-built validators for common fields
 */
export const rules = {
  /**
   * UUID validation
   */
  uuid: (field, location = "param") => {
    const validator = location === "param" ? param(field) : body(field);
    return validator.isUUID(4).withMessage(`${field} must be a valid UUID`);
  },

  /**
   * ISBN-10 or ISBN-13 validation
   */
  isbn: (field = "isbn") =>
    body(field)
      .optional()
      .matches(/^(?:\d{10}|\d{13}|[\d-]{13,17})$/)
      .withMessage("Invalid ISBN format"),

  /**
   * Price validation (positive decimal)
   */
  price: (field = "price") =>
    body(field)
      .notEmpty()
      .withMessage("Price is required")
      .isFloat({ min: 0.01 })
      .withMessage("Price must be a positive number"),

  /**
   * Optional price validation
   */
  optionalPrice: (field) =>
    body(field)
      .optional()
      .isFloat({ min: 0 })
      .withMessage(`${field} must be a positive number`),

  /**
   * Required string validation
   */
  requiredString: (field, maxLength = 500) =>
    body(field)
      .notEmpty()
      .withMessage(`${field} is required`)
      .isString()
      .withMessage(`${field} must be a string`)
      .isLength({ max: maxLength })
      .withMessage(`${field} must not exceed ${maxLength} characters`),

  /**
   * Optional string validation
   */
  optionalString: (field, maxLength = 500) =>
    body(field)
      .optional()
      .isString()
      .withMessage(`${field} must be a string`)
      .isLength({ max: maxLength })
      .withMessage(`${field} must not exceed ${maxLength} characters`),

  /**
   * URL validation
   */
  url: (field, required = true) => {
    const validator = body(field);
    if (!required) {
      return validator
        .optional()
        .isURL()
        .withMessage(`${field} must be a valid URL`);
    }
    return validator
      .notEmpty()
      .withMessage(`${field} is required`)
      .isURL()
      .withMessage(`${field} must be a valid URL`);
  },

  /**
   * Enum validation
   */
  enum: (field, values, required = true) => {
    const validator = body(field);
    if (!required) {
      return validator
        .optional()
        .isIn(values)
        .withMessage(`${field} must be one of: ${values.join(", ")}`);
    }
    return validator
      .notEmpty()
      .withMessage(`${field} is required`)
      .isIn(values)
      .withMessage(`${field} must be one of: ${values.join(", ")}`);
  },

  /**
   * Integer validation
   */
  integer: (field, { min, max, required = false } = {}) => {
    let validator = body(field);
    if (!required) {
      validator = validator.optional();
    } else {
      validator = validator.notEmpty().withMessage(`${field} is required`);
    }
    const options = {};
    if (min !== undefined) options.min = min;
    if (max !== undefined) options.max = max;
    return validator
      .isInt(options)
      .withMessage(
        `${field} must be an integer${min !== undefined ? ` >= ${min}` : ""}${
          max !== undefined ? ` <= ${max}` : ""
        }`
      );
  },

  /**
   * Boolean validation
   */
  boolean: (field, required = false) => {
    let validator = body(field);
    if (!required) {
      validator = validator.optional();
    }
    return validator.isBoolean().withMessage(`${field} must be a boolean`);
  },

  /**
   * Array of UUIDs validation
   */
  uuidArray: (field, required = false) => {
    let validator = body(field);
    if (!required) {
      validator = validator.optional();
    }
    return validator
      .isArray()
      .withMessage(`${field} must be an array`)
      .custom((value) => {
        if (!value) return true;
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        for (const id of value) {
          if (!uuidRegex.test(id)) {
            throw new Error(`Invalid UUID in ${field}: ${id}`);
          }
        }
        return true;
      });
  },

  /**
   * Date validation
   */
  date: (field, required = false) => {
    let validator = body(field);
    if (!required) {
      validator = validator.optional();
    } else {
      validator = validator.notEmpty().withMessage(`${field} is required`);
    }
    return validator.isISO8601().withMessage(`${field} must be a valid date`);
  },

  /**
   * Email validation
   */
  email: (field = "email", required = true) => {
    let validator = body(field);
    if (!required) {
      validator = validator.optional();
    } else {
      validator = validator.notEmpty().withMessage(`${field} is required`);
    }
    return validator
      .isEmail()
      .withMessage(`${field} must be a valid email`)
      .normalizeEmail();
  },

  /**
   * Pagination query params
   */
  pagination: () => [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("page must be a positive integer")
      .toInt(),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("limit must be between 1 and 100")
      .toInt(),
  ],
};

// Re-export express-validator functions for convenience
export { body, param, query, validationResult };

export default { validate, rules };

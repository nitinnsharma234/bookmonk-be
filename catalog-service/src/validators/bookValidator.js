import { body, param, query, validate, rules } from "@bookzilla/shared";

// Valid book formats from Prisma schema
const BOOK_FORMATS = ["HARDCOVER", "PAPERBACK", "EBOOK", "AUDIOBOOK"];

/**
 * Validation rules for creating a book
 */
export const createBookValidation = [
  // Required fields
  rules.requiredString("title", 500),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isString()
    .withMessage("Description must be a string"),
  rules.enum("format", BOOK_FORMATS),
  rules.price("price"),
  rules.url("coverImageUrl", true),

  // Optional fields
  rules.isbn("isbn"),
  body("isbn13")
    .optional()
    .matches(/^(?:\d{13}|[\d-]{17})$/)
    .withMessage("Invalid ISBN-13 format"),
  rules.optionalString("subtitle", 500),
  rules.optionalString("publisher", 255),
  rules.optionalString("edition", 100),
  rules.optionalString("language", 10),
  rules.date("publicationDate", false),
  rules.integer("pageCount", { min: 1, required: false }),
  rules.optionalPrice("discountPrice"),
  rules.integer("stockQuantity", { min: 0, required: false }),
  rules.url("previewUrl", false),
  rules.boolean("isFeatured"),
  rules.boolean("isActive"),
  body("additionalInfo")
    .optional()
    .isObject()
    .withMessage("additionalInfo must be an object"),
  rules.uuidArray("authorIds"),
  rules.uuidArray("categoryIds"),

  // Run validation
  validate,
];

/**
 * Validation rules for updating a book
 */
export const updateBookValidation = [
  // ID param validation
  rules.uuid("id", "param"),

  // All fields optional for update
  rules.optionalString("title", 500),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  rules.enum("format", BOOK_FORMATS, false),
  body("price")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Price must be a positive number"),
  rules.url("coverImageUrl", false),
  rules.isbn("isbn"),
  body("isbn13")
    .optional()
    .matches(/^(?:\d{13}|[\d-]{17})$/)
    .withMessage("Invalid ISBN-13 format"),
  rules.optionalString("subtitle", 500),
  rules.optionalString("publisher", 255),
  rules.optionalString("edition", 100),
  rules.optionalString("language", 10),
  rules.date("publicationDate", false),
  rules.integer("pageCount", { min: 1, required: false }),
  rules.optionalPrice("discountPrice"),
  rules.integer("stockQuantity", { min: 0, required: false }),
  rules.url("previewUrl", false),
  rules.boolean("isFeatured"),
  rules.boolean("isActive"),

  validate,
];

/**
 * Validation for getting a book by ID
 */
export const getBookValidation = [
  rules.uuid("id", "param"),
  validate,
];

/**
 * Validation for listing books
 */
export const listBooksValidation = [
  ...rules.pagination(),
  query("search")
    .optional()
    .isString()
    .withMessage("search must be a string")
    .isLength({ max: 100 })
    .withMessage("search must not exceed 100 characters"),
  query("format")
    .optional()
    .isIn(BOOK_FORMATS)
    .withMessage(`format must be one of: ${BOOK_FORMATS.join(", ")}`),
  query("isActive")
    .optional()
    .isIn(["true", "false"])
    .withMessage("isActive must be true or false"),
  query("isFeatured")
    .optional()
    .isIn(["true", "false"])
    .withMessage("isFeatured must be true or false"),
  validate,
];

export default {
  createBookValidation,
  updateBookValidation,
  getBookValidation,
  listBooksValidation,
};

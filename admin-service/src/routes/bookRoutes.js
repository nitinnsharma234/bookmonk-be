import { Router } from "express";
import {
  asyncHandler,
  authenticateToken,
  requireAdmin,
} from "@bookzilla/shared";
import bookController from "../controllers/bookController.js";

const router = Router();

// All routes require authentication and admin role
router.use(authenticateToken());
router.use(requireAdmin);

/**
 * @route   GET /api/catalog/books
 * @desc    Get all books (admin view)
 * @access  Admin only
 */
router.get(
  "/",
  asyncHandler(bookController.list.bind(bookController))
);

/**
 * @route   POST /api/catalog/books
 * @desc    Create a new book
 * @access  Admin only
 */
router.post(
  "/",
  asyncHandler(bookController.create.bind(bookController))
);

/**
 * @route   GET /api/catalog/books/:id
 * @desc    Get a single book by ID
 * @access  Admin only
 */
router.get(
  "/:id",
  asyncHandler(bookController.getById.bind(bookController))
);

/**
 * @route   PUT /api/catalog/books/:id
 * @desc    Update a book
 * @access  Admin only
 */
router.put(
  "/:id",
  asyncHandler(bookController.update.bind(bookController))
);

/**
 * @route   DELETE /api/catalog/books/:id
 * @desc    Delete a book
 * @access  Admin only
 */
router.delete(
  "/:id",
  asyncHandler(bookController.delete.bind(bookController))
);

export default router;

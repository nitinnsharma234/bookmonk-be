import { ResponseHandler } from "@bookzilla/shared";
import bookService from "../services/bookService.js";

/**
 * Book Controller
 * Handles HTTP requests for book operations
 */
class BookController {
  /**
   * Create a new book
   * POST /books
   */
  async create(req, res) {
    const book = await bookService.createBook(req.body);
    return ResponseHandler.success(res, book, "Book created successfully", 201);
  }

  /**
   * Get all books with pagination and filtering
   * GET /books
   */
  async list(req, res) {
    const { page, limit, search, format, isActive, isFeatured } = req.query;

    const result = await bookService.getBooks({
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
      search,
      format,
      isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
      isFeatured: isFeatured === "true" ? true : isFeatured === "false" ? false : undefined,
    });

    return ResponseHandler.success(res, result, "Books retrieved successfully");
  }

  /**
   * Get a single book by ID
   * GET /books/:id
   */
  async getById(req, res) {
    const { id } = req.params;
    const book = await bookService.getBookById(id);
    return ResponseHandler.success(res, book, "Book retrieved successfully");
  }

  /**
   * Update a book
   * PUT /books/:id
   */
  async update(req, res) {
    const { id } = req.params;
    const book = await bookService.updateBook(id, req.body);
    return ResponseHandler.success(res, book, "Book updated successfully");
  }

  /**
   * Delete a book
   * DELETE /books/:id
   */
  async delete(req, res) {
    const { id } = req.params;
    await bookService.deleteBook(id);
    return ResponseHandler.success(res, null, "Book deleted successfully");
  }
}

export default new BookController();

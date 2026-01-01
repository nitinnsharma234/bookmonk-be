import { ResponseHandler } from "@bookzilla/shared";
import catalogService from "../services/catalogService.js";

/**
 * Book Controller
 * Handles admin book management requests by proxying to catalog-service
 */
class BookController {
  /**
   * Create a new book
   * POST /api/catalog/books
   */
  async create(req, res) {
    const result = await catalogService.createBook(req.body, req.requestId);

    // Forward the catalog-service response
    return ResponseHandler.success(
      res,
      result.data,
      result.message || "Book created successfully",
      201
    );
  }

  /**
   * Get all books with pagination and filtering
   * GET /api/catalog/books
   */
  async list(req, res) {
    const result = await catalogService.getBooks(req.query, req.requestId);

    return ResponseHandler.success(
      res,
      result.data,
      result.message || "Books retrieved successfully"
    );
  }

  /**
   * Get a single book by ID
   * GET /api/catalog/books/:id
   */
  async getById(req, res) {
    const { id } = req.params;
    const result = await catalogService.getBookById(id, req.requestId);

    return ResponseHandler.success(
      res,
      result.data,
      result.message || "Book retrieved successfully"
    );
  }

  /**
   * Update a book
   * PUT /api/catalog/books/:id
   */
  async update(req, res) {
    const { id } = req.params;
    const result = await catalogService.updateBook(id, req.body, req.requestId);

    return ResponseHandler.success(
      res,
      result.data,
      result.message || "Book updated successfully"
    );
  }

  /**
   * Delete a book
   * DELETE /api/catalog/books/:id
   */
  async delete(req, res) {
    const { id } = req.params;
    await catalogService.deleteBook(id, req.requestId);

    return ResponseHandler.success(
      res,
      null,
      "Book deleted successfully"
    );
  }
}

export default new BookController();

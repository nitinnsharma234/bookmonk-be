import { createHttpClient } from "@bookzilla/shared";
import servicesConfig from "../config/services.js";

/**
 * Catalog Service Client
 * HTTP client for communicating with the catalog-service
 */
class CatalogService {
  constructor() {
    this.client = createHttpClient({
      baseURL: servicesConfig.catalogService,
      serviceName: "catalog-service",
      timeout: 15000,
      retries: 2,
    });
  }

  /**
   * Create a new book
   * @param {Object} bookData - Book data to create
   * @param {string} requestId - Request ID for tracing
   * @returns {Promise<Object>} Created book
   */
  async createBook(bookData, requestId) {
    const response = await this.client
      .withRequestId(requestId)
      .post("/books", bookData);
    return response.data;
  }

  /**
   * Get all books with optional filters
   * @param {Object} params - Query parameters
   * @param {string} requestId - Request ID for tracing
   * @returns {Promise<Object>} Books list with pagination
   */
  async getBooks(params = {}, requestId) {
    const response = await this.client
      .withRequestId(requestId)
      .get("/books", { params });
    return response.data;
  }

  /**
   * Get a single book by ID
   * @param {string} id - Book UUID
   * @param {string} requestId - Request ID for tracing
   * @returns {Promise<Object>} Book data
   */
  async getBookById(id, requestId) {
    const response = await this.client
      .withRequestId(requestId)
      .get(`/books/${id}`);
    return response.data;
  }

  /**
   * Update a book
   * @param {string} id - Book UUID
   * @param {Object} updateData - Fields to update
   * @param {string} requestId - Request ID for tracing
   * @returns {Promise<Object>} Updated book
   */
  async updateBook(id, updateData, requestId) {
    const response = await this.client
      .withRequestId(requestId)
      .put(`/books/${id}`, updateData);
    return response.data;
  }

  /**
   * Delete a book
   * @param {string} id - Book UUID
   * @param {string} requestId - Request ID for tracing
   * @returns {Promise<void>}
   */
  async deleteBook(id, requestId) {
    const response = await this.client
      .withRequestId(requestId)
      .delete(`/books/${id}`);
    return response.data;
  }
}

export default new CatalogService();

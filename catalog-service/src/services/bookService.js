import { prisma } from "@bookzilla/database";
import { NotFoundError, ConflictError } from "@bookzilla/shared";

/**
 * Book Service
 * Handles all book-related business logic and database operations
 */
class BookService {
  /**
   * Create a new book
   * @param {Object} bookData - Book data including optional authorIds and categoryIds
   * @returns {Promise<Object>} Created book with relations
   */
  async createBook(bookData) {
    const {
      isbn,
      isbn13,
      title,
      subtitle,
      description,
      publisher,
      publicationDate,
      edition,
      language = "en",
      pageCount,
      format,
      price,
      discountPrice,
      stockQuantity = 0,
      coverImageUrl,
      previewUrl,
      additionalInfo = {},
      isFeatured = false,
      isActive = true,
      authorIds = [],
      categoryIds = [],
    } = bookData;

    // Check for duplicate ISBN
    if (isbn || isbn13) {
      const existing = await prisma.book.findFirst({
        where: {
          OR: [
            isbn ? { isbn } : undefined,
            isbn13 ? { isbn13 } : undefined,
          ].filter(Boolean),
        },
      });

      if (existing) {
        throw new ConflictError("A book with this ISBN already exists");
      }
    }

    // Create book with relations
    const book = await prisma.book.create({
      data: {
        isbn,
        isbn13,
        title,
        subtitle,
        description,
        publisher,
        publicationDate: publicationDate ? new Date(publicationDate) : null,
        edition,
        language,
        pageCount,
        format,
        price,
        discountPrice,
        stockQuantity,
        coverImageUrl,
        previewUrl,
        additionalInfo,
        isFeatured,
        isActive,
        // Create author relations
        authors:
          authorIds.length > 0
            ? {
                create: authorIds.map((authorId, index) => ({
                  authorId,
                  authorOrder: index + 1,
                })),
              }
            : undefined,
        // Create category relations
        categories:
          categoryIds.length > 0
            ? {
                create: categoryIds.map((categoryId, index) => ({
                  categoryId,
                  isPrimary: index === 0,
                })),
              }
            : undefined,
      },
      include: {
        authors: {
          include: { author: true },
          orderBy: { authorOrder: "asc" },
        },
        categories: {
          include: { category: true },
          orderBy: { isPrimary: "desc" },
        },
      },
    });

    return this.formatBookResponse(book);
  }

  /**
   * Get all books with optional filtering and pagination
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (1-indexed)
   * @param {number} options.limit - Items per page
   * @param {string} options.search - Search term for title
   * @param {string} options.format - Filter by format
   * @param {boolean} options.isActive - Filter by active status
   * @param {boolean} options.isFeatured - Filter by featured status
   * @returns {Promise<Object>} Paginated books list
   */
  async getBooks(options = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      format,
      isActive,
      isFeatured,
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    if (format) {
      where.format = format;
    }

    if (typeof isActive === "boolean") {
      where.isActive = isActive;
    }

    if (typeof isFeatured === "boolean") {
      where.isFeatured = isFeatured;
    }

    // Execute queries in parallel
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          authors: {
            include: { author: true },
            orderBy: { authorOrder: "asc" },
          },
          categories: {
            include: { category: true },
            orderBy: { isPrimary: "desc" },
          },
        },
      }),
      prisma.book.count({ where }),
    ]);

    return {
      books: books.map((book) => this.formatBookResponse(book)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get a single book by ID
   * @param {string} id - Book UUID
   * @returns {Promise<Object>} Book with relations
   */
  async getBookById(id) {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        authors: {
          include: { author: true },
          orderBy: { authorOrder: "asc" },
        },
        categories: {
          include: { category: true },
          orderBy: { isPrimary: "desc" },
        },
      },
    });

    if (!book) {
      throw new NotFoundError("Book", id);
    }

    return this.formatBookResponse(book);
  }

  /**
   * Update a book
   * @param {string} id - Book UUID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated book
   */
  async updateBook(id, updateData) {
    // Check if book exists
    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Book", id);
    }

    const { authorIds, categoryIds, publicationDate, ...data } = updateData;

    // Handle date conversion
    if (publicationDate) {
      data.publicationDate = new Date(publicationDate);
    }

    // Update book
    const book = await prisma.book.update({
      where: { id },
      data,
      include: {
        authors: {
          include: { author: true },
          orderBy: { authorOrder: "asc" },
        },
        categories: {
          include: { category: true },
          orderBy: { isPrimary: "desc" },
        },
      },
    });

    return this.formatBookResponse(book);
  }

  /**
   * Delete a book
   * @param {string} id - Book UUID
   * @returns {Promise<void>}
   */
  async deleteBook(id) {
    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Book", id);
    }

    await prisma.book.delete({ where: { id } });
  }

  /**
   * Format book response to flatten nested relations
   * @param {Object} book - Raw book from Prisma
   * @returns {Object} Formatted book
   */
  formatBookResponse(book) {
    return {
      id: book.id,
      isbn: book.isbn,
      isbn13: book.isbn13,
      title: book.title,
      subtitle: book.subtitle,
      description: book.description,
      publisher: book.publisher,
      publicationDate: book.publicationDate,
      edition: book.edition,
      language: book.language,
      pageCount: book.pageCount,
      format: book.format,
      price: book.price,
      discountPrice: book.discountPrice,
      stockQuantity: book.stockQuantity,
      coverImageUrl: book.coverImageUrl,
      previewUrl: book.previewUrl,
      averageRating: book.averageRating,
      ratingsCount: book.ratingsCount,
      additionalInfo: book.additionalInfo,
      isFeatured: book.isFeatured,
      isActive: book.isActive,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      authors: book.authors?.map((ba) => ({
        id: ba.author.id,
        name: ba.author.name,
        order: ba.authorOrder,
      })),
      categories: book.categories?.map((bc) => ({
        id: bc.category.id,
        name: bc.category.name,
        slug: bc.category.slug,
        isPrimary: bc.isPrimary,
      })),
    };
  }
}

export default new BookService();

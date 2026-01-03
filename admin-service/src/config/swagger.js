import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Bookzilla Admin Service API",
      version: "1.0.0",
      description: "API documentation for the Bookzilla Admin Service - administrative operations for managing the bookstore",
      contact: {
        name: "Bookzilla Team",
      },
    },
    servers: [
      {
        url: "http://localhost:3009",
        description: "Development server",
      },
      {
        url: "http://admin-service:3009",
        description: "Docker internal",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      schemas: {
        Book: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier",
            },
            isbn: {
              type: "string",
              description: "ISBN-10",
              example: "0-7432-7356-7",
            },
            isbn13: {
              type: "string",
              description: "ISBN-13",
              example: "978-0-7432-7356-5",
            },
            title: {
              type: "string",
              description: "Book title",
              example: "The Great Gatsby",
            },
            subtitle: {
              type: "string",
              description: "Book subtitle",
            },
            description: {
              type: "string",
              description: "Book description",
            },
            publisher: {
              type: "string",
              example: "Scribner",
            },
            publicationDate: {
              type: "string",
              format: "date",
              example: "1925-04-10",
            },
            edition: {
              type: "string",
            },
            language: {
              type: "string",
              default: "en",
            },
            pageCount: {
              type: "integer",
              example: 180,
            },
            format: {
              type: "string",
              enum: ["HARDCOVER", "PAPERBACK", "EBOOK", "AUDIOBOOK"],
            },
            price: {
              type: "number",
              format: "decimal",
              example: 19.99,
            },
            discountPrice: {
              type: "number",
              format: "decimal",
            },
            stockQuantity: {
              type: "integer",
              default: 0,
            },
            coverImageUrl: {
              type: "string",
              format: "uri",
            },
            previewUrl: {
              type: "string",
              format: "uri",
            },
            averageRating: {
              type: "number",
              format: "decimal",
            },
            ratingsCount: {
              type: "integer",
            },
            isFeatured: {
              type: "boolean",
              default: false,
            },
            isActive: {
              type: "boolean",
              default: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
            authors: {
              type: "array",
              items: {
                $ref: "#/components/schemas/AuthorSummary",
              },
            },
            categories: {
              type: "array",
              items: {
                $ref: "#/components/schemas/CategorySummary",
              },
            },
          },
        },
        BookCreate: {
          type: "object",
          required: ["title", "description", "format", "price", "coverImageUrl"],
          properties: {
            isbn: { type: "string" },
            isbn13: { type: "string" },
            title: { type: "string", maxLength: 500 },
            subtitle: { type: "string" },
            description: { type: "string" },
            publisher: { type: "string" },
            publicationDate: { type: "string", format: "date" },
            edition: { type: "string" },
            language: { type: "string", default: "en" },
            pageCount: { type: "integer", minimum: 1 },
            format: {
              type: "string",
              enum: ["HARDCOVER", "PAPERBACK", "EBOOK", "AUDIOBOOK"],
            },
            price: { type: "number", minimum: 0.01 },
            discountPrice: { type: "number", minimum: 0 },
            stockQuantity: { type: "integer", minimum: 0, default: 0 },
            coverImageUrl: { type: "string", format: "uri" },
            previewUrl: { type: "string", format: "uri" },
            isFeatured: { type: "boolean" },
            isActive: { type: "boolean" },
            authorIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
            },
            categoryIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
            },
          },
        },
        AuthorSummary: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            order: { type: "integer" },
          },
        },
        CategorySummary: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            slug: { type: "string" },
            isPrimary: { type: "boolean" },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            page: { type: "integer" },
            limit: { type: "integer" },
            total: { type: "integer" },
            totalPages: { type: "integer" },
            hasNext: { type: "boolean" },
            hasPrev: { type: "boolean" },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                errors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      field: { type: "string" },
                      message: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import {
  ResponseHandler,
  errorHandler,
  requestId,
  createLogger,
  NotFoundError,
} from "@bookzilla/shared";

// Import routes
import bookRoutes from "./routes/bookRoutes.js";

// Import Swagger config
import swaggerSpec from "./config/swagger.js";

dotenv.config();

const app = express();
const PORT =  8080;
const SERVICE_NAME = process.env.SERVICE_NAME || "catalog-service";

// Create service logger
const logger = createLogger({ service: SERVICE_NAME });

// Middleware
app.use(helmet());
app.use(cors());
app.use(requestId()); // Add request ID to all requests
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  return ResponseHandler.success(res, {
    status: "healthy",
    service: SERVICE_NAME,
    timestamp: new Date().toISOString(),
  });
});

// Swagger API Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Catalog Service API Docs",
  })
);

// Swagger JSON endpoint
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// API Routes
app.use("/books", bookRoutes);

// 404 handler - must be before error handler
app.use((req, res, next) => {
  next(new NotFoundError("Route", req.originalUrl));
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  // Close server
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
};

const server = app.listen(PORT, () => {
  logger.info(`${SERVICE_NAME} running on port ${PORT}`);
});

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default app;

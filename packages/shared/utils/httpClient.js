import axios from "axios";
import { ServiceError, BadGatewayError } from "./errors.js";
import { logger } from "./logger.js";

/**
 * Creates an HTTP client for inter-service communication
 * Features:
 * - Automatic request/response logging
 * - Request ID propagation
 * - Timeout handling
 * - Error transformation
 * - Retry logic for transient failures
 *
 * @param {Object} config - Client configuration
 * @param {string} config.baseURL - Base URL of the target service
 * @param {string} config.serviceName - Name of the target service (for logging)
 * @param {number} config.timeout - Request timeout in ms (default: 10000)
 * @param {number} config.retries - Number of retries for failed requests (default: 2)
 * @returns {Object} Configured axios instance with helper methods
 */
export function createHttpClient(config = {}) {
  const {
    baseURL,
    serviceName = "unknown-service",
    timeout = 10000,
    retries = 2,
  } = config;

  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor - logging and request ID propagation
  client.interceptors.request.use(
    (config) => {
      const requestId = config.headers["x-request-id"] || config.requestId;
      if (requestId) {
        config.headers["x-request-id"] = requestId;
      }

      logger.debug(`[HTTP] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
        service: serviceName,
        requestId,
        data: config.data ? "[BODY]" : undefined,
      });

      config.metadata = { startTime: Date.now() };
      return config;
    },
    (error) => {
      logger.error(`[HTTP] Request error: ${error.message}`, { service: serviceName });
      return Promise.reject(error);
    }
  );

  // Response interceptor - logging and error handling
  client.interceptors.response.use(
    (response) => {
      const duration = Date.now() - (response.config.metadata?.startTime || 0);
      logger.debug(
        `[HTTP] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`,
        { service: serviceName }
      );
      return response;
    },
    (error) => {
      const duration = Date.now() - (error.config?.metadata?.startTime || 0);

      if (error.response) {
        // Server responded with error status
        logger.error(
          `[HTTP] ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`,
          {
            service: serviceName,
            error: error.response.data?.message || error.message,
          }
        );
      } else if (error.request) {
        // No response received
        logger.error(`[HTTP] No response from ${serviceName}: ${error.message}`, {
          service: serviceName,
        });
      } else {
        logger.error(`[HTTP] Request setup error: ${error.message}`, {
          service: serviceName,
        });
      }

      return Promise.reject(error);
    }
  );

  /**
   * Retry wrapper for requests
   */
  async function withRetry(requestFn, retriesLeft = retries) {
    try {
      return await requestFn();
    } catch (error) {
      const isRetryable =
        !error.response || // Network error
        error.response.status >= 500 || // Server error
        error.code === "ECONNABORTED"; // Timeout

      if (isRetryable && retriesLeft > 0) {
        const delay = Math.pow(2, retries - retriesLeft) * 100; // Exponential backoff
        logger.warn(`[HTTP] Retrying request to ${serviceName} in ${delay}ms...`, {
          retriesLeft,
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
        return withRetry(requestFn, retriesLeft - 1);
      }

      throw transformError(error, serviceName);
    }
  }

  /**
   * Transform axios error to application error
   */
  function transformError(error, serviceName) {
    if (!error.response) {
      return new ServiceError(serviceName, error);
    }

    const { status, data } = error.response;

    // Return upstream error message if available
    if (data?.message) {
      const upstreamError = new Error(data.message);
      upstreamError.statusCode = status;
      upstreamError.code = data.code || "UPSTREAM_ERROR";
      upstreamError.errors = data.errors;
      return upstreamError;
    }

    if (status >= 500) {
      return new BadGatewayError(serviceName);
    }

    return error;
  }

  return {
    /**
     * Make a GET request
     */
    async get(url, config = {}) {
      return withRetry(() => client.get(url, config));
    },

    /**
     * Make a POST request
     */
    async post(url, data, config = {}) {
      return withRetry(() => client.post(url, data, config));
    },

    /**
     * Make a PUT request
     */
    async put(url, data, config = {}) {
      return withRetry(() => client.put(url, data, config));
    },

    /**
     * Make a PATCH request
     */
    async patch(url, data, config = {}) {
      return withRetry(() => client.patch(url, data, config));
    },

    /**
     * Make a DELETE request
     */
    async delete(url, config = {}) {
      return withRetry(() => client.delete(url, config));
    },

    /**
     * Set request ID for the next request
     */
    withRequestId(requestId) {
      return {
        get: (url, config = {}) =>
          this.get(url, { ...config, headers: { ...config.headers, "x-request-id": requestId } }),
        post: (url, data, config = {}) =>
          this.post(url, data, { ...config, headers: { ...config.headers, "x-request-id": requestId } }),
        put: (url, data, config = {}) =>
          this.put(url, data, { ...config, headers: { ...config.headers, "x-request-id": requestId } }),
        patch: (url, data, config = {}) =>
          this.patch(url, data, { ...config, headers: { ...config.headers, "x-request-id": requestId } }),
        delete: (url, config = {}) =>
          this.delete(url, { ...config, headers: { ...config.headers, "x-request-id": requestId } }),
      };
    },

    // Expose the raw axios client for advanced use cases
    client,
  };
}

export default createHttpClient;

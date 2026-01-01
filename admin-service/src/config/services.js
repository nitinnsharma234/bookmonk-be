/**
 * Service URLs configuration
 * URLs for inter-service communication
 */
export default {
  catalogService: process.env.CATALOG_SERVICE_URL || "http://catalog-service:3002",
  authService: process.env.AUTH_SERVICE_URL || "http://auth-service:3001",
  userService: process.env.USER_SERVICE_URL || "http://user-service:3008",
  orderService: process.env.ORDER_SERVICE_URL || "http://order-service:3004",
  paymentService: process.env.PAYMENT_SERVICE_URL || "http://payment-service:3005",
};

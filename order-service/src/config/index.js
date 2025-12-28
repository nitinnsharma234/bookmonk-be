export default {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || "development",
  serviceName: process.env.SERVICE_NAME,
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: "7d",
  },
};

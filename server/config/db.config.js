require('dotenv').config(); // Make sure to load .env variables

module.exports = {
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "postgres", // Default user, change as needed
  PASSWORD: process.env.DB_PASSWORD || "password", // Default password, change as needed
  DB: process.env.DB_NAME || "ngo_platform_db", // Default db name, change as needed
  PORT: process.env.DB_PORT || 5432, // Default PostgreSQL port
  dialect: "postgres",
  pool: {
    max: 5, // max number of connections in pool
    min: 0, // min number of connections in pool
    acquire: 30000, // max time (ms) that pool will try to get connection before throwing error
    idle: 10000 // max time (ms) that a connection can be idle before being released
  }
};

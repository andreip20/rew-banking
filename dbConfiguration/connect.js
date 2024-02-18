require("dotenv").config();
const mysql = require("mysql2");

// Create a connection pool
const db = mysql.createPool({
  connectionLimit: 10, // Adjust as needed
  host: "localhost",
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

module.exports = db;

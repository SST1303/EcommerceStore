const mysql = require("mysql2");  //import mysql2 package

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

pool.getConnection((err, connection) => {
    if (err) {
        console.log("Database connection failed:", err.message);
    } else {
        console.log("MySQL database connected successfully");
        connection.release();
    }
});

module.exports = pool.promise();
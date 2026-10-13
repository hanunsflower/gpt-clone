import mysql from 'mysql2/promise';

const db = mysql.createPool({
host: process.env.DB_HOST || 'localhost',
port: Number(process.env.DB_PORT || 8889),
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
database: process.env.DB_DATABASE,
waitForConnections: true,
connectionLimit: 10,
queueLimit: 0,
});

export default db;

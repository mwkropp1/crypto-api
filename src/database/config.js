import mysql from 'mysql2/promise'
 
const sql = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, 
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  // ssl: {
  //   ca: fs.readFileSync(<path_to_cert>),
  //   rejectUnauthorized: true
  // }
});

export default sql;
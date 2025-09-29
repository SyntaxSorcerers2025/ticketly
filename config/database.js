const sql = require('mssql');
require('dotenv').config();

// Configuration pulled from environment variables (see .env)
const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    trustServerCertificate: Boolean(process.env.DB_TRUST_SERVER_CERT),
    encrypt: Boolean(process.env.DB_ENCRYPT)
  }
};

// For SQL Server Express named instance, we don't need to specify port
// The instance name handles the connection routing

let pool;

const connectDB = async () => {
  try {
    if (!pool) {
      console.log('Attempting to connect to SQL Server Express...');
      console.log('Server:', config.server);
      console.log('Database:', config.database);
      // Avoid logging sensitive info (user/password). Driver and auth depend on environment.
      pool = await sql.connect(config);
      console.log('✅ Successfully connected to SQL Server Express');
      console.log('Database: Ticketly');
    }
    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Server:', config.server);
    console.error('Database:', config.database);
    console.error('Make sure SQL Server Express is running and accessible');
    console.error('Full error:', error);
    process.exit(1);
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return pool;
};

module.exports = { connectDB, getPool, sql };
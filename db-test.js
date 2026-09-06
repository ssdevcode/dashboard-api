require('dotenv').config();
const connectDb = require('./db');

(async () => {
  try {
    console.log('🔍 Testing DB connection...');
    const pool = await connectDb();
    const result = await pool.request().query('SELECT 1 AS ok');
    console.log('✅ DB connection successful:', result.recordset);
    process.exit(0);
  } catch (err) {
    console.error('❌ DB connection failed');
    console.error(err.message);
    process.exit(1);
  }
})();
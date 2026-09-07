const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    //port: 1433,
   
    port: parseInt(process.env.DB_PORT, 10),
         options: {
        encrypt: true,               // REQUIRED for Azure SQL
        trustServerCertificate: false

    }
};

let pool;

/**
 * Returns a connected mssql pool
 */
const connectDb = async () => {
    try {
        if (pool) {
            return pool; // reuse existing pool
        }
         
        pool = await sql.connect(config);
        console.log('✅ Connected to Azure SQL');
        return pool;
    } catch (err) {
        console.error('❌ SQL connection error:', err.message);
        throw err; // IMPORTANT: do not swallow error
    }
};

module.exports = connectDb;
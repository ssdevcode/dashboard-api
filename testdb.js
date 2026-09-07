require('dotenv').config();

const sql = require("mssql");

const config = {
 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  //port: Number(process.env.DB_PORT),
  port: process.env.DB_PORT,
  //port: 1433, // Default port for Azure SQL
 
   options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

sql.connect(config)
  .then(() => {
    console.log("CONNECTED");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
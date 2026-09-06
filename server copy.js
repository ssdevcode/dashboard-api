/*
 Express API
 ↓
 mssql driver
 ↓
 db.js
 ↓
 Azure SQL Server
*/

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDb = require("./db");

const app = express();
//const PORT = process.env.PORT || 3001;
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

/**
 * Health Check
 */
app.get("/ping", (req, res) => {
  res.send("pong");
});

/**
 * DASHBOARD STATS
 */
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const pool = await connectDb();

    const result = await pool.request().query(`
      SELECT
        COUNT(DISTINCT UserId) AS TotalUsers,
        ISNULL(SUM(Amount), 0) AS TotalRevenue
      FROM Orders
    `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("❌ STATS ERROR:", err);
    res.status(500).json({ message: "Error fetching stats" });
  }
});

/**
 * GET ALL ORDERS
 */
app.get("/api/dashboard/orders", async (req, res) => {
  try {
    const pool = await connectDb();

    const result = await pool.request().query(`
      SELECT *
      FROM Orders
      ORDER BY CreatedAt DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ ORDERS ERROR:", err);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

/**
 * CREATE CUSTOMER
 */
app.post("/api/customers", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    city,
    state,
    zipcode,
  } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({
      message: "First name, last name, and email are required",
    });
  }

  try {
    const pool = await connectDb();

    const result = await pool
      .request()
      .input("FirstName", firstName)
      .input("LastName", lastName)
      .input("Email", email)
      .input("Phone", phone)
      .input("Address", address)
      .input("City", city)
      .input("State", state)
      .input("Zipcode", zipcode)
      .query(`
        INSERT INTO Customers (
          FirstName,
          LastName,
          Email,
          Phone,
          Address,
          City,
          State,
          Zipcode,
          CreatedAt
        )
        VALUES (
          @FirstName,
          @LastName,
          @Email,
          @Phone,
          @Address,
          @City,
          @State,
          @Zipcode,
          GETDATE()
        );

        SELECT SCOPE_IDENTITY() AS CustomerId;
      `);

    res.status(201).json({
      message: "Customer created successfully",
      customerId: result.recordset[0].CustomerId,
    });
  } catch (err) {
    console.error("❌ CREATE CUSTOMER ERROR:", err);
    res.status(500).json({
      message: "Failed to create customer",
    });
  }
});

/**
 * Test database connection at startup
 */
(async () => {
  try {
    await connectDb();
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
})();

app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sql = require("mssql");
const connectDb = require("./db");

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

/**
 * HEALTH CHECK
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
      SELECT COUNT(*) AS TotalCustomers
      FROM Customers
      WHERE IsActive = 1
    `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("❌ STATS ERROR:", err);

    res.status(500).json({
      message: "Error fetching dashboard stats",
    });
  }
});

/**
 * GET ALL CUSTOMERS
 */
app.get("/api/customers", async (req, res) => {
  try {
    const pool = await connectDb();

    const result = await pool.request().query(`
      SELECT
        CustomerId,
        FirstName,
        LastName,
        Email,
        PhoneNumber,
        AddressLine1,
        AddressLine2,
        City,
        StateProvince,
        PostalCode,
        Country,
        DateCreated,
        IsActive
      FROM Customers
      ORDER BY CustomerId DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ GET CUSTOMERS ERROR:", err);

    res.status(500).json({
      message: "Failed to retrieve customers",
    });
  }
});

/**
 * SEARCH CUSTOMER BY EMAIL
 * Example:
 * /api/customers/search?email=david.williams@testmail.com
 */
app.get("/api/customers/search", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        message: "Email parameter is required",
      });
    }

    const pool = await connectDb();

    const result = await pool.request()
      .input("Email", sql.NVarChar(255), email)
      .query(`
        SELECT *
        FROM Customers
        WHERE Email = @Email
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json(result.recordset[0]);

  } catch (err) {
    console.error("❌ SEARCH CUSTOMER ERROR:", err);

    res.status(500).json({
      message: "Failed to search customer",
      error: err.message
    });
  }
});

/**
 * GET CUSTOMER BY ID
 */
app.get("/api/customers/:id", async (req, res) => {
  try {
    const pool = await connectDb();

    const result = await pool.request()
      .input("CustomerId", sql.Int, parseInt(req.params.id))
      .query(`
        SELECT *
        FROM Customers
        WHERE CustomerId = @CustomerId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("❌ GET CUSTOMER ERROR:", err);

    res.status(500).json({
      message: "Failed to retrieve customer",
    });
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
    address2,
    city,
    state,
    zipcode,
    country
  } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({
      message: "First name, last name, and email are required",
    });
  }

  try {
    const pool = await connectDb();

    const result = await pool.request()
      .input("FirstName", firstName)
      .input("LastName", lastName)
      .input("Email", email)
      .input("PhoneNumber", phone || null)
      .input("AddressLine1", address || null)
      .input("AddressLine2", address2 || null)
      .input("City", city || null)
      .input("StateProvince", state || null)
      .input("PostalCode", zipcode || null)
      .input("Country", country || "USA")
      .query(`
        INSERT INTO Customers (
          FirstName,
          LastName,
          Email,
          PhoneNumber,
          AddressLine1,
          AddressLine2,
          City,
          StateProvince,
          PostalCode,
          Country,
          DateCreated,
          IsActive
        )
        OUTPUT INSERTED.CustomerId
        VALUES (
          @FirstName,
          @LastName,
          @Email,
          @PhoneNumber,
          @AddressLine1,
          @AddressLine2,
          @City,
          @StateProvince,
          @PostalCode,
          @Country,
          GETDATE(),
          1
        )
      `);

    const customerId = result.recordset[0].CustomerId;

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customerId
    });

  } catch (err) {
    console.error("❌ CREATE CUSTOMER ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to create customer",
      error: err.message
    });
  }
});

/**
 * UPDATE CUSTOMER
 */
app.put("/api/customers/:id", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    address2,
    city,
    state,
    zipcode,
    country,
    isActive
  } = req.body;

  try {
    const pool = await connectDb();

    await pool.request()
      .input("CustomerId", sql.Int, parseInt(req.params.id))
      .input("FirstName", firstName)
      .input("LastName", lastName)
      .input("Email", email)
      .input("PhoneNumber", phone)
      .input("AddressLine1", address)
      .input("AddressLine2", address2)
      .input("City", city)
      .input("StateProvince", state)
      .input("PostalCode", zipcode)
      .input("Country", country)
      .input("IsActive", isActive)
      .query(`
        UPDATE Customers
        SET
          FirstName = @FirstName,
          LastName = @LastName,
          Email = @Email,
          PhoneNumber = @PhoneNumber,
          AddressLine1 = @AddressLine1,
          AddressLine2 = @AddressLine2,
          City = @City,
          StateProvince = @StateProvince,
          PostalCode = @PostalCode,
          Country = @Country,
          IsActive = @IsActive
        WHERE CustomerId = @CustomerId
      `);

    res.json({
      success: true,
      message: "Customer updated successfully"
    });

  } catch (err) {
    console.error("❌ UPDATE CUSTOMER ERROR:", err);

    res.status(500).json({
      message: "Failed to update customer"
    });
  }
});

/**
 * DELETE CUSTOMER
 */
app.delete("/api/customers/:id", async (req, res) => {
  try {
    const pool = await connectDb();

    await pool.request()
      .input("CustomerId", sql.Int, parseInt(req.params.id))
      .query(`
        DELETE FROM Customers
        WHERE CustomerId = @CustomerId
      `);

    res.json({
      success: true,
      message: "Customer deleted successfully"
    });

  } catch (err) {
    console.error("❌ DELETE CUSTOMER ERROR:", err);

    res.status(500).json({
      message: "Failed to delete customer"
    });
  }
});

/**
 * DATABASE CONNECTION TEST
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

/**
 * START SERVER
 */
app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});
const express = require('express');
const cors = require('cors');
const connectDb = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/dashboard/stats', async (req, res) => {   
    try {
        const pool = await connectDb();
        const result = await pool.request().query('SELECT COUNT(*) AS TotalUsers,  SUM(amount) AS TotalRevenue FROM Orders');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
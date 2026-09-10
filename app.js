import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import customerRoutes from './routes/customerRoutes.js';

dotenv.config();

console.log('>>> app.js loaded');

const app = express();

app.use(cors({
  origin: 'https://thankful-desert-04569e60f.5.azurestaticapps.net',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.use('/api/customers', customerRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
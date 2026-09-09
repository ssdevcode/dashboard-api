import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

console.log('>>> app.js loaded');

const app = express();

app.get('/ping', (req, res) => {
  res.send('pong');
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
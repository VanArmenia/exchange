import express from 'express';
import fetch from 'node-fetch';
const app = express();

app.get('/api/rates', async (req, res) => {
  const response = await fetch('https://www.cnb.cz/en/financial-markets/foreign-exchange-market/central-bank-exchange-rate-fixing/central-bank-exchange-rate-fixing/daily.txt');
  const text = await response.text();
  res.set('Access-Control-Allow-Origin', '*'); // allow frontend
  res.send(text);
});

app.listen(4000, () => console.log('Server running on http://localhost:4000'));

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

const allowedOrigins = ['https://leizergraph.xyz'];
const allowedIPs = ['193.23.210.18'];

// Middleware для перевірки дозволених Origin або IP
app.use((req, res, next) => {
  const origin = req.get('Origin') || req.get('Referer');
  const ip = req.ip || req.connection.remoteAddress;

  const isAllowedOrigin = origin && allowedOrigins.some(domain => origin.startsWith(domain));
  const isAllowedIP = allowedIPs.some(allowed => ip.includes(allowed)); // includes — бо іноді буває '::ffff:193.23.210.18'

  if (isAllowedOrigin || isAllowedIP) {
    if (isAllowedOrigin) {
      res.set('Access-Control-Allow-Origin', origin);
    } else {
      res.set('Access-Control-Allow-Origin', '*');
    }
    next();
  } else {
    res.status(403).send('Forbidden: Access denied');
  }
});

app.get('/', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('Missing url');

  try {
    const response = await fetch(targetUrl);
    const contentType = response.headers.get('content-type');
    const body = await response.text();

    res.set('Content-Type', contentType || 'text/plain');
    res.send(body);
  } catch (err) {
    res.status(500).send('Error fetching target URL');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`CORS proxy running on port ${port}`));

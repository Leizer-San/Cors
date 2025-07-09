const express = require('express');
const fetch = require('node-fetch');
const app = express();

const allowedOrigins = ['https://leizergraph.xyz'];
const allowedIPs = ['193.23.210.18'];

app.use((req, res, next) => {
  const origin = req.get('Origin') || req.get('Referer');
  const ip = req.ip || req.connection.remoteAddress;

  const isAllowedOrigin = origin && allowedOrigins.some(domain => origin.startsWith(domain));
  const isAllowedIP = allowedIPs.some(allowed => ip.includes(allowed));

  if (isAllowedOrigin || isAllowedIP) {
    res.set('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    next();
  } else {
    res.status(403).send('Forbidden: Access denied');
  }
});

// OPTIONS preflight (для CORS)
app.options('*', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.sendStatus(200);
});

app.get('/', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('Missing url');

  try {
    const response = await fetch(targetUrl);

    // Копіюємо статус і заголовки
    res.status(response.status);
    for (const [key, value] of response.headers.entries()) {
      if (key.toLowerCase() !== 'content-encoding') {
        res.set(key, value);
      }
    }

    // Додаємо CORS заголовки
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Expose-Headers', '*');

    // Проксіюємо потік
    response.body.pipe(res);
  } catch (err) {
    res.status(500).send('Error fetching target URL');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`CORS proxy running on port ${port}`));

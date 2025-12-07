const express = require('express');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');

const app = express();

// Лимит: 25 запросов в минуту с одного IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 25,             // максимум 25 запросов
  standardHeaders: true,
  legacyHeaders: false,
});

// применяем rate limit ко всем запросам
app.use(limiter);

// Разрешаем CORS для всех
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  next();
});

// preflight
app.options('*', (req, res) => {
  res.sendStatus(200);
});

app.get('/', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('Missing url');

  try {
    const response = await fetch(targetUrl);

    res.status(response.status);

    for (const [key, value] of response.headers.entries()) {
      if (key.toLowerCase() !== 'content-encoding') {
        res.set(key, value);
      }
    }

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Expose-Headers', '*');

    response.body.pipe(res);
  } catch (err) {
    res.status(500).send('Error fetching target URL');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`CORS proxy running on port ${port}`));

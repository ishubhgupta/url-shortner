require('dotenv').config();
const express = require('express');
const cors = require('cors');

const urlRoutes = require('./routes/urlRoutes');
const urlController = require('./controllers/urlController');

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', urlRoutes);

// redirect route (top-level)
app.get('/:shortCode', async (req, res, next) => {
  return urlController.redirect(req, res, next);
});

app.get('/', (req, res) => res.json({ message: 'URL Shortener API' }));

module.exports = app;

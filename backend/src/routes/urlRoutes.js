const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const urlController = require('../controllers/urlController');

// POST /api/shorten
router.post(
  '/shorten',
  [
    body('originalUrl').isURL().withMessage('originalUrl must be a valid URL'),
    body('customAlias').optional().isLength({ min: 2 }).withMessage('customAlias too short'),
  ],
  urlController.createShortUrl
);

// GET /api/urls - list with pagination
router.get('/urls', [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1 })], urlController.getUrls);

// GET /api/urls/:shortCode/analytics
router.get('/urls/:shortCode/analytics', [param('shortCode').exists()], urlController.getAnalytics);

// DELETE /api/urls/:shortCode
router.delete('/urls/:shortCode', [param('shortCode').exists()], urlController.deleteUrl);

module.exports = router;

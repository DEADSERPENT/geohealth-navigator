// src/routing/routes.js
const express = require('express');
const { estimateRoute } = require('./controller');

const router = express.Router();

// POST /api/routing/estimate
router.post('/estimate', estimateRoute);

module.exports = router;

const express = require('express');
const { register, login, verifyToken } = require('./controller');

const router = express.Router();

// Prefix all routes with /v1
const version = '/v1';

// Public routes
router.post(`${version}/auth/register`, register);
router.post(`${version}/auth/login`, login);

// Protected route
router.get(`${version}/auth/verify`, verifyToken);

module.exports = router;

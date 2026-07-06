const express = require('express');
const router = express.Router();

// Import the controller functions
const testController = require('../controllers/test.controller');

// Define testing routes (e.g., /api/finnhub, /api/tavily, /api/edgar)
router.get('/finnhub', testController.testFinnhub);
router.get('/tavily', testController.testTavily);
router.get('/edgar', testController.testEdgar);

module.exports = router;

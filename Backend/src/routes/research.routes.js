const express = require('express');
const router = express.Router();

// Import the production controller
const researchController = require('../controllers/research.controller');

// POST /api/research -> Run the investment research workflow
router.post('/research', researchController.researchCompany);

module.exports = router;

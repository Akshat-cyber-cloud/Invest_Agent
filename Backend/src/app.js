const express = require('express');
const cors = require('cors');

// Import production routers
const researchRoutes = require('./routes/research.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Root test endpoint to check server health
app.get('/test', (req, res) => {
    res.status(200).json({
        message: "Express app is configured"
    });
});

// Use routers under '/api' prefix (exposes POST /api/research)
app.use('/api', researchRoutes);

module.exports = app;
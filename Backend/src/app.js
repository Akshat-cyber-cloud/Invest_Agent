const express = require('express');
const cors = require('cors');

// Import our test router
const testRoutes = require('./routes/test.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Root test endpoint
app.get('/test', (req, res) => {
    res.status(200).json({
        message: "Express app is configured"
    });
});

app.use('/api', testRoutes);

module.exports = app;
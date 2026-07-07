process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Bypass SSL certificate verification issues for local testing
require('dotenv').config();

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

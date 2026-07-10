require('dotenv').config();
const finnhubService = require('../src/services/finnhub');

async function test() {
    const metrics = await finnhubService.getCompanyMetrics('AAPL');
    console.log("Returned metrics from finnhub service:", metrics);
    
    // Also let's fetch the raw data directly from the url to see all available metric keys
    const apiKey = process.env.FINNHUB_API_KEY;
    const url = "https://finnhub.io/api/v1/stock/metric?symbol=AAPL&metric=all&token=" + apiKey;
    const response = await fetch(url);
    const data = await response.json();
    console.log("Raw Finnhub metrics for AAPL (keys):", Object.keys(data.metric || {}).filter(k => k.toLowerCase().includes('pe') || k.toLowerCase().includes('val') || k.toLowerCase().includes('ratio')));
    console.log("Raw peBasicExclExtraItems:", data.metric ? data.metric.peBasicExclExtraItems : 'none');
    console.log("Raw peBasicExclExtraItemsTTM:", data.metric ? data.metric.peBasicExclExtraItemsTTM : 'none');
}

test();

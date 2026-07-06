const finnhubService = require('../services/finnhub');
const tavilyService = require('../services/tavily');
const edgarService = require('../services/edgar');

// Handler to test Finnhub API integration
async function testFinnhub(req, res) {
    const symbol = req.query.symbol;
    
    if (!symbol) {
        return res.status(400).json({ error: "Missing symbol query parameter (e.g., ?symbol=AAPL)" });
    }

    try {
        const profile = await finnhubService.getCompanyProfile(symbol);
        const metrics = await finnhubService.getCompanyMetrics(symbol);

        res.status(200).json({
            symbol: symbol.toUpperCase(),
            profile: profile,
            metrics: metrics
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch Finnhub data", details: error.message });
    }
}

// Handler to test Tavily API integration
async function testTavily(req, res) {
    const query = req.query.query;

    if (!query) {
        return res.status(400).json({ error: "Missing query parameter (e.g., ?query=Apple)" });
    }

    try {
        const news = await tavilyService.getCompanyNews(query);
        res.status(200).json({
            query: query,
            news: news
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch Tavily data", details: error.message });
    }
}

// Handler to test SEC EDGAR integration
async function testEdgar(req, res) {
    const symbol = req.query.symbol;

    if (!symbol) {
        return res.status(400).json({ error: "Missing symbol query parameter (e.g., ?symbol=AAPL)" });
    }

    try {
        const filingData = await edgarService.getLatest10K(symbol);
        res.status(200).json({
            symbol: symbol.toUpperCase(),
            filing: filingData
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch SEC EDGAR data", details: error.message });
    }
}

module.exports = {
    testFinnhub,
    testTavily,
    testEdgar
};

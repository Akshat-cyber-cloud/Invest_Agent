require('dotenv').config();
const finnhubService = require('../src/services/finnhub');
const tavilyService = require('../src/services/tavily');
const edgarService = require('../src/services/edgar');
const { agentApp } = require('../src/services/agent');

async function run() {
    const symbol = 'RELIANCE';
    console.log("Fetching data for RELIANCE...");
    const profile = await finnhubService.getCompanyProfile(symbol);
    const metrics = await finnhubService.getCompanyMetrics(symbol);
    const companyName = (profile && profile.name) ? profile.name : symbol;
    const [news, filing] = await Promise.all([
        tavilyService.getCompanyNews(companyName),
        edgarService.getLatest10K(companyName)
    ]);

    console.log("Initial state metrics:", metrics);
    console.log("Initial state news articles count:", news.length);
    console.log("Initial state filing:", filing);

    const initialGraphState = {
        symbol: symbol.toUpperCase(),
        companyName: companyName,
        financialData: metrics,
        newsData: news,
        filingData: filing
    };

    console.log("Running LangGraph workflow...");
    const result = await agentApp.invoke(initialGraphState);
    console.log("Result State:", JSON.stringify(result, null, 2));
}

run().catch(console.error);

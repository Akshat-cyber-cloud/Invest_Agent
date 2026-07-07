const finnhubService = require('../services/finnhub');
const tavilyService = require('../services/tavily');
const edgarService = require('../services/edgar');
const { agentApp } = require('../services/agent');

// Main controller function to research a company and run the agent decision pipeline
async function researchCompany(req, res) {
    // We check both the body (for POST) and the query parameters (for GET/testing)
    const symbol = req.body.symbol || req.query.symbol;

    if (!symbol) {
        console.log("❌ [Server] Research failed: Missing ticker symbol");
        return res.status(400).json({ error: "Missing symbol. Please provide a stock symbol (e.g., AAPL)." });
    }

    try {
        console.log("========================================");
        console.log("🚀 [Server] Starting investment research for: " + symbol.toUpperCase());
        console.log("========================================");

        // Step 1: Fetch company metrics and details from Finnhub
        console.log("📊 [Server] Fetching Finnhub financials...");
        const profile = await finnhubService.getCompanyProfile(symbol);
        const metrics = await finnhubService.getCompanyMetrics(symbol);

        // Fall back to the symbol if the profile name isn't found
        const companyName = (profile && profile.name) ? profile.name : symbol;

        // Step 2: Fetch news articles and annual report URL in parallel to save time
        console.log("🕸️ [Server] Fetching Tavily news and searching for report PDF...");
        const [news, filing] = await Promise.all([
            tavilyService.getCompanyNews(companyName),
            edgarService.getLatest10K(companyName)
        ]);

        // Step 3: Run the Multi-Agent LangGraph workflow
        console.log("🧠 [Server] Initializing LangGraph multi-agent flow...");
        const initialGraphState = {
            symbol: symbol.toUpperCase(),
            companyName: companyName,
            financialData: metrics,
            newsData: news,
            filingData: filing
        };

        // Running the workflow compiled in agent.js
        const resultState = await agentApp.invoke(initialGraphState);

        console.log("✨ [Server] Workflow completed! Sending results back to the user.");
        console.log("========================================");

        // Step 4: Respond with a consolidated JSON report
        res.status(200).json({
            symbol: symbol.toUpperCase(),
            companyName: companyName,
            profile: profile,
            rawData: {
                metrics: metrics,
                news: news,
                filing: filing
            },
            agentAnalyses: {
                financialAnalysis: resultState.financialAnalysis,
                newsAnalysis: resultState.newsAnalysis,
                riskAnalysis: resultState.riskAnalysis
            },
            decision: resultState.decision
        });

    } catch (error) {
        console.error("❌ [Server] Error in research pipeline:", error.message);
        res.status(500).json({ 
            error: "Failed to run investment research workflow", 
            details: error.message 
        });
    }
}

module.exports = {
    researchCompany
};

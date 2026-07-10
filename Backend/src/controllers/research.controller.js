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

        let targetSymbol = symbol.trim().toUpperCase();

        // Ticker Resolution: If it contains spaces or is longer than 4 chars, query Finnhub to resolve to a stock symbol
        if (targetSymbol.includes(" ") || targetSymbol.length > 4) {
            console.log(`🔍 [Server] Resolving name "${targetSymbol}" to stock ticker...`);
            const searchResults = await finnhubService.searchSymbol(targetSymbol);
            if (searchResults && searchResults.result && searchResults.result.length > 0) {
                // Find best stock symbol match (Common Stock or ADR)
                const exactSymbolMatch = searchResults.result.find(r => 
                    r.symbol.toUpperCase().replace(/\.[A-Z]+$/, '') === targetSymbol && 
                    (r.type === "Common Stock" || r.type === "ADR")
                );

                const prefixSymbolMatch = searchResults.result.find(r => 
                    r.symbol.toUpperCase().startsWith(targetSymbol) && 
                    (r.type === "Common Stock" || r.type === "ADR")
                );

                const commonStockMatch = searchResults.result.find(r => 
                    r.type === "Common Stock" || r.type === "ADR"
                );

                const bestMatch = exactSymbolMatch || prefixSymbolMatch || commonStockMatch || searchResults.result[0];
                targetSymbol = bestMatch.symbol;
                console.log(`🎯 [Server] Resolved to ticker: ${targetSymbol} (Type: ${bestMatch.type || 'N/A'}, Desc: ${bestMatch.description || 'N/A'})`);
            }
        }

        // Step 1: Fetch company metrics and details from Finnhub
        console.log("📊 [Server] Fetching Finnhub financials...");
        const profile = await finnhubService.getCompanyProfile(targetSymbol);
        let metrics = await finnhubService.getCompanyMetrics(targetSymbol);

        // Fall back to the symbol if the profile name isn't found
        const companyName = (profile && profile.name) ? profile.name : targetSymbol;

        // Step 2: Fetch news articles, annual report URL, and reputation reviews in parallel to save time
        console.log("🕸️ [Server] Fetching Tavily news, trust reputation, and SEC report PDF...");
        let [news, filing, trust] = await Promise.all([
            tavilyService.getCompanyNews(companyName),
            edgarService.getLatest10K(companyName),
            tavilyService.getCompanyTrustAndReviews(companyName)
        ]);

        // Fallback for SEC filings: If filing is null, search Tavily for risks
        if (!filing || !filing.snippet) {
            console.log(`🔍 [Server] SEC filings unavailable for ${companyName}. Falling back to Tavily risk search...`);
            const riskSearch = await tavilyService.searchCompanyRisks(companyName);
            filing = {
                title: "Public Risk Analysis (Web Search)",
                secUrl: "N/A",
                snippet: riskSearch || "No risk reports or challenges found."
            };
        }

        // Fallback for Financial Metrics: If Finnhub metrics are missing, search Tavily for financials
        const hasFinancials = metrics && (metrics.peRatio !== undefined || metrics.netProfitMargin !== undefined || metrics.eps !== undefined);
        if (!hasFinancials) {
            console.log(`🔍 [Server] Finnhub financials unavailable for ${companyName}. Falling back to Tavily financials search...`);
            const financialSearch = await tavilyService.searchCompanyFinancials(companyName);
            metrics = {
                ...metrics,
                tavilyFinancialsSnippet: financialSearch || "No public financial performance metrics found."
            };
        }

        // Step 3: Run the Multi-Agent LangGraph workflow
        console.log("🧠 [Server] Initializing LangGraph multi-agent flow...");
        const initialGraphState = {
            symbol: targetSymbol.toUpperCase(),
            companyName: companyName,
            financialData: metrics,
            newsData: news,
            filingData: filing,
            trustData: trust
        };

        // Running the workflow compiled in agent.js
        const resultState = await agentApp.invoke(initialGraphState);

        console.log("✨ [Server] Workflow completed! Sending results back to the user.");
        console.log("========================================");

        // Step 4: Respond with a consolidated JSON report
        res.status(200).json({
            symbol: targetSymbol.toUpperCase(),
            companyName: companyName,
            profile: profile,
            companyMetrics: {
                peRatio: (metrics && metrics.peRatio !== undefined) ? metrics.peRatio : 'N/A',
                profitMargin: (metrics && metrics.netProfitMargin !== undefined) ? metrics.netProfitMargin : 'N/A',
                eps: (metrics && metrics.eps !== undefined) ? metrics.eps : 'N/A',
                high52: (metrics && metrics.high52Week !== undefined) ? metrics.high52Week : 'N/A',
                low52: (metrics && metrics.low52Week !== undefined) ? metrics.low52Week : 'N/A'
            },
            companyNews: news,
            filingData: filing,
            agentAnalyses: {
                financialAnalysis: resultState.financialAnalysis,
                newsAnalysis: resultState.newsAnalysis,
                riskAnalysis: resultState.riskAnalysis,
                trustAnalysis: resultState.trustAnalysis
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

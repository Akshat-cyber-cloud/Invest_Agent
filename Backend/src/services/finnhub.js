// Get API key from environment variables
const apiKey = process.env.FINNHUB_API_KEY;

// Function to fetch company basic profile
async function getCompanyProfile(symbol) {
    const url = "https://finnhub.io/api/v1/stock/profile2?symbol=" + symbol + "&token=" + apiKey;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log("Error in getCompanyProfile:", error);
        return null;
    }
}

// Function to fetch company financial metrics (like PE ratio, EPS)
async function getCompanyMetrics(symbol) {
    const url = "https://finnhub.io/api/v1/stock/metric?symbol=" + symbol + "&metric=all&token=" + apiKey;

    try {
        const response = await fetch(url);
        const data = await response.json();
        // Grab the metrics object inside the returned data
        const metrics = data.metric;
        if (!metrics) {
            console.log("⚠️ No metrics returned from Finnhub for symbol: " + symbol);
            return null;
        }
        
        // Build a simple object with only the metrics we need
        const result = {
            peRatio: metrics.peBasicExclExtraItems || 'N/A',
            eps: metrics.epsBasicExclExtraItemsAnnual || 'N/A',
            netProfitMargin: metrics.netProfitMarginAnnual || 'N/A',
            debtToEquity: metrics["totalDebt/totalEquity"] || 'N/A',
            high52Week: metrics["52WeekHigh"] || 'N/A',
            low52Week: metrics["52WeekLow"] || 'N/A'
        };
        
        return result;
    } catch (error) {
        console.log("Error in getCompanyMetrics:", error);
        return null;
    }
}

// Function to search for symbols matching a text query
async function searchSymbol(query) {
    const url = "https://finnhub.io/api/v1/search?q=" + encodeURIComponent(query) + "&token=" + apiKey;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log("Error in searchSymbol:", error);
        return null;
    }
}

module.exports = {
    getCompanyProfile,
    getCompanyMetrics,
    searchSymbol
};

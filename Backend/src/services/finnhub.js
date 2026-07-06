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
        
        // Build a simple object with only the metrics we need
        const result = {
            peRatio: metrics.peBasicExclExtraItems,
            eps: metrics.epsBasicExclExtraItemsAnnual,
            netProfitMargin: metrics.netProfitMarginAnnual,
            debtToEquity: metrics["totalDebt/totalEquity"],
            high52Week: metrics["52WeekHigh"],
            low52Week: metrics["52WeekLow"]
        };
        
        return result;
    } catch (error) {
        console.log("Error in getCompanyMetrics:", error);
        return null;
    }
}

module.exports = {
    getCompanyProfile,
    getCompanyMetrics
};

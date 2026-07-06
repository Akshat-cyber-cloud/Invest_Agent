// We use Tavily to search for the company's annual report/filings
const apiKey = process.env.TAVILY_API_KEY;

async function getLatest10K(symbol) {
    const url = "https://api.tavily.com/search";
    
    // This query searches for the latest annual report PDF of the company
    const query = symbol + " latest annual report 10-K filing PDF";
    
    const requestBody = {
        api_key: apiKey,
        query: query,
        search_depth: "advanced",
        max_results: 3
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        const results = data.results || [];
        
        if (results.length === 0) {
            console.log("No annual report link found for symbol:", symbol);
            return null;
        }

        // We return the top result (title, URL, and a snippet)
        return {
            title: results[0].title,
            secUrl: results[0].url, // We keep the property name 'secUrl' so our controller doesn't break!
            snippet: results[0].content
        };
    } catch (error) {
        console.log("Error in getLatest10K (Tavily fallback):", error);
        return null;
    }
}

module.exports = {
    getLatest10K
};

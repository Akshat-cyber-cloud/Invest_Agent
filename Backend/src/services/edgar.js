// Read the Tavily API key from environment variables
const apiKey = process.env.TAVILY_API_KEY;

// This function searches the web using Tavily to find the latest annual report PDF of the company
async function getLatest10K(symbol) {
    const url = "https://api.tavily.com/search";
    
    // Search query designed to find the annual report PDF
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

        // If the server returns an HTTP error code, print the error text
        if (!response.ok) {
            const errText = await response.text();
            console.log("Tavily API returned error status:", response.status, errText);
            return null;
        }

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            const rawText = await response.text();
            console.log("Tavily response was not valid JSON. Body:", rawText.substring(0, 500));
            return null;
        }

        const results = data.results || [];
        
        if (results.length === 0) {
            console.log("No annual report link found for symbol:", symbol);
            return null;
        }

        // Return the best match (title, URL, and a snippet of text content)
        return {
            title: results[0].title,
            secUrl: results[0].url, 
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

// Get API key from environment variables
const apiKey = process.env.TAVILY_API_KEY;

// Function to search for news using Tavily
async function getCompanyNews(companyName) {
    const url = "https://api.tavily.com/search";
    
    // The request body we need to send to the Tavily API
    const requestBody = {
        api_key: apiKey,
        query: companyName + " latest financial news and performance",
        search_depth: "advanced",
        max_results: 5
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

        // Safely check if results exist, otherwise default to an empty array
        const results = data.results || [];
        if (!data.results) {
            console.log("Tavily API warning: No results returned. Response was:", data);
        }
        
        // Standard loop to extract only title, url, and content
        const articles = [];
        for (let i = 0; i < results.length; i++) {
            const item = results[i];
            articles.push({
                title: item.title,
                url: item.url,
                content: item.content
            });
        }

        return articles;
    } catch (error) {
        console.log("Error in getCompanyNews:", error);
        return [];
    }
}

module.exports = {
    getCompanyNews
};

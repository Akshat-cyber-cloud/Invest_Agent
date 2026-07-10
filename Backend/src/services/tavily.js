// Read the Tavily API key from environment variables
const apiKey = process.env.TAVILY_API_KEY;

// This function searches the web using Tavily to get recent news articles about a company
async function getCompanyNews(companyName) {
    const url = "https://api.tavily.com/search";
    
    // We search for recent financial news and performance articles
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

        // If the server returns an HTTP error code, print the error text
        if (!response.ok) {
            const errText = await response.text();
            console.log("Tavily API (News) returned error status:", response.status, errText);
            return [];
        }

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            const rawText = await response.text();
            console.log("Tavily response (News) was not valid JSON. Body snippet:", rawText.substring(0, 500));
            return [];
        }

        const results = data.results || [];
        
        // Loop through the results and grab only the title, link, and content snippet of the top 5 articles
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

// This function searches for trust, customer reviews, and brand reputation of the company
async function getCompanyTrustAndReviews(companyName) {
    const url = "https://api.tavily.com/search";
    
    const requestBody = {
        api_key: apiKey,
        query: companyName + " customer reviews brand reputation rating employee glassdoor trustability",
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

        if (!response.ok) {
            const errText = await response.text();
            console.log("Tavily API (Trust) returned error status:", response.status, errText);
            return [];
        }

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            return [];
        }

        const results = data.results || [];
        const items = [];
        for (let i = 0; i < results.length; i++) {
            const item = results[i];
            items.push({
                title: item.title,
                url: item.url,
                content: item.content
            });
        }
        return items;
    } catch (error) {
        console.log("Error in getCompanyTrustAndReviews:", error);
        return [];
    }
}

module.exports = {
    getCompanyNews,
    getCompanyTrustAndReviews
};

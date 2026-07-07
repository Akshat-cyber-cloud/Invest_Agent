require('dotenv').config();

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log("Please make sure GEMINI_API_KEY is in your .env file!");
        return;
    }

    console.log("Checking models for API key...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        
        if (data.error) {
            console.error("API Error:", data.error.message);
            return;
        }

        console.log("\nAvailable Models for your key:");
        const models = data.models || [];
        for (let i = 0; i < models.length; i++) {
            const m = models[i];
            if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                console.log("- " + m.name.replace("models/", "") + " (" + m.displayName + ")");
            }
        }
    } catch (error) {
        console.error("Request failed:", error.message);
    }
}

run();

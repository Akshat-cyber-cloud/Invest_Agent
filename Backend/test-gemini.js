require('dotenv').config();
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0
});

async function run() {
    console.log("Using API Key:", process.env.GEMINI_API_KEY ? "Loaded (starts with " + process.env.GEMINI_API_KEY.slice(0, 10) + ")" : "NOT Loaded");
    try {
        console.log("Invoking LLM...");
        const response = await llm.invoke("Hello, say 'API is working'!");
        console.log("Success! Response:", response.content);
    } catch (err) {
        console.error("LLM Error:", err);
    }
}

run();

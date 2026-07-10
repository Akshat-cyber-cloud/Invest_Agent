const { ChatGroq } = require("@langchain/groq");
const { StateGraph, Annotation } = require("@langchain/langgraph");

// Initialize the Groq LLM model
const llm = new ChatGroq({
    model: "llama-3.1-8b-instant", // Using 8B model which has higher token limits and is extremely fast!
    apiKey: process.env.GROQ_API_KEY,
    temperature: 0
});

// Helper function to call the model with a retry in case of temporary rate limits (429)
async function callModel(prompt) {
    for (let i = 0; i < 3; i++) {
        try {
            return await llm.invoke(prompt);
        } catch (err) {
            const errString = String(err).toLowerCase();
            const errText = err.message ? err.message.toLowerCase() : "";
            const isRateLimit = errString.includes("429") || errString.includes("rate") || errString.includes("limit") ||
                                errText.includes("429") || errText.includes("rate") || errText.includes("limit");
                                
            if (isRateLimit && i < 2) {
                console.log(`⚠️ Rate limit hit. Retrying in 2 seconds (Attempt ${i + 1}/3)...`);
                await new Promise(r => setTimeout(r, 2000));
            } else {
                throw err;
            }
        }
    }
}

// 1. Defining the shared State object. 
// Think of this as a shared notepad where all agents can write down their findings.
const StateAnnotation = Annotation.Root({
    symbol: Annotation(),
    companyName: Annotation(),
    financialData: Annotation(),
    newsData: Annotation(),
    filingData: Annotation(),
    trustData: Annotation(),

    // These variables hold the summaries written by each specialist agent
    financialAnalysis: Annotation(),
    newsAnalysis: Annotation(),
    riskAnalysis: Annotation(),
    trustAnalysis: Annotation(),

    // This holds the final recommendation, score, and reasoning    
    decision: Annotation()
});

// 2. Defining the Agent Functions (called Nodes in LangGraph)

// Agent 1: Analyzes the numbers and financials
async function financialAgentNode(state) {
    console.log("💰 [Financial Agent] Starting analysis for " + state.symbol);
    
    const prompt = `You are a friendly financial advisor. Read these metrics for ${state.symbol}:
    Metrics: ${JSON.stringify(state.financialData)}
    
    Write exactly 2-3 extremely short, jargon-free bullet points summarizing the financials.
    - Keep each bullet point under 12 words.
    - Explain metrics simply (e.g. instead of P/E ratios or margins, say "earning good profits" or "healthy margins").
    - Write for a complete beginner.`;

    try {
        const response = await callModel(prompt);
        console.log("💰 [Financial Agent] Analysis complete!");
        return { financialAnalysis: response.content };
    } catch (err) {
        console.log("💰 [Financial Agent] Error occurred:", err.message);
        return { financialAnalysis: "Failed to analyze financials." };
    }
}

// Agent 2: Analyzes the news and public opinion
async function newsAgentNode(state) {
    console.log("📰 [News Agent] Reading news sentiment for " + state.symbol);
    
    const prompt = `You are a news summarizer. Read these recent news articles about ${state.symbol}:
    News: ${JSON.stringify(state.newsData)}
    
    Write exactly 2-3 extremely short, jargon-free bullet points summarizing the news and the mood (positive/negative).
    - Keep each bullet point under 12 words.
    - Avoid technical business terms.
    - Write in simple, everyday English.`;

    try {
        const response = await callModel(prompt);
        console.log("📰 [News Agent] Analysis complete!");
        return { newsAnalysis: response.content };
    } catch (err) {
        console.log("📰 [News Agent] Error occurred:", err.message);
        return { newsAnalysis: "Failed to analyze news." };
    }
}

// Agent 3: Analyzes risks in company reports
async function riskAgentNode(state) {
    console.log("⚠️ [Risk Agent] Checking report risks for " + state.symbol);
    
    const prompt = `You are a risk advisor. Read these annual report details:
    Filings: ${JSON.stringify(state.filingData)}
    
    Write exactly 2-3 extremely short, jargon-free bullet points listing key risks/problems.
    - Keep each bullet point under 12 words.
    - Avoid legal/compliance jargon (e.g. instead of regulatory compliance, say "changing government rules").
    - Write simply for an ordinary person.`;

    try {
        const response = await callModel(prompt);
        console.log("⚠️ [Risk Agent] Analysis complete!");
        return { riskAnalysis: response.content };
    } catch (err) {
        console.log("⚠️ [Risk Agent] Error occurred:", err.message);
        return { riskAnalysis: "Failed to analyze risks." };
    }
}

// Agent: Analyzes customer trust, reviews, and reputation
async function trustAgentNode(state) {
    console.log("👥 [Trust Agent] Analyzing public opinion and reputation for " + state.symbol);
    
    const prompt = `You are a public reputation researcher. Read these search results about consumer/employee trust and reputation for ${state.symbol}:
    Data: ${JSON.stringify(state.trustData)}
    
    Write exactly 2-3 extremely short, jargon-free bullet points summarizing consumer ratings, public trust, and reputational factors.
    - Keep each bullet point under 12 words.
    - Focus on customer reviews, employee satisfaction, brand credibility, and trustworthiness.
    - Write simply for a beginner.`;

    try {
        const response = await callModel(prompt);
        console.log("👥 [Trust Agent] Analysis complete!");
        return { trustAnalysis: response.content };
    } catch (err) {
        console.log("👥 [Trust Agent] Error occurred:", err.message);
        return { trustAnalysis: "Failed to analyze trust." };
    }
}

// Agent 4: Combines all summaries and makes the final decision
async function decisionAgentNode(state) {
    console.log("🤖 [Decision Agent] Reviewing all summaries to make a final decision...");
    
    const financialSummary = state.financialAnalysis && !state.financialAnalysis.includes("Failed to analyze financials") 
        ? state.financialAnalysis 
        : "No financial metrics or raw profiles available.";
        
    const newsSummary = state.newsAnalysis && !state.newsAnalysis.includes("Failed to analyze news") 
        ? state.newsAnalysis 
        : "No recent news reports available.";
        
    const riskSummary = state.riskAnalysis && !state.riskAnalysis.includes("Failed to analyze risks") 
        ? state.riskAnalysis 
        : "No direct SEC filing or risk report details available.";

    const trustSummary = state.trustAnalysis && !state.trustAnalysis.includes("Failed to analyze trust") 
        ? state.trustAnalysis 
        : "No direct customer trust or reputation details available.";

    const prompt = `You are the lead investor. Look at these reports for ${state.symbol}:
    
    Financial Report:
    ${financialSummary}
    
    News Report:
    ${newsSummary}
    
    Risk Report:
    ${riskSummary}
    
    Reputation & Trust Report:
    ${trustSummary}
    
    Make a final investment decision (recommendation 'Invest', 'Hold', or 'Pass', and a score 0-100).
    - If a company's public financial metrics/filings are missing or N/A (e.g. private companies, or non-US tickers), but there is positive news (like strong revenue growth, capital funding, etc.), do NOT default to Pass/0. Instead, recommend 'Hold' and give a moderate score (e.g. 50-70/100) reflecting the growth potential from news sentiment, while flagging the lack of official financials.
    - If there is absolutely no news, financials, or SEC filings (e.g. completely invalid company), recommend 'Pass' and set the score to 0.

    Also, extract 3-5 critical 'highlights' (important takeaways) that an investor MUST read before deciding to invest. Each highlight must have:
    - 'text': the takeaway sentence (must be short, informative, and concrete).
    - 'type': one of 'positive' (for strengths/growth), 'negative' (for risks/cons), or 'warning' (for missing/unverifiable crucial info).

    Rules for highlights:
    1. If key financial metrics or direct SEC filings are missing/unavailable, you MUST add a highlight of type 'warning' stating this clearly.
    2. Extract key positive stories or growth numbers (e.g. GMV, revenue increases, capital raised) as type 'positive'.
    3. Extract major risk warnings as type 'negative'.
    
    You MUST return a JSON object in this exact format (no other text or markdown wrapping outside of standard JSON):
    {
       "recommendation": "Invest" | "Hold" | "Pass",
       "score": a number from 0 to 100,
       "reasoning": "A short 1-2 sentence explanation of your decision",
       "highlights": [
          { "type": "positive" | "negative" | "warning", "text": "takeaway sentence" },
          ...
       ]
    }`;

    try {
        const response = await callModel(prompt);
        let text = response.content;
        
        // If the AI wraps the JSON in ```json ... ```, we extract the text inside
        if (text.includes("```json")) {
            text = text.split("```json")[1].split("```")[0];
        } else if (text.includes("```")) {
            text = text.split("```")[1].split("```")[0];
        }
        
        const parsedDecision = JSON.parse(text.trim());
        
        // Ensure highlights exists
        if (!parsedDecision.highlights || !Array.isArray(parsedDecision.highlights)) {
            parsedDecision.highlights = [];
        }
        
        console.log("🤖 [Decision Agent] Recommendation: " + parsedDecision.recommendation + " (Score: " + parsedDecision.score + ")");
        return { decision: parsedDecision };
    } catch (error) {
        console.log("🤖 [Decision Agent] Error parsing JSON decision from LLM:", error.message);
        
        // Fallback in case of parsing errors
        const fallbackHighlights = [];
        if (!state.financialAnalysis || state.financialAnalysis.includes("Failed to analyze financials")) {
            fallbackHighlights.push({ type: "warning", text: "Structured financial metrics are unavailable." });
        }
        if (!state.riskAnalysis || state.riskAnalysis.includes("Failed to analyze risks")) {
            fallbackHighlights.push({ type: "warning", text: "No direct SEC filings were retrieved." });
        }
        
        return {
            decision: {
                recommendation: "Pass",
                score: 0,
                reasoning: "Error analyzing and parsing the final decision.",
                highlights: fallbackHighlights
            }
        };
    }
}

// 3. Connecting the agents together (Wiring the LangGraph)
const workflow = new StateGraph(StateAnnotation)
    // Register our agent functions
    .addNode("financialAgent", financialAgentNode)
    .addNode("newsAgent", newsAgentNode)
    .addNode("riskAgent", riskAgentNode)
    .addNode("trustAgent", trustAgentNode)
    .addNode("decisionAgent", decisionAgentNode)

    // Parallel Execution: Run all specialist agents at the same time
    .addEdge("__start__", "financialAgent")
    .addEdge("__start__", "newsAgent")
    .addEdge("__start__", "riskAgent")
    .addEdge("__start__", "trustAgent")

    // Fan-In: Wait for all agents to finish, then send their reports to the Decision Agent
    .addEdge("financialAgent", "decisionAgent")
    .addEdge("newsAgent", "decisionAgent")
    .addEdge("riskAgent", "decisionAgent")
    .addEdge("trustAgent", "decisionAgent")

    // End the workflow after the decision is made
    .addEdge("decisionAgent", "__end__");

// 4. Compiling the workflow into a runnable app
const agentApp = workflow.compile();

module.exports = {
    agentApp
};

const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { StateGraph, Annotation } = require("@langchain/langgraph");

// This starts the Gemini AI model (it reads the GEMINI_API_KEY from your .env file)
const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0
});

// 1. Defining the shared State object. 
// Think of this as a shared notepad where all agents can write down their findings.
const StateAnnotation = Annotation.Root({
    symbol: Annotation(),
    companyName: Annotation(),
    financialData: Annotation(),
    newsData: Annotation(),
    filingData: Annotation(),

    // These variables hold the summaries written by each specialist agent
    financialAnalysis: Annotation(),
    newsAnalysis: Annotation(),
    riskAnalysis: Annotation(),

    // This holds the final recommendation, score, and reasoning
    decision: Annotation()
});

// 2. Defining the Agent Functions (called Nodes in LangGraph)

// Agent 1: Analyzes the numbers and financials
async function financialAgentNode(state) {
    console.log("💰 [Financial Agent] Starting analysis for " + state.symbol);
    
    const prompt = `You are a financial analyst. Read these financial metrics for ${state.symbol}:
    Metrics: ${JSON.stringify(state.financialData)}
    
    Write 3-4 bullet points summarizing the company's financial health. Discuss P/E ratio, margins, and strength.`;

    try {
        const response = await llm.invoke(prompt);
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
    
    const prompt = `You are a news reporter. Read these recent news articles about ${state.symbol}:
    News: ${JSON.stringify(state.newsData)}
    
    Write 3-4 bullet points summarizing recent events and if the news mood is positive, negative, or neutral.`;

    try {
        const response = await llm.invoke(prompt);
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
    
    const prompt = `You are a risk management officer. Read these annual report details:
    Filings: ${JSON.stringify(state.filingData)}
    
    Write 3-4 bullet points listing the main risks or problems this company faces.`;

    try {
        const response = await llm.invoke(prompt);
        console.log("⚠️ [Risk Agent] Analysis complete!");
        return { riskAnalysis: response.content };
    } catch (err) {
        console.log("⚠️ [Risk Agent] Error occurred:", err.message);
        return { riskAnalysis: "Failed to analyze risks." };
    }
}

// Agent 4: Combines all summaries and makes the final decision
async function decisionAgentNode(state) {
    console.log("🤖 [Decision Agent] Reviewing all summaries to make a final decision...");
    
    const prompt = `You are the lead investor. Look at these three reports for ${state.symbol}:
    
    Financial Report:
    ${state.financialAnalysis}
    
    News Report:
    ${state.newsAnalysis}
    
    Risk Report:
    ${state.riskAnalysis}
    
    Make a final decision. You MUST return a JSON object in this exact format (no other text):
    {
       "recommendation": "Invest" or "Pass",
       "score": a number from 0 to 100,
       "reasoning": "A short 1-2 sentence explanation of your decision"
    }`;

    try {
        const response = await llm.invoke(prompt);
        let text = response.content;
        
        // If the AI wraps the JSON in ```json ... ```, we extract the text inside
        if (text.includes("```json")) {
            text = text.split("```json")[1].split("```")[0];
        } else if (text.includes("```")) {
            text = text.split("```")[1].split("```")[0];
        }
        
        const parsedDecision = JSON.parse(text.trim());
        console.log("🤖 [Decision Agent] Recommendation: " + parsedDecision.recommendation + " (Score: " + parsedDecision.score + ")");
        return { decision: parsedDecision };
    } catch (error) {
        console.log("🤖 [Decision Agent] Error parsing JSON decision from LLM:", error.message);
        return {
            decision: {
                recommendation: "Pass",
                score: 0,
                reasoning: "Error parsing final decision."
            }
        };
    }
}

// 3. Connecting the agents together (Wiring the LangGraph)
const workflow = new StateGraph(StateAnnotation)
    // Register our 4 agent functions
    .addNode("financialAgent", financialAgentNode)
    .addNode("newsAgent", newsAgentNode)
    .addNode("riskAgent", riskAgentNode)
    .addNode("decisionAgent", decisionAgentNode)

    // Parallel Execution: Run Agent 1, 2, and 3 at the same time
    .addEdge("__start__", "financialAgent")
    .addEdge("__start__", "newsAgent")
    .addEdge("__start__", "riskAgent")

    // Fan-In: Wait for all 3 agents to finish, then send their reports to the Decision Agent
    .addEdge("financialAgent", "decisionAgent")
    .addEdge("newsAgent", "decisionAgent")
    .addEdge("riskAgent", "decisionAgent")

    // End the workflow after the decision is made
    .addEdge("decisionAgent", "__end__");

// 4. Compiling the workflow into a runnable app
const agentApp = workflow.compile();

module.exports = {
    agentApp
};

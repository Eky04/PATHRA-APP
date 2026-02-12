const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Using API Key:", process.env.GEMINI_API_KEY ? "Present" : "Missing");

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a direct listModels method on the client instance in some versions, 
        // but usually we can check by trying a simple prompt or using the model manager if exposed.
        // Actually, newer SDKs don't expose listModels easily in the node entry point without importing GoogleGenerativeAI via specific path or using REST.

        // Let's try a simple generation with a known stable model to verify connectivity first.
        console.log("Testing gemini-1.5-flash...");
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-1.5-flash:", result.response.text());
    } catch (error) {
        console.error("Error with gemini-1.5-flash:", error.message);

        try {
            console.log("Testing gemini-pro...");
            const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
            const resultPro = await modelPro.generateContent("Hello");
            console.log("Success with gemini-pro:", resultPro.response.text());
        } catch (e) {
            console.error("Error with gemini-pro:", e.message);
        }
    }
}

listModels();

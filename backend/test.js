// Import the service you just built
const { callGemini } = require('./GeminiService');

async function runTest() {
    console.log("🚀 Testing Gemini API Connection...");
    
    try {
        // A simple test prompt related to AuraFit
        const prompt = "Give me a quick, 1-sentence outfit recommendation for a chilly, rainy day.";
        
        // We use gemini-1.5-flash for quick text tasks [cite: 174]
        console.log("Sending prompt to Gemini...");
        const response = await callGemini('gemini-2.5-flash', prompt);
        
        console.log("\n✅ Success! Gemini says:");
        console.log("-----------------------------------");
        console.log(response);
        console.log("-----------------------------------");
        
    } catch (error) {
        console.error("\n❌ Test failed. Double-check your API key in the .env file.");
    }
}

// Execute the function
runTest();
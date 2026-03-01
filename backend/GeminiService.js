require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 1. Load the API key from the .env file
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please check your .env file.");
}

// 2. Create the singleton client instance
const genAI = new GoogleGenerativeAI(apiKey);

// Helper function to pause execution for the retry logic
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 3. The main wrapper function to call Gemini with retry logic
 * @param {string} modelName - 'gemini-1.5-flash' or 'gemini-1.5-pro'
 * @param {string} prompt - The text instructions for the AI
 * @param {object} [imageData] - Optional image data for Vision tasks
 * @param {number} maxRetries - Maximum number of attempts (default 3)
 */
async function callGemini(modelName, prompt, imageData = null, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Initialize the specified model
            const model = genAI.getGenerativeModel({ model: modelName });
            
            let result;
            if (imageData) {
                // If we have an image (like a selfie or clothing item)
                result = await model.generateContent([prompt, imageData]);
            } else {
                // Just text (like generating an outfit)
                result = await model.generateContent(prompt);
            }
            
            const response = await result.response;
            return response.text();

        } catch (error) {
            // Check if the error is a rate limit (429/RESOURCE_EXHAUSTED) or server issue (503)
            const errorMessage = error.message || "";
            const isRetryable = errorMessage.includes('503') || 
                                errorMessage.includes('RESOURCE_EXHAUSTED') || 
                                error.status === 503 || 
                                error.status === 429;
            
            if (isRetryable && attempt < maxRetries) {
                // Exponential backoff: 1s, 2s, 4s...
                const waitTime = Math.pow(2, attempt - 1) * 1000; 
                console.warn(`[Warning] Gemini API busy. Retrying in ${waitTime}ms (Attempt ${attempt} of ${maxRetries})...`);
                await delay(waitTime);
            } else {
                console.error("[Error] Gemini API call failed:", error);
                throw error; // If it's not retryable, or we ran out of attempts, throw the error
            }
        }
    }
}

// Export the function so other files can use it
module.exports = { callGemini };
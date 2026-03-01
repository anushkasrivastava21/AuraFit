const axios = require('axios');
const { callGemini } = require('./GeminiService');

// Helper function to fetch an image from a URL and convert it for Gemini
async function fetchImageFromUrl(url) {
    console.log(`\n🌐 Fetching image from: ${url}`);
    try {
        // We request the data as an 'arraybuffer' so we can convert it to Base64
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        
        // Get the content type (e.g., 'image/jpeg' or 'image/png')
        const mimeType = response.headers['content-type'];
        console.log(`✅ Successfully downloaded! Type: ${mimeType}`);

        // Convert the raw buffer into a Base64 string
        const base64Data = Buffer.from(response.data, 'binary').toString('base64');

        return {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            }
        };
    } catch (error) {
        console.error("❌ Failed to fetch image:", error.message);
        throw error;
    }
}

async function testUrlAnalysis() {
    try {
        // A direct link to a sample stock photo of a yellow jacket
        const testUrl = "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop";
        
        // 1. Fetch and convert the image
        const imagePart = await fetchImageFromUrl(testUrl);

        // 2. Ask Gemini to analyze the fetched image
        const prompt = "Describe this clothing item in one short sentence. What is it and what color is it?";
        
        console.log("\n🤖 Sending downloaded image to Gemini Vision...");
        const responseText = await callGemini('gemini-2.5-flash', prompt, imagePart);
        
        console.log("\n✅ AI Response:");
        console.log("-----------------------------------");
        console.log(responseText);
        console.log("-----------------------------------");

    } catch (error) {
        console.error("\n❌ Test failed.");
    }
}

testUrlAnalysis();
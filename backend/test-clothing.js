const fs = require('fs');
const { callGemini } = require('./GeminiService');

// Helper function to convert a local file into the format Gemini requires
function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType
        },
    };
}

async function testClothingAnalysis() {
    console.log("👕 Loading clothing image and sending to Gemini Vision...");

    try {
        // Load the image (Ensure 'sample-clothing.jpg' exists in your folder)
        const imagePart = fileToGenerativePart("sample-clothing.jpg", "image/jpeg");

        // Engineer the strict JSON prompt mapping to the PRD requirements
        const prompt = `
            You are an expert fashion cataloger and computer vision AI. 
            Analyze this clothing item photo and return ONLY a raw, valid JSON object. Do not include any markdown formatting like \`\`\`json.
            
            Extract the following attributes based on these specific rules:
            - category: Must be "Tops", "Bottoms", "Dresses/Jumpsuits", "Outerwear", "Footwear", or "Accessories"
            - subcategory: Specific item type (e.g., "T-shirt", "Jeans", "Blazer", "Sneakers")
            - color_primary: Approximate hex color code of the main color
            - color_secondary: Array of hex color codes for any secondary colors (empty array if none)
            - pattern: e.g., "Solid", "Striped", "Plaid", "Floral", "Graphic", "Abstract", "Animal Print"
            - formality_score: Integer from 1 to 5 (1 = very casual/lounge, 5 = formal/black tie)
            - season: Array of suitable seasons from ["Spring", "Summer", "Fall", "Winter", "All-season"]
            - material_inferred: String describing likely material (e.g., "Cotton", "Denim", "Leather", "Wool")

            Example output format:
            {
                "category": "Tops",
                "subcategory": "Graphic T-shirt",
                "color_primary": "#000000",
                "color_secondary": ["#FFFFFF", "#FF0000"],
                "pattern": "Graphic",
                "formality_score": 1,
                "season": ["Spring", "Summer", "All-season"],
                "material_inferred": "Cotton"
            }
        `;

        // Call the service using the Flash model for image analysis
        const responseText = await callGemini('gemini-2.5-flash', prompt, imagePart);
        
        console.log("\n✅ AI Analysis Complete! Raw JSON Output:");
        console.log("-----------------------------------");
        console.log(responseText);
        console.log("-----------------------------------");

        // Verify it's actually valid JSON by parsing it
        const parsedData = JSON.parse(responseText);
        console.log(`\n🎉 Successfully parsed JSON! Item identified as: ${parsedData.category} > ${parsedData.subcategory}`);

    } catch (error) {
        console.error("\n❌ Test failed. Did you name your image correctly?", error.message);
    }
}

testClothingAnalysis();
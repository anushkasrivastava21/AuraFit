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

async function testSelfieAnalysis() {
    console.log("📸 Loading image and sending to Gemini Vision...");

    try {
        // 1. Load the image
        // Make sure you have a file named 'sample-selfie.jpg' in your folder!
        const imagePart = fileToGenerativePart("sample-selfie.jpg", "image/jpeg");

        // 2. Engineer the strict JSON prompt
        // This explicitly maps to the fields required by the PRD
        const prompt = `
            You are an expert personal stylist and computer vision AI. 
            Analyze this selfie and return ONLY a raw, valid JSON object. Do not include any markdown formatting like \`\`\`json.
            
            Extract the following attributes and provide a confidence score (0.0 to 1.0) for each:
            - skin_tone_hex: Approximate hex color code [cite: 41, 364]
            - fitzpatrick_scale: I, II, III, IV, V, or VI [cite: 41, 364]
            - body_type: inferred category (e.g., pear, hourglass, rectangle, inverted triangle, apple) [cite: 42, 364]
            - face_shape: oval, round, square, heart, or oblong [cite: 43, 364]
            - hair_color: descriptive color [cite: 44, 364]
            - hair_length: short, medium, or long [cite: 44, 364]

            Example output format:
            {
                "skin_tone_hex": { "value": "#E0AC69", "confidence": 0.9 },
                "fitzpatrick_scale": { "value": "III", "confidence": 0.85 },
                "body_type": { "value": "rectangle", "confidence": 0.6 },
                "face_shape": { "value": "oval", "confidence": 0.9 },
                "hair_color": { "value": "dark brown", "confidence": 0.95 },
                "hair_length": { "value": "medium", "confidence": 0.9 }
            }
        `;

        // 3. Call the service using the Vision model
        const responseText = await callGemini('gemini-2.5-flash', prompt, imagePart);
        
        console.log("\n✅ AI Analysis Complete! Raw JSON Output:");
        console.log("-----------------------------------");
        console.log(responseText);
        console.log("-----------------------------------");

        // 4. Verify it's actually valid JSON by parsing it
        const parsedData = JSON.parse(responseText);
        console.log("\n🎉 Successfully parsed JSON! Skin tone detected:", parsedData.skin_tone_hex.value);

    } catch (error) {
        console.error("\n❌ Test failed. Did you name your image correctly?", error.message);
    }
}

testSelfieAnalysis();
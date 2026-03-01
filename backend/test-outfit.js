const { callGemini } = require('./GeminiService');

async function testOutfitGeneration() {
    console.log("🧠 Sending wardrobe data to Gemini Pro for outfit generation...");

    // 1. Mock Data: Simulate what we will eventually pull from the database
    const userProfile = {
        style_prefs: ["Casual", "Streetwear", "Minimalist"],
        skin_tone_hex: "#A07F62",
        body_type: "rectangle"
    };

    const wardrobe = [
        { id: "item_1", category: "Tops", subcategory: "Graphic T-shirt", color_primary: "#000000", formality_score: 1, season: ["Summer", "Spring"] },
        { id: "item_2", category: "Bottoms", subcategory: "Wide-leg Jeans", color_primary: "#87CEEB", formality_score: 2, season: ["All-season"] },
        { id: "item_3", category: "Footwear", subcategory: "Chunky Sneakers", color_primary: "#FFFFFF", formality_score: 1, season: ["All-season"] },
        { id: "item_4", category: "Outerwear", subcategory: "Oversized Blazer", color_primary: "#333333", formality_score: 4, season: ["Fall", "Winter"] },
        { id: "item_5", category: "Tops", subcategory: "Silk Camisole", color_primary: "#FFC0CB", formality_score: 3, season: ["Summer"] }
    ];

    const requestedMood = "Weekend Brunch";

    // 2. Engineer the complex prompt
    const prompt = `
        You are an expert personal stylist AI.
        
        User Profile: ${JSON.stringify(userProfile)}
        Wardrobe Inventory: ${JSON.stringify(wardrobe)}
        Requested Mood/Occasion: ${requestedMood}

        Task: Generate exactly 3 distinct complete outfit combinations from the provided Wardrobe Inventory that fit the Requested Mood/Occasion.

        Return ONLY a raw, valid JSON array containing exactly 3 objects. Do not include any markdown formatting like \`\`\`json.
        
        Each object must strictly follow this exact structure:
        {
            "outfit_name": "String (e.g., 'Casual Sunday Edge')",
            "item_ids": ["Array of string item IDs used in this outfit"],
            "styling_explanation": "A short, 1-sentence explanation of why these specific items work together for the user's profile and mood.",
            "confidence_score": Number between 0.0 and 1.0
        }
    `;

    try {
        // 3. Call the service using the PRO model!
        const responseText = await callGemini('gemini-2.5-flash', prompt);
        
        console.log("\n✅ Generation Complete! Raw JSON Output:");
        console.log("-----------------------------------");
        console.log(responseText);
        console.log("-----------------------------------");

        // 4. Verify the array parses correctly
        const parsedData = JSON.parse(responseText);
        console.log(`\n🎉 Successfully parsed JSON! Generated ${parsedData.length} outfits.`);
        console.log(`Outfit 1: "${parsedData[0].outfit_name}" using items:`, parsedData[0].item_ids);

    } catch (error) {
        console.error("\n❌ Test failed:", error.message);
    }
}

testOutfitGeneration();
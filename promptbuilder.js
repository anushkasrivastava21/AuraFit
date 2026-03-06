// PromptBuilder.js
// This file holds all the AI reasoning instructions for AuraFit

const PromptBuilder = {
    
    // 1. The Outfit Generator (From our test script today)
    buildOutfitGenerationPrompt: (userProfile, userWardrobe, requestedMood) => {
        return `
            You are an expert personal stylist AI.
            User Profile: ${JSON.stringify(userProfile)}
            Wardrobe Inventory: ${JSON.stringify(userWardrobe)}
            Requested Mood/Occasion: ${requestedMood}

            Task: Generate exactly 3 distinct complete outfit combinations.
            Return ONLY a raw, valid JSON array containing exactly 3 objects with keys:
            outfit_name, item_ids, styling_explanation, confidence_score.
        `;
    },

    // 2. NEW: The Compatibility Checker
    buildCompatibilityPrompt: (itemA, itemB) => {
        return `
            You are an expert fashion consultant. 
            I am going to give you two clothing items.
            Item A: ${JSON.stringify(itemA)}
            Item B: ${JSON.stringify(itemB)}

            Task: Tell me if these two items go well together.
            Return ONLY a raw, valid JSON object with no markdown formatting.
            Structure:
            {
                "is_compatible": boolean (true or false),
                "compatibility_score": integer from 1 to 100,
                "reasoning": "A 1-sentence explanation of why they do or don't match based on color, formality, or season."
            }
        `;
    },

    // 3. TO DO TOMORROW: The Outfit Rater
    buildOutfitRaterPrompt: (outfitItems, requestedVibe) => {
        // You will engineer this one tomorrow!
        return `...`;
    }
};

module.exports = PromptBuilder;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../db/pool');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function trackUsage(userId, endpoint, model, promptTokens, responseTokens, success = true) {
    try {
        await pool.query(`
      INSERT INTO gemini_usage (user_id, endpoint, model, prompt_tokens, response_tokens, success)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [userId, endpoint, model, promptTokens, responseTokens, success]);
    } catch (err) {
        console.error('Failed to track Gemini usage:', err.message);
    }
}

async function generateOutfits(userId, wardrobeItems, userProfile, moodTag) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    You are an expert personal stylist.
    User Profile: ${JSON.stringify(userProfile)}
    Wardrobe: ${JSON.stringify(wardrobeItems.map(i => ({ id: i.id, category: i.category, subcategory: i.subcategory, color: i.color_primary, tags: i.ai_tags })))}
    Mood/Occasion: ${moodTag}

    Task: Generate exactly 3 distinct outfits from the available wardrobe items.
    Return ONLY a raw JSON array of 3 objects: { "outfit_name": string, "item_ids": UUID[], "styling_explanation": string, "confidence_score": number }
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Simple token counting approximation (actual API provides this in response metadata)
    const promptTokens = prompt.length / 4;
    const responseTokens = text.length / 4;
    await trackUsage(userId, 'outfit-generation', 'gemini-1.5-flash', Math.ceil(promptTokens), Math.ceil(responseTokens));

    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
}

module.exports = { generateOutfits };

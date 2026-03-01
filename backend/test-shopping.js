require('dotenv').config();
const axios = require('axios');

async function testShoppingAPI(searchQuery) {
    console.log(`\n🛍️ Searching the internet for: "${searchQuery}"...`);

    const apiKey = process.env.RAPIDAPI_KEY;

    // Fallback logic: If you haven't signed up for RapidAPI yet, return mock data
    if (!apiKey || apiKey === 'your_rapidapi_key_here') {
        console.log("⚠️ RAPIDAPI_KEY is missing or using the placeholder.");
        console.log("To fetch real live products, get a free key at rapidapi.com.");
        console.log("For now, simulating a normalized ProductSchema response:\n");
        
        return [
            {
                id: "B08F2V7B12",
                name: "Faux Leather Moto Biker Jacket",
                price: "$45.99",
                image_url: "https://example.com/jacket.jpg",
                product_url: "https://amazon.com/dp/B08F2V7B12",
                rating: 4.5,
                source: "Amazon"
            }
        ];
    }

    // Live API Configuration (using Real-Time Amazon Data API as an example)
    const options = {
        method: 'GET',
        url: 'https://real-time-amazon-data.p.rapidapi.com/search',
        params: {
            query: searchQuery,
            page: '1',
            country: 'US'
        },
        headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        
        // Grab the top 3 results from the raw API data
        const rawProducts = response.data.data.products.slice(0, 3); 
        
        // NORMALIZE the data: Map the messy API fields to our clean ProductSchema
        const normalizedProducts = rawProducts.map(p => ({
            id: p.asin,
            name: p.product_title,
            price: p.product_price,
            image_url: p.product_photo,
            product_url: p.product_url,
            rating: p.product_star_rating,
            source: "Amazon"
        }));

        return normalizedProducts;

    } catch (error) {
        console.error("❌ Shopping API Error:", error.message);
        return [];
    }
}

// Run the test
async function runTest() {
    // Let's search for the jacket the scraper found earlier!
    const results = await testShoppingAPI("black leather biker jacket");
    
    console.log("✅ Shopping API Results:");
    console.log("-----------------------------------");
    console.log(JSON.stringify(results, null, 2));
    console.log("-----------------------------------");
}

runTest();
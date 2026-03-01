const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeProductImage(url) {
    console.log(`\n🕵️‍♂️ Fetching webpage HTML from: ${url}`);
    
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        // Strategy 1: Hunt for the Open Graph image tag
        let imageUrl = $('meta[property="og:image"]').attr('content');

        // Strategy 2: Fallback if the meta tag doesn't exist
        if (!imageUrl) {
            console.log("⚠️ No og:image tag found. Falling back to <img> tags...");
            // Grab the 'src' attribute of the very first image on the page
            imageUrl = $('img').first().attr('src'); 
        }

        if (imageUrl) {
            console.log(`✅ Success! Found the product image URL:`);
            console.log(`➡️  ${imageUrl}`);
        } else {
            console.log("❌ Could not find any suitable images on this page.");
        }

    } catch (error) {
        console.error("❌ Failed to scrape the page:", error.message);
    }
}

// Testing on a designated dummy scraping store
scrapeProductImage("https://scrapeme.live/shop/Bulbasaur/");
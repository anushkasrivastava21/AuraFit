const redis = require('../config/redis');
const crypto = require('crypto');

function makeOutfitCacheKey(userId, moodTag, wardrobeItems) {
    const wardrobeHash = crypto
        .createHash('md5')
        .update(JSON.stringify(wardrobeItems.map(i => i.id).sort()))
        .digest('hex')
        .slice(0, 8);
    return `outfit:${userId}:${moodTag}:${wardrobeHash}`;
}

async function getCachedOutfits(userId, moodTag, wardrobeItems) {
    const key = makeOutfitCacheKey(userId, moodTag, wardrobeItems);
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
}

async function cacheOutfits(userId, moodTag, wardrobeItems, outfits) {
    const key = makeOutfitCacheKey(userId, moodTag, wardrobeItems);
    const TTL_SECONDS = 6 * 60 * 60;  // 6 hours
    await redis.setex(key, TTL_SECONDS, JSON.stringify(outfits));
}

async function invalidateOutfitCache(userId) {
    const keys = await redis.keys(`outfit:${userId}:*`);
    if (keys.length > 0) await redis.del(...keys);
}

module.exports = { getCachedOutfits, cacheOutfits, invalidateOutfitCache };

const Redis = require('ioredis');
require('dotenv').config();

const redis = new Redis(process.env.REDIS_URL, {
    retryStrategy(times) {
        // Retry connecting up to 5 times, then give up
        if (times > 5) return null;
        return Math.min(times * 200, 1000); // wait 200ms, 400ms, ...
    }
});

redis.on('connect', () => console.log('SUCCESS: Connected to Redis'));
redis.on('error', (err) => console.error('Redis error:', err.message));

module.exports = redis;

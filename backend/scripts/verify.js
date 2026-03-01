const pool = require('../db/pool');
const redis = require('../config/redis');
const logger = require('../config/logger');

async function verify() {
    logger.info('Starting Pre-Hackathon Verification...');

    try {
        // 1. DB Connection
        await pool.query('SELECT NOW()');
        logger.info('✅ Database connection: OK');

        // 2. Redis Connection
        await redis.set('verify_test', 'ok');
        const val = await redis.get('verify_test');
        if (val === 'ok') logger.info('✅ Redis connection: OK');

        // 3. Folder Structure
        const fs = require('fs');
        const folders = ['config', 'db', 'middleware', 'routes', 'services', 'scripts', 'logs'];
        for (const f of folders) {
            if (fs.existsSync(f)) logger.info(`✅ Folder ${f}: OK`);
        }

        logger.info('Verification Complete!');
        process.exit(0);
    } catch (err) {
        logger.error('❌ Verification Failed', { error: err.message });
        process.exit(1);
    }
}

verify();

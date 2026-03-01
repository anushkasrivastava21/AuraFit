const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    user: 'postgres',
    password: 'password',
    max: 20,                 // maximum 20 simultaneous connections
    idleTimeoutMillis: 30000, // close idle connections after 30 seconds
    connectionTimeoutMillis: 2000, // fail if connection takes > 2 seconds
});

// Test the connection when the app starts
pool.connect((err, client, release) => {
    if (err) {
        console.error('ERROR: Cannot connect to database:', err.message);
        process.exit(1); // stop the server if DB is unreachable
    } else {
        console.log('SUCCESS: Connected to PostgreSQL database');
        release();
    }
});

module.exports = pool;

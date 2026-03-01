const { Client } = require('pg');
require('dotenv').config();

async function test() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        await client.connect();
        console.log('SUCCESS: Connection successful');
        const res = await client.query('SELECT current_user, current_database()');
        console.log('User/DB:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('FAILURE:', err.message);
        process.exit(1);
    }
}
test();

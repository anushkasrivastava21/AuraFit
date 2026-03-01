const pool = require('../db/pool');
const bcrypt = require('bcryptjs');

async function seed() {
    const client = await pool.connect();
    try {
        console.log('Seeding database...');

        // Clear existing test data first
        await client.query("DELETE FROM users WHERE email LIKE '%@test.styleai.com'");

        // Create 3 test users
        const password = await bcrypt.hash('Password123!', 12);
        const users = [
            { email: 'aisha@test.styleai.com', name: 'Aisha', age: 24 },
            { email: 'james@test.styleai.com', name: 'James', age: 31 },
            { email: 'sofia@test.styleai.com', name: 'Sofia', age: 27 },
        ];

        for (const u of users) {
            const res = await client.query(
                'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
                [u.email, password]
            );
            const userId = res.rows[0].id;

            await client.query(
                `INSERT INTO user_profiles
          (user_id, name, age, style_prefs, budget_min, budget_max)
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [userId, u.name, u.age, JSON.stringify(['Casual', 'Minimalist']), 20, 150]
            );
            console.log(`Created user: ${u.email}  (age: ${u.age})`);
        }

        console.log('Seed complete! Test password for all users: Password123!');
    } catch (err) {
        console.error('Seed failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
        pool.end();
    }
}

seed();

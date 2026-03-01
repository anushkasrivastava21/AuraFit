const fs = require('fs');
const path = require('path');
const pool = require('../db/pool');

async function runMigrations() {
    const client = await pool.connect();

    try {
        // Create a tracking table if it doesn't exist
        await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename   TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

        // Get list of already-applied migrations
        const result = await client.query(
            'SELECT filename FROM schema_migrations ORDER BY filename'
        );
        const applied = new Set(result.rows.map(r => r.filename));

        // Read all .sql files in db/migrations/, sorted by name
        const migrationsDir = path.join(__dirname, '../db/migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        for (const file of files) {
            if (applied.has(file)) {
                console.log(`SKIP: ${file} (already applied)`);
                continue;
            }

            console.log(`RUNNING: ${file}...`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

            await client.query('BEGIN');
            await client.query(sql);
            await client.query(
                'INSERT INTO schema_migrations (filename) VALUES ($1)',
                [file]
            );
            await client.query('COMMIT');
            console.log(`DONE: ${file}`);
        }

        console.log('All migrations complete!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
        pool.end();
    }
}

runMigrations();

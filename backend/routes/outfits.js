const express = require('express');
const authenticate = require('../middleware/authenticate');
const pool = require('../db/pool');
const router = express.Router();

router.use(authenticate);

router.post('/save', async (req, res, next) => {
    try {
        const { item_ids, generation_method, mood_tag, rating, notes, worn_date } = req.body;

        if (!item_ids || !Array.isArray(item_ids) || item_ids.length === 0) {
            return res.status(400).json({ success: false, error: { message: 'item_ids array is required.' } });
        }

        const result = await pool.query(`
      INSERT INTO outfits (user_id, item_ids, generation_method, mood_tag, rating, notes, worn_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [req.userId, item_ids, generation_method || 'prompt', mood_tag, rating, notes, worn_date]);

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) { next(err); }
});

router.get('/history', async (req, res, next) => {
    try {
        const { from, to, limit = 20, offset = 0 } = req.query;
        let query = 'SELECT * FROM outfits WHERE user_id = $1';
        const values = [req.userId];
        let idx = 2;
        if (from) { query += ` AND worn_date >= $${idx++}`; values.push(from); }
        if (to) { query += ` AND worn_date <= $${idx++}`; values.push(to); }
        query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
        values.push(parseInt(limit), parseInt(offset));
        const result = await pool.query(query, values);
        res.json({ success: true, data: result.rows });
    } catch (err) { next(err); }
});

module.exports = router;

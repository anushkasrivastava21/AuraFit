const pool = require('../db/pool');
const imageService = require('./imageService');
const cache = require('./cacheService');

async function getItems(userId, filters = {}) {
    let query = `SELECT * FROM wardrobe_items WHERE user_id = $1 AND is_deleted = FALSE`;
    const values = [userId];
    let idx = 2;

    if (filters.category) {
        query += ` AND category = $${idx++}`;
        values.push(filters.category);
    }
    if (filters.formality_min) {
        query += ` AND formality_score >= $${idx++}`;
        values.push(filters.formality_min);
    }

    query += ` ORDER BY created_at DESC`;

    const limit = parseInt(filters.limit) || 50;
    const offset = parseInt(filters.offset) || 0;
    query += ` LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
}

async function addItem(userId, imageBuffer, metadata) {
    const { url, cloudinaryId } = await imageService.processAndUpload(
        imageBuffer,
        `users/${userId}/wardrobe`
    );

    const result = await pool.query(`
    INSERT INTO wardrobe_items
      (user_id, image_url, cloudinary_id, custom_name, category,
       subcategory, color_primary, pattern, formality_score,
       season, material, brand, condition, ai_tags)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    RETURNING *
  `, [
        userId, url, cloudinaryId,
        metadata.custom_name || null,
        metadata.category || null,
        metadata.subcategory || null,
        metadata.color_primary || null,
        metadata.pattern || null,
        metadata.formality_score || null,
        JSON.stringify(metadata.season || []),
        metadata.material || null,
        metadata.brand || null,
        metadata.condition || 'Good',
        JSON.stringify(metadata.ai_tags || {})
    ]);
    await cache.invalidateOutfitCache(userId);
    return result.rows[0];
}

async function updateItem(itemId, userId, data) {
    const check = await pool.query(
        'SELECT id FROM wardrobe_items WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE',
        [itemId, userId]
    );
    if (check.rows.length === 0) throw { status: 404, message: 'Item not found.' };

    const allowed = ['custom_name', 'category', 'subcategory', 'color_primary',
        'pattern', 'formality_score', 'season', 'material', 'brand', 'condition', 'last_worn'];
    const updates = [];
    const values = [];
    let idx = 1;
    for (const f of allowed) {
        if (data[f] !== undefined) {
            updates.push(`${f} = $${idx++}`);
            values.push(data[f]);
        }
    }
    if (!updates.length) throw { status: 400, message: 'No valid fields to update.' };
    values.push(itemId);
    await pool.query(`UPDATE wardrobe_items SET ${updates.join(',')} WHERE id = $${idx}`, values);
    await cache.invalidateOutfitCache(userId);
    const updated = await pool.query('SELECT * FROM wardrobe_items WHERE id = $1', [itemId]);
    return updated.rows[0];
}

async function deleteItem(itemId, userId) {
    const result = await pool.query(
        'UPDATE wardrobe_items SET is_deleted = TRUE WHERE id = $1 AND user_id = $2 RETURNING cloudinary_id',
        [itemId, userId]
    );
    if (result.rows.length === 0) throw { status: 404, message: 'Item not found.' };
    await cache.invalidateOutfitCache(userId);
}

module.exports = { getItems, addItem, updateItem, deleteItem };

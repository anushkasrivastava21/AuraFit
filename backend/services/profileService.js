const pool = require('../db/pool');

async function getProfile(userId) {
    const result = await pool.query(`
    SELECT
      u.id, u.email, u.created_at,
      p.name, p.age, p.gender_identity, p.pronouns,
      p.skin_tone_hex, p.fitzpatrick_scale, p.body_type,
      p.face_shape, p.hair_color, p.hair_length,
      p.style_prefs, p.occasions,
      p.budget_min, p.budget_max,
      p.selfie_url, p.updated_at
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
    WHERE u.id = $1 AND u.is_deleted = FALSE
  `, [userId]);

    if (result.rows.length === 0) {
        throw { status: 404, message: 'Profile not found.' };
    }
    return result.rows[0];
}

async function updateProfile(userId, data) {
    const allowed = [
        'name', 'age', 'gender_identity', 'pronouns',
        'skin_tone_hex', 'fitzpatrick_scale', 'body_type',
        'face_shape', 'hair_color', 'hair_length',
        'style_prefs', 'occasions', 'budget_min', 'budget_max'
    ];

    const updates = [];
    const values = [];
    let paramIndex = 1;

    for (const field of allowed) {
        if (data[field] !== undefined) {
            updates.push(`${field} = $${paramIndex}`);
            values.push(data[field]);
            paramIndex++;
        }
    }

    if (updates.length === 0) {
        throw { status: 400, message: 'No valid fields provided to update.' };
    }

    values.push(userId);
    const query = `UPDATE user_profiles SET ${updates.join(', ')} WHERE user_id = $${paramIndex}`;
    await pool.query(query, values);

    return getProfile(userId);
}

module.exports = { getProfile, updateProfile };

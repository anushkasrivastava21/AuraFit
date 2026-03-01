const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db/pool');
const redis = require('../config/redis');

async function register(email, password) {
    // 1. Check if email already exists
    const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
    );
    if (existing.rows.length > 0) {
        throw { status: 409, message: 'An account with this email already exists.' };
    }

    // 2. Hash the password
    const password_hash = await bcrypt.hash(password, 12);

    // 3. Insert new user
    const result = await pool.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
        [email.toLowerCase(), password_hash]
    );
    const user = result.rows[0];

    // 4. Create an empty profile row for this user
    await pool.query(
        'INSERT INTO user_profiles (user_id) VALUES ($1)',
        [user.id]
    );

    // 5. Return tokens
    const tokens = generateTokens(user.id);
    await storeRefreshToken(tokens.refreshToken, user.id);
    return { user: { id: user.id, email: user.email }, ...tokens };
}

async function login(email, password) {
    // 1. Find user by email
    const result = await pool.query(
        'SELECT id, email, password_hash FROM users WHERE email = $1 AND is_deleted = FALSE',
        [email.toLowerCase()]
    );
    if (result.rows.length === 0) {
        throw { status: 401, message: 'Invalid email or password.' };
    }
    const user = result.rows[0];

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw { status: 401, message: 'Invalid email or password.' };
    }

    // 3. Update last_active
    await pool.query('UPDATE users SET last_active = NOW() WHERE id = $1', [user.id]);

    // 4. Generate and store tokens
    const tokens = generateTokens(user.id);
    await storeRefreshToken(tokens.refreshToken, user.id);
    return { user: { id: user.id, email: user.email }, ...tokens };
}

async function logout(refreshToken) {
    const tokenId = getTokenId(refreshToken);
    if (tokenId) {
        await redis.del(`refresh:${tokenId}`);
    }
}

async function refreshAccessToken(refreshToken) {
    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
        throw { status: 401, message: 'Invalid or expired refresh token.' };
    }

    const stored = await redis.get(`refresh:${decoded.jti}`);
    if (!stored) {
        throw { status: 401, message: 'Refresh token has been revoked.' };
    }

    const accessToken = jwt.sign(
        { sub: decoded.sub },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
    return { accessToken };
}

function generateTokens(userId) {
    const jti = uuidv4();
    const accessToken = jwt.sign(
        { sub: userId },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
        { sub: userId, jti },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
}

async function storeRefreshToken(refreshToken, userId) {
    const decoded = jwt.decode(refreshToken);
    await redis.setex(`refresh:${decoded.jti}`, 60 * 60 * 24 * 7, userId);
}

function getTokenId(refreshToken) {
    try {
        return jwt.decode(refreshToken)?.jti;
    } catch { return null; }
}

module.exports = { register, login, logout, refreshAccessToken };

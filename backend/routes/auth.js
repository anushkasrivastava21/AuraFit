const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authService = require('../services/authService');

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many attempts. Try again in 15 minutes.' }
});

router.post('/register', authLimiter, [
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain a number')
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: { message: 'Validation failed', errors: errors.array() } });
    }

    try {
        const result = await authService.register(req.body.email, req.body.password);
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
});

router.post('/login', authLimiter, [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: { message: 'Email and password are required.' } });
    }

    try {
        const result = await authService.login(req.body.email, req.body.password);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
});

router.post('/logout', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        await authService.logout(refreshToken);
        res.json({ success: true, data: { message: 'Logged out successfully.' } });
    } catch (err) {
        next(err);
    }
});

router.post('/refresh', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ success: false, error: { message: 'Refresh token is required.' } });
        }
        const result = await authService.refreshAccessToken(refreshToken);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
});

module.exports = router;

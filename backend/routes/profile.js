const express = require('express');
const { body, validationResult } = require('express-validator');
const authenticate = require('../middleware/authenticate');
const profileService = require('../services/profileService');
const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
    try {
        const profile = await profileService.getProfile(req.userId);
        res.json({ success: true, data: profile });
    } catch (err) { next(err); }
});

router.put('/', [
    body('age').optional().isInt({ min: 0, max: 120 }).withMessage('Age must be between 0 and 120'),
    body('name').optional().isLength({ max: 100 }).trim(),
    body('budget_min').optional().isFloat({ min: 0 }),
    body('budget_max').optional().isFloat({ min: 0 }),
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: { errors: errors.array() } });
    }
    try {
        const updated = await profileService.updateProfile(req.userId, req.body);
        res.json({ success: true, data: updated });
    } catch (err) { next(err); }
});

module.exports = router;

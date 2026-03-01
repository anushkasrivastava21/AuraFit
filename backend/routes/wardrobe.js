const express = require('express');
const upload = require('../middleware/upload');
const wardrobeService = require('../services/wardrobeService');
const authenticate = require('../middleware/authenticate');
const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
    try {
        const items = await wardrobeService.getItems(req.userId, req.query);
        res.json({ success: true, data: items });
    } catch (err) { next(err); }
});

router.post('/', upload.single('image'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: { message: 'Image file is required.' } });
        }
        const item = await wardrobeService.addItem(req.userId, req.file.buffer, req.body);
        res.status(201).json({ success: true, data: item });
    } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
    try {
        const updated = await wardrobeService.updateItem(req.params.id, req.userId, req.body);
        res.json({ success: true, data: updated });
    } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
    try {
        await wardrobeService.deleteItem(req.params.id, req.userId);
        res.json({ success: true, data: { message: 'Item deleted.' } });
    } catch (err) { next(err); }
});

module.exports = router;

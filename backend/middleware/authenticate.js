const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: { message: 'No token provided. Please log in.' }
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.sub;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: { message: 'Session expired. Please log in again.' }
            });
        }
        return res.status(401).json({
            success: false,
            error: { message: 'Invalid token. Please log in again.' }
        });
    }
}

module.exports = authenticate;

function requireLogin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Login required"
        });
    }

    next();
}

function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Login required"
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        next();
    };
}

module.exports = {
    requireLogin,
    requireRole
};
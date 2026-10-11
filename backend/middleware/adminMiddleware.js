const db = require("../config/db");

const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const [users] = await db.execute(
            "SELECT id, role FROM users WHERE id = ?",
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "User account not found"
            });
        }

        if (users[0].role !== "ADMIN") {
            return res.status(403).json({
                message: "Access denied. Admin only."
            });
        }

        req.user.role = users[0].role;

        next();

    } catch (error) {
        console.error("Admin Middleware Error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = adminMiddleware;
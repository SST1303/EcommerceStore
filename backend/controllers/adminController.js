const db = require("../config/db");

// GET ALL USERS
const getAllUsers = async (req, res) => {
    try {
        const [users] = await db.execute(
            `SELECT id, name, email, role, created_at
             FROM users
             ORDER BY created_at DESC`
        );

        res.status(200).json({ users });

    } catch (error) {
        console.error("Get Users Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// UPDATE USER ROLE
const updateUserRole = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const targetUserId = Number(req.params.id);
        const { role } = req.body;

        if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        if (!["USER", "ADMIN"].includes(role)) {
            return res.status(400).json({
                message: "Role must be USER or ADMIN"
            });
        }

        // Admin cannot change their own role here
        if (targetUserId === Number(req.user.id)) {
            return res.status(400).json({
                message: "You cannot change your own role"
            });
        }

        await connection.beginTransaction();

        // Lock existing admin rows to protect the last admin
        await connection.execute(
            "SELECT id FROM users WHERE role = 'ADMIN' FOR UPDATE"
        );

        // Check target user
        const [targetUsers] = await connection.execute(
            "SELECT id, role FROM users WHERE id = ? FOR UPDATE",
            [targetUserId]
        );

        if (targetUsers.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "User not found"
            });
        }

        const targetUser = targetUsers[0];

        if (targetUser.role === role) {
            await connection.commit();

            return res.status(200).json({
                message: `User already has the ${role} role`
            });
        }

        // Do not allow demoting the last remaining admin
        if (targetUser.role === "ADMIN" && role === "USER") {
            const [admins] = await connection.execute(
                "SELECT COUNT(*) AS total FROM users WHERE role = 'ADMIN'"
            );

            if (admins[0].total <= 1) {
                await connection.rollback();

                return res.status(400).json({
                    message: "At least one admin must remain"
                });
            }
        }

        await connection.execute(
            "UPDATE users SET role = ? WHERE id = ?",
            [role, targetUserId]
        );

        await connection.commit();

        res.status(200).json({
            message: `User role updated to ${role} successfully`
        });

    } catch (error) {
        await connection.rollback();

        console.error("Update Role Error:", error);

        res.status(500).json({
            message: "Server error"
        });

    } finally {
        connection.release();
    }
};

module.exports = {
    getAllUsers,
    updateUserRole
};

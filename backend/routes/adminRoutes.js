const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getAllUsers,
    updateUserRole
} = require("../controllers/adminController");

// GET ALL USERS - ADMIN ONLY
router.get(
    "/users",
    authMiddleware,
    adminMiddleware,
    getAllUsers
);

// UPDATE USER ROLE - ADMIN ONLY
router.put(
    "/users/:id/role",
    authMiddleware,
    adminMiddleware,
    updateUserRole
);

module.exports = router;

const express = require("express");

const router = express.Router();

const {
    addToCart,
    getCart,
    updateCart,
    removeFromCart,
    clearCart
} = require("../controllers/cartController");

const authMiddleware = require("../middleware/authMiddleware");


// Add product to cart
router.post("/", authMiddleware, addToCart);


// Get user's cart
router.get("/", authMiddleware, getCart);


// Update product quantity
router.put("/:productId", authMiddleware, updateCart);


// Remove product from cart
router.delete("/:productId", authMiddleware, removeFromCart);


// Clear complete cart
router.delete("/", authMiddleware, clearCart);


module.exports = router;
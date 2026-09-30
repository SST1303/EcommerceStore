const express = require("express");
const router = express.Router();

const wishlistController = require("../controllers/wishlistController");
const authMiddleware = require("../middleware/authMiddleware");

// All wishlist routes require login
router.use(authMiddleware);

// Add product to wishlist
router.post("/", wishlistController.addToWishlist);

// Get logged-in user's wishlist
router.get("/", wishlistController.getWishlist);

// Remove product from wishlist
router.delete("/:productId", wishlistController.removeFromWishlist);

module.exports = router;
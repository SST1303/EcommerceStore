const wishlistModel = require("../models/wishlistModel");

// Add product to wishlist
const addToWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { product_id } = req.body;

        if (!product_id) {
            return res.status(400).json({
                message: "Product ID is required"
            });
        }

        const wishlistId = await wishlistModel.addToWishlist(
            userId,
            product_id
        );

        res.status(201).json({
            message: "Product added to wishlist",
            wishlistId: wishlistId
        });

    } catch (error) {
        console.error("Add to wishlist error:", error);

        // Duplicate product
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                message: "Product already exists in wishlist"
            });
        }

        res.status(500).json({
            message: "Unable to add product to wishlist"
        });
    }
};


// Get user's wishlist
const getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;

        const wishlist = await wishlistModel.getWishlistByUser(userId);

        res.json({
            wishlist: wishlist
        });

    } catch (error) {
        console.error("Get wishlist error:", error);

        res.status(500).json({
            message: "Unable to load wishlist"
        });
    }
};


// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;

        const affectedRows =
            await wishlistModel.removeFromWishlist(
                userId,
                productId
            );

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found in wishlist"
            });
        }

        res.json({
            message: "Product removed from wishlist"
        });

    } catch (error) {
        console.error("Remove wishlist error:", error);

        res.status(500).json({
            message: "Unable to remove product from wishlist"
        });
    }
};


module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist
};


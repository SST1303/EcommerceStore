const cartModel = require("../models/cartModel");


// Add product to cart
const addToCart = async (req, res) => {
    try {
        const { product_id, quantity } = req.body;

        // Validate input
        if (!product_id || !quantity) {
            return res.status(400).json({
                message: "Product ID and quantity are required"
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({
                message: "Quantity must be greater than 0"
            });
        }

        // Get logged-in user's ID from JWT
        const userId = req.user.id;

        // Check whether cart already exists
        let cart = await cartModel.findCartByUserId(userId);

        // If cart does not exist, create one
        if (!cart) {
            const cartId = await cartModel.createCart(userId);

            cart = {
                id: cartId,
                user_id: userId
            };
        }

        // Check whether product already exists in cart
        const existingItem = await cartModel.findCartItem(cart.id, product_id);

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            await cartModel.updateCartItem(
                cart.id,
                product_id,
                newQuantity
            );

            return res.status(200).json({
                message: "Product quantity updated in cart",
                quantity: newQuantity
            });
        }

        // Add new product to cart
        await cartModel.addCartItem(
            cart.id,
            product_id,
            quantity
        );

        res.status(201).json({
            message: "Product added to cart successfully"
        });

    } catch (error) {
        console.error("Add to cart error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};


// Get user's cart
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cartItems = await cartModel.getCartByUserId(userId);

        res.status(200).json({
            cart: cartItems
        });

    } catch (error) {
        console.error("Get cart error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};


// Update cart item quantity
const updateCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                message: "Quantity must be greater than 0"
            });
        }

        const userId = req.user.id;

        const cart = await cartModel.findCartByUserId(userId);

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        const existingItem = await cartModel.findCartItem(cart.id, productId);

        if (!existingItem) {
            return res.status(404).json({
                message: "Product not found in cart"
            });
        }

        await cartModel.updateCartItem(
            cart.id,
            productId,
            quantity
        );

        res.status(200).json({
            message: "Cart quantity updated successfully"
        });

    } catch (error) {
        console.error("Update cart error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};


// Remove product from cart
const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        const userId = req.user.id;

        const cart = await cartModel.findCartByUserId(userId);

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        const existingItem = await cartModel.findCartItem(cart.id, productId);

        if (!existingItem) {
            return res.status(404).json({
                message: "Product not found in cart"
            });
        }

        await cartModel.removeCartItem(cart.id, productId);

        res.status(200).json({
            message: "Product removed from cart successfully"
        });

    } catch (error) {
        console.error("Remove from cart error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};


// Clear cart
const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await cartModel.findCartByUserId(userId);

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        await cartModel.clearCart(cart.id);

        res.status(200).json({
            message: "Cart cleared successfully"
        });

    } catch (error) {
        console.error("Clear cart error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};


module.exports = {
    addToCart,
    getCart,
    updateCart,
    removeFromCart,
    clearCart
};
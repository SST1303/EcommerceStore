const orderModel = require("../models/orderModel");
const cartModel = require("../models/cartModel");


// Place Order
const placeOrder = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user's cart
        const cartItems = await cartModel.getCartByUserId(userId);

        // Check if cart is empty
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        // Calculate total amount
        let totalAmount = 0;

        cartItems.forEach((item) => {
            totalAmount += Number(item.subtotal);
        });

        // Create order
        const orderId = await orderModel.createOrder(
            userId,
            totalAmount,
            "PLACED"
        );

        // Add cart products to order_items
        for (const item of cartItems) {
            await orderModel.addOrderItem(
                orderId,
                item.product_id,
                item.quantity,
                item.price
            );
        }

        // Clear cart after successful order
        const cart = await cartModel.findCartByUserId(userId);

        if (cart) {
            await cartModel.clearCart(cart.id);
        }

        res.status(201).json({
            message: "Order placed successfully",
            orderId: orderId,
            totalAmount: totalAmount,
            status: "PLACED"
        });

    } catch (error) {
        console.error("Place order error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};


// Get User Orders
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await orderModel.getOrdersByUserId(userId);

        res.status(200).json({
            orders: orders
        });

    } catch (error) {
        console.error("Get user orders error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};


// Get Order Details
const getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        // Get order
        const order = await orderModel.getOrderById(
            orderId,
            userId
        );

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        // Get order items
        const items = await orderModel.getOrderItems(orderId);

        res.status(200).json({
            order: order,
            items: items
        });

    } catch (error) {
        console.error("Get order details error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};


// Get All Orders - Admin
const getAllOrders = async (req, res) => {
    try {
        const orders = await orderModel.getAllOrders();

        res.status(200).json({
            orders: orders
        });

    } catch (error) {
        console.error("Get all orders error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};


// Update Order Status - Admin
const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                message: "Status is required"
            });
        }

        const validStatuses = [
            "PLACED",
            "CONFIRMED",
            "SHIPPED",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "CANCELLED"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        const result = await orderModel.updateOrderStatus(
            orderId,
            status
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json({
            message: "Order status updated successfully",
            status: status
        });

    } catch (error) {
        console.error("Update order status error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};


module.exports = {
    placeOrder,
    getUserOrders,
    getOrderDetails,
    getAllOrders,
    updateOrderStatus
};
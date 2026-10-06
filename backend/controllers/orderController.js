const db = require("../config/db");
const orderModel = require("../models/orderModel");
const cartModel = require("../models/cartModel");


// Place Order
const placeOrder = async (req, res) => {
    let connection;

    try {
        const userId = req.user.id;

        const {
            fullName,
            phone,
            address,
            city,
            state,
            pincode,
            selectedCartItemIds
        } = req.body;

        // Check delivery address
        if (
            !fullName ||
            !phone ||
            !address ||
            !city ||
            !state ||
            !pincode
        ) {
            return res.status(400).json({
                message: "All delivery address fields are required"
            });
        }

        // Check selected cart items
        if (
            !selectedCartItemIds ||
            !Array.isArray(selectedCartItemIds) ||
            selectedCartItemIds.length === 0
        ) {
            return res.status(400).json({
                message: "Please select at least one product"
            });
        }

        // Get only selected cart items
        const cartItems = await cartModel.getSelectedCartItems(userId, selectedCartItemIds);

        // Check whether selected items exist
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({
                message: "Selected products not found in cart"
            });
        }

        // Check product stock
        for (const item of cartItems) {

            const stockResult = await cartModel.getProductStock(item.product_id);

            if (!stockResult || stockResult.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${item.name}`
                });
            }
        }

        // Calculate total amount
        let totalAmount = 0;

        cartItems.forEach((item) => {
            totalAmount += Number(item.subtotal);
        });

        // Get database connection 
        connection = await db.getConnection();

        // Start transaction 
        await connection.beginTransaction();

        // Create order
        const orderId =
            await orderModel.createOrderWithConnection(
                connection,
                userId,
                totalAmount,
                "PLACED",
                fullName,
                phone,
                address,
                city,
                state,
                pincode
            );

        // Add selected products to order_items
        for (const item of cartItems) {

            await orderModel.addOrderItemWithConnection(
                connection,
                orderId,
                item.product_id,
                item.quantity,
                item.price
            );

            const stockResult = await orderModel.updateProductStockWithConnection(
                connection,
                item.product_id,
                item.quantity
            );

            if (stockResult.affectedRows === 0) {
                throw new Error( `Insufficient stock for ${item.name}` );
            }

        }

        // Get user's cart
        const cart = await cartModel.findCartByUserId(userId);

        // Remove only selected products from cart
        if (cart) {

            await cartModel.removeSelectedCartItemsWithConnection(
                connection,
                cart.id,
                selectedCartItemIds
            );

        }

        // Commit transaction
        await connection.commit();

        res.status(201).json({
            message: "Order placed successfully",
            orderId: orderId,
            totalAmount: totalAmount,
            status: "PLACED"
        });

    } catch (error) {

        // Rollback transaction if error occurs 
        if (connection) { 
            await connection.rollback();
        }

        console.error("Place order error:", error);

        res.status(500).json({ 
            message: "Unable to place order" 
        }); 
    } finally { 
        // Release database connection 
        if (connection) { 
            connection.release();
        }

    }
};


// Buy Now Order
const buyNowOrder = async (req, res) => {
    let connection;

    try {
        const userId = req.user.id;

        const {
            productId,
            quantity,
            fullName,
            phone,
            address,
            city,
            state,
            pincode
        } = req.body;

        // Check delivery address
        if (
            !fullName ||
            !phone ||
            !address ||
            !city ||
            !state ||
            !pincode
        ) {
            return res.status(400).json({
                message: "All delivery address fields are required"
            });
        }

        // Check product and quantity
        if (!productId || !quantity || quantity <= 0) {
            return res.status(400).json({
                message: "Product and valid quantity are required"
            });
        }

        // Get product
        const [products] = await db.query(
            `
            SELECT
                id,
                name,
                price,
                stock
            FROM products
            WHERE id = ?
            `,
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const product = products[0];

        // Check stock
        if (product.stock < quantity) {
            return res.status(400).json({
                message: `Only ${product.stock} items available in stock`
            });
        }

        // Calculate total amount
        const totalAmount =
            Number(product.price) * Number(quantity);

        // Get database connection
        connection = await db.getConnection();

        // Start transaction
        await connection.beginTransaction();

        // Create order
        const orderId =
            await orderModel.createOrderWithConnection(
                connection,
                userId,
                totalAmount,
                "PLACED",
                fullName,
                phone,
                address,
                city,
                state,
                pincode
            );

        // Add product to order_items
        await orderModel.addOrderItemWithConnection(
            connection,
            orderId,
            product.id,
            quantity,
            product.price
        );

        // Update product stock
        const stockResult =
            await orderModel.updateProductStockWithConnection(
                connection,
                product.id,
                quantity
            );

        if (stockResult.affectedRows === 0) {
            throw new Error(
                `Insufficient stock for ${product.name}`
            );
        }

        // Commit transaction
        await connection.commit();

        res.status(201).json({
            message: "Order placed successfully",
            orderId: orderId,
            totalAmount: totalAmount,
            status: "PLACED"
        });

    } catch (error) {

        // Rollback transaction if error occurs
        if (connection) {
            await connection.rollback();
        }

        console.error("Buy Now order error:", error);

        res.status(500).json({
            message: "Unable to place order"
        });

    } finally {

        // Release database connection
        if (connection) {
            connection.release();
        }

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


// Get Single Order Details - Admin
const getAdminOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;

        // Get order
        const order = await orderModel.getOrderByIdForAdmin(orderId);

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
        console.error("Get admin order details error:", error);

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


// Cancel order
const cancelOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;

        const result = await orderModel.cancelOrder(orderId, userId);

        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: "Order cannot be cancelled"
            });
        }

        res.json({
            message: "Order cancelled successfully",
            status: "CANCELLED"
        });

    } catch (error) {
        console.error("Cancel order error:", error);

        res.status(500).json({
            message: "Unable to cancel order"
        });
    }
};


module.exports = {
    placeOrder,
    buyNowOrder,
    getUserOrders,
    getOrderDetails,
    getAllOrders,
    getAdminOrderDetails,
    updateOrderStatus,
    cancelOrder
};
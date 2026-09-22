const db = require("../config/db");

// Create new order
const createOrder = async (userId, totalAmount, status) => {
    const [result] = await db.query(
        `
        INSERT INTO orders (user_id, total_amount, status)
        VALUES (?, ?, ?)
        `,
        [userId, totalAmount, status]
    );

    return result.insertId;
};


// Add product to order
const addOrderItem = async (orderId, productId, quantity, price) => {
    const [result] = await db.query(
        `
        INSERT INTO order_items
        (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
        `,
        [orderId, productId, quantity, price]
    );

    return result.insertId;
};


// Get orders of a user
const getOrdersByUserId = async (userId) => {
    const [rows] = await db.query(
        `
        SELECT
            o.id,
            o.total_amount,
            o.status,
            o.created_at
        FROM orders o
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
        `,
        [userId]
    );

    return rows;
};


// Get single order of a user
const getOrderById = async (orderId, userId) => {
    const [rows] = await db.query(
        `
        SELECT
            o.id,
            o.user_id,
            o.total_amount,
            o.status,
            o.created_at
        FROM orders o
        WHERE o.id = ? AND o.user_id = ?
        `,
        [orderId, userId]
    );

    return rows[0];
};


// Get order items
const getOrderItems = async (orderId) => {
    const [rows] = await db.query(
        `
        SELECT
            oi.id,
            oi.product_id,
            p.name,
            oi.quantity,
            oi.price,
            (oi.quantity * oi.price) AS subtotal
        FROM order_items oi
        JOIN products p
            ON oi.product_id = p.id
        WHERE oi.order_id = ?
        `,
        [orderId]
    );

    return rows;
};


// Get all orders for admin
const getAllOrders = async () => {
    const [rows] = await db.query(
        `
        SELECT
            o.id,
            o.user_id,
            u.name AS user_name,
            u.email,
            o.total_amount,
            o.status,
            o.created_at
        FROM orders o
        JOIN users u
            ON o.user_id = u.id
        ORDER BY o.created_at DESC
        `
    );

    return rows;
};


// Update order status
const updateOrderStatus = async (orderId, status) => {
    const [result] = await db.query(
        `
        UPDATE orders
        SET status = ?
        WHERE id = ?
        `,
        [status, orderId]
    );

    return result;
};


module.exports = {
    createOrder,
    addOrderItem,
    getOrdersByUserId,
    getOrderById,
    getOrderItems,
    getAllOrders,
    updateOrderStatus
};
const db = require("../config/db");

// Create new order
const createOrder = async (
    userId,
    totalAmount,
    status,
    fullName,
    phone,
    address,
    city,
    state,
    pincode
) => {
    const [result] = await db.query(
        `
        INSERT INTO orders
        (
            user_id,
            total_amount,
            status,
            full_name,
            phone,
            address,
            city,
            state,
            pincode
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            userId,
            totalAmount,
            status,
            fullName,
            phone,
            address,
            city,
            state,
            pincode
        ]
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


// Update product stock
const updateProductStock = async (productId, quantity) => {
    const [result] = await db.query(
        `
        UPDATE products
        SET stock = stock - ?
        WHERE id = ?
        AND stock >= ?
        `,
        [quantity, productId, quantity]
    );

    return result;
};


// Create new order using transaction connection
const createOrderWithConnection = async (
    connection,
    userId,
    totalAmount,
    status,
    fullName,
    phone,
    address,
    city,
    state,
    pincode
) => {
    const [result] = await connection.query(
        `
        INSERT INTO orders
        (
            user_id,
            total_amount,
            status,
            full_name,
            phone,
            address,
            city,
            state,
            pincode
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            userId,
            totalAmount,
            status,
            fullName,
            phone,
            address,
            city,
            state,
            pincode
        ]
    );

    return result.insertId;
};


// Add product to order using transaction connection
const addOrderItemWithConnection = async (
    connection,
    orderId,
    productId,
    quantity,
    price
) => {
    const [result] = await connection.query(
        `
        INSERT INTO order_items
        (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
        `,
        [orderId, productId, quantity, price]
    );

    return result.insertId;
};


// Update product stock using transaction connection
const updateProductStockWithConnection = async (
    connection,
    productId,
    quantity
) => {
    const [result] = await connection.query(
        `
        UPDATE products
        SET stock = stock - ?
        WHERE id = ?
        AND stock >= ?
        `,
        [quantity, productId, quantity]
    );

    return result;
};

// Get orders of a user
const getOrdersByUserId = async (userId) => {
    const [rows] = await db.query(
        `
        SELECT
            o.id,
            o.total_amount,
            o.status,
            o.created_at,
            oi.id AS order_item_id,
            oi.product_id,
            p.name AS product_name,
            p.image_url,
            oi.quantity,
            oi.price AS product_price,
            (oi.quantity * oi.price) AS subtotal
        FROM orders o
        LEFT JOIN order_items oi
            ON o.id = oi.order_id
        LEFT JOIN products p
            ON oi.product_id = p.id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC, oi.id ASC
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
            o.full_name,
            o.phone,
            o.address,
            o.city,
            o.state,
            o.pincode,
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
            p.image_url,
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
            o.full_name,
            o.phone,
            o.address,
            o.city,
            o.state,
            o.pincode,
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


// Get single order for admin
const getOrderByIdForAdmin = async (orderId) => {
    const [rows] = await db.query(
        `
        SELECT
            o.id,
            o.user_id,
            u.name AS user_name,
            u.email,
            o.full_name,
            o.phone,
            o.address,
            o.city,
            o.state,
            o.pincode,
            o.total_amount,
            o.status,
            o.created_at
        FROM orders o
        JOIN users u
            ON o.user_id = u.id
        WHERE o.id = ?
        `,
        [orderId]
    );

    return rows[0];
};


// Cancel order transaction (used for both user and admin)
const cancelOrderTransaction = async (orderId, userId = null) => {
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        let query = `
            SELECT id, status
            FROM orders
            WHERE id = ?
        `;

        const params = [orderId];

        if (userId !== null) {
            query += " AND user_id = ?";
            params.push(userId);
        }

        query += " FOR UPDATE";

        const [orders] = await connection.query(query, params);

        if (orders.length === 0) {
            await connection.rollback();

            return {
                affectedRows: 0,
                outcome: "NOT_FOUND"
            };
        }

        const order = orders[0];

        if (!["PLACED", "CONFIRMED"].includes(order.status)) {
            await connection.rollback();

            return {
                affectedRows: 0,
                outcome: "NOT_CANCELLABLE",
                status: order.status
            };
        }

        const [items] = await connection.query(
            `
            SELECT product_id, quantity
            FROM order_items
            WHERE order_id = ?
            `,
            [orderId]
        );

        for (const item of items) {
            const [stockResult] = await connection.query(
                `
                UPDATE products
                SET stock = stock + ?
                WHERE id = ?
                `,
                [item.quantity, item.product_id]
            );

            if (stockResult.affectedRows !== 1) {
                throw new Error(
                    `Unable to restore stock for product ${item.product_id}`
                );
            }
        }

        const [result] = await connection.query(
            `
            UPDATE orders
            SET status = 'CANCELLED'
            WHERE id = ?
            AND status IN ('PLACED', 'CONFIRMED')
            `,
            [orderId]
        );

        if (result.affectedRows !== 1) {
            throw new Error("Unable to cancel order");
        }

        await connection.commit();

        return {
            affectedRows: 1,
            outcome: "CANCELLED"
        };

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        throw error;

    } finally {
        if (connection) {
            connection.release();
        }
    }
};


// Update order status
const updateOrderStatus = async (orderId, status) => {
    if (status === "CANCELLED") {
        return cancelOrderTransaction(orderId);
    }

    const [result] = await db.query(
        `
        UPDATE orders
        SET status = ?
        WHERE id = ?
        AND status <> 'CANCELLED'
        `,
        [status, orderId]
    );

    return result;
};


// Cancel order - User
const cancelOrder = async (orderId, userId) => {
    return cancelOrderTransaction(orderId, userId);
};


module.exports = {
    createOrder,
    addOrderItem,
    updateProductStock,
    createOrderWithConnection,
    addOrderItemWithConnection,
    updateProductStockWithConnection,
    getOrdersByUserId,
    getOrderById,
    getOrderItems,
    getAllOrders,
    getOrderByIdForAdmin,
    updateOrderStatus,
    cancelOrder
};
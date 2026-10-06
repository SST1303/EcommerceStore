const db = require("../config/db");

// Get cart of a user
const getCartByUserId = async (userId) => {
    const [rows] = await db.query(
        `
        SELECT 
            c.id AS cart_id,
            ci.id AS cart_item_id,
            ci.product_id,
            p.name,
            p.description,
            p.price,
            p.image_url,
            ci.quantity,
            (p.price * ci.quantity) AS subtotal
        FROM cart c
        JOIN cart_items ci ON c.id = ci.cart_id
        JOIN products p ON ci.product_id = p.id
        WHERE c.user_id = ?
        `,
        [userId]
    );

    return rows;
};


// Find cart of a user
const findCartByUserId = async (userId) => {
    const [rows] = await db.query(
        "SELECT * FROM cart WHERE user_id = ?",
        [userId]
    );

    return rows[0];
};


// Create cart for a user
const createCart = async (userId) => {
    const [result] = await db.query(
        "INSERT INTO cart (user_id) VALUES (?)",
        [userId]
    );

    return result.insertId;
};


// Find product inside cart
const findCartItem = async (cartId, productId) => {
    const [rows] = await db.query(
        `
        SELECT * 
        FROM cart_items
        WHERE cart_id = ? AND product_id = ?
        `,
        [cartId, productId]
    );

    return rows[0];
};


// Get product stock
const getProductStock = async (productId) => {
    const [rows] = await db.query(
        "SELECT stock FROM products WHERE id = ?",
        [productId]
    );

    return rows[0];
};


// Add product to cart
const addCartItem = async (cartId, productId, quantity) => {
    const [result] = await db.query(
        `
        INSERT INTO cart_items (cart_id, product_id, quantity)
        VALUES (?, ?, ?)
        `,
        [cartId, productId, quantity]
    );

    return result.insertId;
};


// Update product quantity
const updateCartItem = async (cartId, productId, quantity) => {
    const [result] = await db.query(
        `
        UPDATE cart_items
        SET quantity = ?
        WHERE cart_id = ? AND product_id = ?
        `,
        [quantity, cartId, productId]
    );

    return result;
};


// Remove product from cart
const removeCartItem = async (cartId, productId) => {
    const [result] = await db.query(
        `
        DELETE FROM cart_items
        WHERE cart_id = ? AND product_id = ?
        `,
        [cartId, productId]
    );

    return result;
};


// Clear complete cart
const clearCart = async (cartId) => {
    const [result] = await db.query(
        `
        DELETE FROM cart_items
        WHERE cart_id = ?
        `,
        [cartId]
    );

    return result;
};


// Get selected cart items
const getSelectedCartItems = async (userId, cartItemIds) => {
    if (!cartItemIds || cartItemIds.length === 0) {
        return [];
    }

    const placeholders = cartItemIds.map(() => "?").join(",");

    const [rows] = await db.query(
        `
        SELECT 
            c.id AS cart_id,
            ci.id AS cart_item_id,
            ci.product_id,
            p.name,
            p.description,
            p.price,
            p.image_url,
            ci.quantity,
            (p.price * ci.quantity) AS subtotal
        FROM cart c
        JOIN cart_items ci ON c.id = ci.cart_id
        JOIN products p ON ci.product_id = p.id
        WHERE c.user_id = ?
        AND ci.id IN (${placeholders})
        `,
        [userId, ...cartItemIds]
    );

    return rows;
};


// Remove selected cart items
const removeSelectedCartItems = async (cartId, cartItemIds) => {
    if (!cartItemIds || cartItemIds.length === 0) {
        return;
    }

    const placeholders = cartItemIds.map(() => "?").join(",");

    const [result] = await db.query(
        `
        DELETE FROM cart_items
        WHERE cart_id = ?
        AND id IN (${placeholders})
        `,
        [cartId, ...cartItemIds]
    );

    return result;
};

// Remove selected cart items using transaction connection
const removeSelectedCartItemsWithConnection = async (
    connection,
    cartId,
    selectedCartItemIds
) => {
    const placeholders = selectedCartItemIds.map(() => "?").join(",");

    const [result] = await connection.query(
        `
        DELETE FROM cart_items
        WHERE cart_id = ?
        AND id IN (${placeholders})
        `,
        [cartId, ...selectedCartItemIds]
    );

    return result;
};


module.exports = {
    getCartByUserId,
    findCartByUserId,
    createCart,
    findCartItem,
    getProductStock,
    addCartItem,
    updateCartItem,
    removeCartItem,
    clearCart,
    getSelectedCartItems,
    removeSelectedCartItems,
    removeSelectedCartItemsWithConnection
};
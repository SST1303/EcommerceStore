const db = require("../config/db");

// Add product to wishlist
const addToWishlist = async (userId, productId) => {
    const [result] = await db.execute(
        `
        INSERT INTO wishlist (user_id, product_id)
        VALUES (?, ?)
        `,
        [userId, productId]
    );

    return result.insertId;
};

// Get user's wishlist
const getWishlistByUser = async (userId) => {
    const [products] = await db.execute(
        `
        SELECT
            w.id AS wishlist_id,
            p.id AS product_id,
            p.name,
            p.description,
            p.price,
            p.stock,
            p.image_url,
            c.name AS category_name,
            w.created_at
        FROM wishlist w
        JOIN products p
            ON w.product_id = p.id
        LEFT JOIN categories c
            ON p.category_id = c.id
        WHERE w.user_id = ?
        ORDER BY w.created_at DESC
        `,
        [userId]
    );

    return products;
};

// Remove product from wishlist
const removeFromWishlist = async (userId, productId) => {
    const [result] = await db.execute(
        `
        DELETE FROM wishlist
        WHERE user_id = ?
        AND product_id = ?
        `,
        [userId, productId]
    );

    return result.affectedRows;
};

module.exports = {
    addToWishlist,
    getWishlistByUser,
    removeFromWishlist
};
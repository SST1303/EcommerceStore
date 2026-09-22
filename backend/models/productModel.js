const db = require("../config/db");

const createProduct = async (product) => {
    const {
        name,
        description,
        price,
        stock,
        image_url,
        category_id
    } = product;

    const [result] = await db.execute(
        `INSERT INTO products
        (name, description, price, stock, image_url, category_id)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            name,
            description,
            price,
            stock,
            image_url,
            category_id
        ]
    );

    return result.insertId;
};

const getAllProducts = async () => {
    const [products] = await db.execute(`
        SELECT 
            p.id,
            p.name,
            p.description,
            p.price,
            p.stock,
            p.image_url,
            p.category_id,
            c.name AS category_name
        FROM products p
        LEFT JOIN categories c
        ON p.category_id = c.id
        ORDER BY p.id DESC
    `);

    return products;
};

const getProductById = async (id) => {
    const [products] = await db.execute(
        `SELECT 
            p.id,
            p.name,
            p.description,
            p.price,
            p.stock,
            p.image_url,
            p.category_id,
            c.name AS category_name
         FROM products p
         LEFT JOIN categories c
         ON p.category_id = c.id
         WHERE p.id = ?`,
        [id]
    );

    return products[0];
};

const updateProduct = async (id, product) => {
    const {
        name,
        description,
        price,
        stock,
        image_url,
        category_id
    } = product;

    const [result] = await db.execute(
        `UPDATE products
         SET name = ?,
             description = ?,
             price = ?,
             stock = ?,
             image_url = ?,
             category_id = ?
         WHERE id = ?`,
        [
            name,
            description,
            price,
            stock,
            image_url,
            category_id,
            id
        ]
    );

    return result.affectedRows;
};

const deleteProduct = async (id) => {
    const [result] = await db.execute(
        "DELETE FROM products WHERE id = ?",
        [id]
    );

    return result.affectedRows;
};

const searchProducts = async (keyword) => {
    const [products] = await db.execute(
        `SELECT 
            p.id,
            p.name,
            p.description,
            p.price,
            p.stock,
            p.image_url,
            p.category_id,
            c.name AS category_name
         FROM products p
         LEFT JOIN categories c
         ON p.category_id = c.id
         WHERE p.name LIKE ?
            OR p.description LIKE ?
         ORDER BY p.id DESC`,
        [`%${keyword}%`, `%${keyword}%`]
    );

    return products;
};


const getProductsByCategory = async (categoryId) => {
    const [products] = await db.execute(
        `SELECT 
            p.id,
            p.name,
            p.description,
            p.price,
            p.stock,
            p.image_url,
            p.category_id,
            c.name AS category_name
         FROM products p
         LEFT JOIN categories c
         ON p.category_id = c.id
         WHERE p.category_id = ?
         ORDER BY p.id DESC`,
        [categoryId]
    );

    return products;
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProducts,
    getProductsByCategory
};
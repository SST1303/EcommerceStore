const productModel = require("../models/productModel");

const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            stock,
            image_url,
            category_id
        } = req.body;

        if (!name || price === undefined || stock === undefined) {
            return res.status(400).json({
                message: "Name, price and stock are required"
            });
        }

        const productId = await productModel.createProduct({
            name,
            description,
            price,
            stock,
            image_url,
            category_id
        });

        res.status(201).json({
            message: "Product created successfully",
            productId
        });

    } catch (error) {
        console.error("Create Product Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const getAllProducts = async (req, res) => {
    try {
        const products = await productModel.getAllProducts();

        res.status(200).json(products);

    } catch (error) {
        console.error("Get Products Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await productModel.getProductById(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);

    } catch (error) {
        console.error("Get Product Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const affectedRows = await productModel.updateProduct(id, req.body);

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product updated successfully"
        });

    } catch (error) {
        console.error("Update Product Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const affectedRows = await productModel.deleteProduct(id);

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("Delete Product Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const searchProducts = async (req, res) => {
    try {
        const { keyword } = req.query;

        if (!keyword) {
            return res.status(400).json({
                message: "Keyword is required"
            });
        }

        const products = await productModel.searchProducts(keyword);

        res.status(200).json(products);

    } catch (error) {
        console.error("Search Products Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const products =
            await productModel.getProductsByCategory(categoryId);

        res.status(200).json(products);

    } catch (error) {
        console.error("Category Filter Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
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
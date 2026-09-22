const express = require("express");

const router = express.Router();

const orderController = require("../controllers/orderController");

// Authentication and Admin authorization middlewares
const authMiddleware = require("../middleware/authMiddleware");

const adminMiddleware = require("../middleware/adminMiddleware");


// All order routes require authentication
router.use(authMiddleware);


// User Routes

router.post("/place", orderController.placeOrder);

router.get("/my-orders", orderController.getUserOrders);

router.get("/:id", orderController.getOrderDetails);


// Admin Routes

router.get(
    "/admin/all",
    adminMiddleware,
    orderController.getAllOrders
);

router.put(
    "/admin/:id/status",
    adminMiddleware,
    orderController.updateOrderStatus
);


module.exports = router;
const express = require("express");
const OrderController = require("../../controller/userController/OrderController");
const authMiddleware = require("../authMiddleware");

const router = express.Router();

router.post("/checkout", authMiddleware, OrderController.createOrder);
router.get( "/", authMiddleware,  OrderController.getUserOrders);

module.exports = router;
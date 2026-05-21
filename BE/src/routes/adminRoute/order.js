const express = require("express");
const OrderController = require("../../controller/adminController/OrderController");
const router = express.Router();
router.get("/", OrderController.getAllOrders);
router.get("/detail/:id", OrderController.getOrderDetailById);
router.put("/status/:id", OrderController.updateOrderStatus);
module.exports = router;
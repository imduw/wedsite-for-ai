
const express = require("express");
const CartController = require("../../controller/userController/CartController");
const authMiddleware = require("../authMiddleware");

const router = express.Router();

router.post("/add", authMiddleware, CartController.addToCart);
router.get("/", authMiddleware, CartController.getCart);
router.put("/items/:cartItemId", authMiddleware, CartController.updateCartItem);
router.delete("/items/:cartItemId", authMiddleware, CartController.removeCartItem);
module.exports = router;
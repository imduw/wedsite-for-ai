const express = require("express");
const ProductController= require("../../controller/userController/ProductController")
const router =express.Router();


router.get("/", ProductController.getAllProducts);
router.get("/get/:id", ProductController.getProductById);
router.get("/search", ProductController.searchProduct);
router.get("/categories", ProductController.getCategories);

module.exports = router;
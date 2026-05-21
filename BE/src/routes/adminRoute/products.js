
const express = require('express');
const ProductController = require('../../controller/adminController/ProductController');
const upload = require("../upload");
const router = express.Router();

router.get('/', ProductController.getAllProducts);
router.get('/get/:id', ProductController.getProductbyId);
router.post("/create", upload.single("image"), ProductController.addproduct);
router.put("/update/:id", upload.single("image"), ProductController.updateProduct);
router.delete('/delete/:id', ProductController.deleteProduct);
router.get('/search', ProductController.searchProduct);
module.exports = router;
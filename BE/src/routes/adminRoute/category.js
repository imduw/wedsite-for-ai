const express = require('express');
const CategoryController = require('../../controller/adminController/Category');
const router = express.Router();
router.get('/', CategoryController.getAllCategories);
router.post('/create', CategoryController.addCategory);
router.delete('/delete/:id', CategoryController.deleteCategory);
router.put('/update/:id', CategoryController.updateCategory);
module.exports = router;
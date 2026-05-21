const express = require("express");
const ReviewController = require("../../controller/userController/ReviewController");
const authMiddleware = require("../authMiddleware");

const router = express.Router();

router.get("/product/:productId", ReviewController.getProductReviews);
router.get("/eligible/:productId", authMiddleware, ReviewController.checkEligibility);
router.post("/", authMiddleware, ReviewController.createReview);
router.put("/:reviewId", authMiddleware, ReviewController.updateReview);

module.exports = router;
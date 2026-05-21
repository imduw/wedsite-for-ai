const express = require("express");
const DashboardController = require("../../controller/adminController/DashboardController");

const router = express.Router();

router.get("/summary", DashboardController.getSummary);

module.exports = router;
require("dotenv").config();
const cors = require("cors");
const express = require("express");
const passport = require("./config/passport");
//routes for admin
const productRoutes = require("./routes/adminRoute/products");
const categoryRoutes = require("./routes/adminRoute/category");
const userRoutes = require("./routes/adminRoute/user");
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/adminRoute/order");
const dashboardRoutes = require("./routes/adminRoute/dashboard");
//routes for user
const userOrderRoutes = require("./routes/userRoute/order");
const userProductRoutes = require("./routes/userRoute/product");
const userCartRoutes = require("./routes/userRoute/cart");
const userReviewRoutes = require("./routes/userRoute/review");


const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRoutes);
app.use("/admin/products", productRoutes);
app.use("/admin/categories", categoryRoutes);
app.use("/admin/users", userRoutes);
app.use("/admin/orders", orderRoutes);
app.use("/admin/dashboard", dashboardRoutes);
app.use("/user/orders", userOrderRoutes);
app.use("/user/products", userProductRoutes);
app.use("/user/cart", userCartRoutes);
app.use("/user/reviews", userReviewRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
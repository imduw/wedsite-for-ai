import { Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import UserLayout from "./layouts/UserLayout"
import Cart from "./pages/user/Cart"
import AdminLayout from "./layouts/AdminLayout"

import ProtectedRoute from "./components/ProtectedRoute"
import Dashboard from "./pages/admin/Dashboard"
import ManageOrder from "./pages/admin/ManageOrder"
import ManageUser from "./pages/admin/ManageUser"
import Home from "./pages/Home"
import Product from "./pages/admin/ManageProduct"
import ProductDetail from "./pages/user/ProductDetail"
import Categories from "./pages/admin/ManageCategory"
import Products from "./pages/user/Products"
import SearchResults from "./pages/user/SearchResults"
import UserOrders from "./pages/user/UserOders";
function App() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")
    const user = params.get("user")

    if (token && user) {
      const parsedUser = JSON.parse(decodeURIComponent(user))

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(parsedUser))

      if (parsedUser.role === "admin") {
        navigate("/admin/dashboard")
      } else {
        navigate("/")
      }
    }
  }, [navigate])

  return (
    <Routes>
      {/* USER */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="user/cart" element={<Cart />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="user/orders" element={<UserOrders />} />
      </Route>

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="orders" element={<ManageOrder />} />
        <Route path="customers" element={<ManageUser />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Product />} />
        <Route path="categories" element={<Categories />} />
      </Route>
    </Routes>
  )
}

export default App
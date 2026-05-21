
// export default Home
import { useEffect, useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
const API_BASE = "http://localhost:3000"

function Home() {
  const [allProducts, setAllProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCategories = async () => {
    try {
      const res = await axios.get(API_BASE + "/user/products/categories")
      setCategories(Array.isArray(res.data) ? res.data : [])
    } catch {
      setCategories([])
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await axios.get(API_BASE + "/user/products")
      setAllProducts(
        Array.isArray(res.data)
          ? res.data.map((p) => ({ ...p, price: Number(p.price) || 0 }))
          : []
      )
    } catch (e) {
      console.error(e)
      setAllProducts([])
    } finally {
      setLoading(false)
    }
  }

  // initial load
  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])




  const getProductsByCategory = (catId) => {
    return allProducts.filter((p) => Number(p.category_id) === Number(catId))
  }

  const ProductCard = ({ product }) => (
    <Link
      to={`/product/${product.id}`}
      className="block rounded-lg bg-white overflow-hidden shadow hover:shadow-lg transition"
    >
      <img
        src={product.image || "https://via.placeholder.com/300x300?text=No+Image"}
        alt={product.name}
        className="h-40 w-full object-cover"
      />
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
          {product.name}
        </h3>
        <p className="mt-2 text-lg font-bold text-orange-500">
          {Number(product.price || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 })} ₫
        </p>
        <p className="text-xs text-slate-500 mt-1">Còn {product.stock ?? 0}</p>
        <button
          onClick={(e) => {
            e.preventDefault()
            handleAddToCart(product.id)
          }}
          className="mt-2 w-full bg-slate-900 text-white py-1 rounded text-xs font-semibold"
        >
          + Giỏ
        </button>
      </div>
    </Link>
  )

  const handleAddToCart = async (productId) => {
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        `${API_BASE}/user/cart/add`,
        { product_id: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert("Đã thêm vào giỏ hàng")
    } catch (err) {
      alert(err?.response?.data?.message || "Thêm vào giỏ thất bại")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Banner */}
      <div className="bg-linear-to-b bg-slate-900 h-40 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">ShopNow</h1>
          <p className="text-white mt-2">Khám phá hàng ngàn sản phẩm chất lượng</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-center py-10 text-slate-500">Đang tải sản phẩm...</p>
        ) : (
          <>
            {categories.length === 0 ? (
              <p className="text-center py-10">Không có danh mục nào</p>
            ) : (
              categories.map((category) => {
                const catProducts = getProductsByCategory(category.id)
                if (catProducts.length === 0) return null

                return (
                  <div key={category.id} className="mb-10">
                    <div className="flex items-center gap-3 mb-5">
                      <h2 className="text-2xl font-bold text-slate-900">
                        {category.name}
                      </h2>
                      <div className="flex-1 h-px bg-slate-300"></div>
                      <Link
                        to={`/search?category_id=${category.id}&category_name=${encodeURIComponent(category.name)}`}
                        className="text-orange-500 hover:text-orange-600 font-semibold text-sm"
                      >
                        Xem tất cả →
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {catProducts.slice(0, 10).map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Home
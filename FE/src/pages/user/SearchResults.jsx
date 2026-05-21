import { useEffect, useState } from "react"
import axios from "axios"
import { Link, useSearchParams } from "react-router-dom"

const API_BASE = "http://localhost:3000"

function SearchResults() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const name = searchParams.get("name") || ""
  const categoryId = searchParams.get("category_id") || ""
  const categoryName = searchParams.get("category_name") || ""
  useEffect(() => {
    const fetchSearchResults = async () => {
      const term = name.trim()

      try {
        setLoading(true)
        setError("")

        const hasSearchFilters = term || categoryId

        const res = hasSearchFilters
          ? await axios.get(`${API_BASE}/user/products/search`, {
              params: {
                name: term,
                category_id: categoryId,
              },
            })
          : await axios.get(`${API_BASE}/user/products`)

        setProducts(
          Array.isArray(res.data)
            ? res.data.map((product) => ({ ...product, price: Number(product.price) || 0 }))
            : []
        )
      } catch (fetchError) {
        console.error(fetchError)
        setError("Không tải được kết quả tìm kiếm")
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchSearchResults()
  }, [name, categoryId])

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">Kết quả tìm kiếm</p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
              {name
                ? `Từ khóa: ${name}`
                : categoryName
                  ? `Danh mục: ${categoryName}`
                  : "Tất cả sản phẩm"}
            </h1>
          </div>
          <Link
            to="/"
            className="inline-flex w-fit items-center rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Quay về trang chủ
          </Link>
        </div>

        {loading ? (
          <p className="py-16 text-center text-slate-500">Đang tìm sản phẩm...</p>
        ) : error ? (
          <p className="py-16 text-center text-red-600">{error}</p>
        ) : products.length === 0 ? (
          <p className="py-16 text-center text-slate-500">Không tìm thấy sản phẩm phù hợp.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <img
                  src={product.image || "https://via.placeholder.com/300x300?text=No+Image"}
                  alt={product.name}
                  className="h-44 w-full object-cover object-center"
                />
                <div className="p-3">
                  <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-lg font-bold text-orange-500">
                    {Number(product.price || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 })} ₫
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Còn {product.stock ?? 0}</p>
                  {product.category_name ? (
                    <p className="mt-1 text-xs font-medium text-slate-400">{product.category_name}</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchResults
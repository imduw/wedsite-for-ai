import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { Link, useSearchParams } from "react-router-dom"

const API_BASE = "http://localhost:3000"

function Products() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [sort, setSort] = useState("featured")

    const name = searchParams.get("name") || ""
    const categoryId = searchParams.get("category_id") || ""

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get(`${API_BASE}/user/products/categories`)
                setCategories(Array.isArray(res.data) ? res.data : [])
            } catch {
                setCategories([])
            }
        }

        fetchCategories()
    }, [])

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true)
                setError("")

                const res = await axios.get(`${API_BASE}/user/products/search`, {
                    params: {
                        name: name.trim(),
                        category_id: categoryId,
                    },
                })

                setProducts(
                    Array.isArray(res.data)
                        ? res.data.map((product) => ({ ...product, price: Number(product.price) || 0 }))
                        : []
                )
            } catch (fetchError) {
                console.error(fetchError)
                setError("Không tải được danh sách sản phẩm")
                setProducts([])
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [name, categoryId])

    const categoryName = useMemo(() => {
        if (!categoryId) return ""
        return categories.find((category) => String(category.id) === String(categoryId))?.name || ""
    }, [categories, categoryId])

    const sortedProducts = useMemo(() => {
        const items = [...products]

        switch (sort) {
            case "price-asc":
                return items.sort((a, b) => a.price - b.price)
            case "price-desc":
                return items.sort((a, b) => b.price - a.price)
            case "newest":
                return items.sort((a, b) => Number(b.id) - Number(a.id))
            default:
                return items
        }
    }, [products, sort])

    const handleCategoryClick = (nextCategoryId) => {
        const nextParams = new URLSearchParams(searchParams)

        if (nextCategoryId) {
            nextParams.set("category_id", nextCategoryId)
        } else {
            nextParams.delete("category_id")
        }

        setSearchParams(nextParams)
    }

    const clearFilters = () => {
        setSearchParams({})
        setSort("featured")
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_34%),linear-gradient(180deg,_#0f172a_0%,_#111827_70%,_#f8fafc_70%)] text-white">
                <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">Catalog</p>
                    <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">Sản phẩm</h1>
                    <br>
                    </br>
                    <br></br>
                </div>
            </div>

            <div className="mx-auto -mt-8 max-w-7xl px-4 pb-10 md:px-6">
                <div className="rounded-3xl bg-white p-4 shadow-xl shadow-slate-200/60 md:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">Bộ lọc</p>
                            <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                                {name
                                    ? `Từ khóa: ${name}`
                                    : categoryName
                                        ? `Danh mục: ${categoryName}`
                                        : "Tất cả sản phẩm"}
                            </h2>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <select
                                value={sort}
                                onChange={(event) => setSort(event.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:border-amber-400"
                            >
                                <option value="featured">Nổi bật</option>
                                <option value="newest">Mới nhất</option>
                                <option value="price-asc">Giá tăng dần</option>
                                <option value="price-desc">Giá giảm dần</option>
                            </select>

                            <button
                                type="button"
                                onClick={clearFilters}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Xoá bộ lọc
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => handleCategoryClick("")}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${!categoryId ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                }`}
                        >
                            Tất cả
                        </button>

                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => handleCategoryClick(category.id)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${String(category.id) === String(categoryId)
                                    ? "bg-amber-400 text-slate-900"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                    {loading ? (
                        <p className="py-16 text-center text-slate-500">Đang tải sản phẩm...</p>
                    ) : error ? (
                        <p className="py-16 text-center text-red-600">{error}</p>
                    ) : sortedProducts.length === 0 ? (
                        <p className="py-16 text-center text-slate-500">Không có sản phẩm phù hợp.</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {sortedProducts.map((product) => (
                                <Link
                                    key={product.id}
                                    to={`/product/${product.id}`}
                                    className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
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
        </div>
    )
}

export default Products
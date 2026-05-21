import { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:3000'

export default function ManageProduct() {
  // const { showPopup } = usePopup()
  const [products, setProducts] = useState([])
  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image: '',
  })
  useEffect(() => {
    axios.get(`${API_BASE}/admin/products`)
      .then(res => {
        const formatted = Array.isArray(res.data)
          ? res.data.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: Number(p.price) || 0,
            stock: p.stock,
            category_id: p.category_id,
            image: p.image || "",
          }))
          : [];
        setProducts(formatted);
        
      });

    axios.get(`${API_BASE}/admin/categories`)
      .then(res => setCategories(res.data));
  }, []);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredProducts = products.filter(p => {
    const name = String(p.name || '').toLowerCase()
    const category = String(p.category_name || p.category || p.category_id || '').toLowerCase()

    return (
      name.includes(normalizedSearchTerm) ||
      category.includes(normalizedSearchTerm)
    )
  })

  const handleAddNew = () => {
    setEditingId(null)
    setFormData({ name: '', description: '', price: '', stock: '', category_id: '', image: '' })
    setFile(null)
    setShowModal(true)
  }

  const handleEdit = (product) => {
    setEditingId(product.id);
console.log(`Editing product: ${JSON.stringify(product)}`);
    setFormData({
      ...product,
      image: product.image || "",
    });

    setFile(null);

    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseInt(value) || '' : value
    }))
  }
  const handleSave = async () => {
    if (!formData.name || !formData.description || !formData.price || !formData.stock) {
      // showPopup({ message: "Vui lòng nhập đầy đủ", type: "error" })
      return;
    }

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("description", formData.description);
      payload.append("price", formData.price);
      payload.append("stock", formData.stock);
      payload.append("category_id", formData.category_id);
      if (!file && formData.image) {
        payload.append("image", formData.image);
      }

      if (file) {
        payload.append("image", file);
      }
      if (editingId) {
        await axios.put(`${API_BASE}/admin/products/update/${editingId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(`${API_BASE}/admin/products/create`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      const res = await axios.get(`${API_BASE}/admin/products`);

      const formatted = Array.isArray(res.data)
        ? res.data.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: Number(p.price) || 0,
          stock: p.stock,
          category_id: p.category_id,
          image: p.image || "",
        }))
        : [];

      setProducts(formatted);

      setShowModal(false);
      setFile(null);
      // showPopup({
      //   message: editingId ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm",
      //   type: "success",
      // })

    } catch (err) {
      console.error(err);
      // showPopup({ message: "Lỗi lưu sản phẩm", type: "error" })
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) return;

    try {
      await axios.delete(`${API_BASE}/admin/products/delete/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      // showPopup({ message: "Lỗi xóa sản phẩm", type: "error" })
    }
  };


  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-slate-900 p-6 text-white shadow-lg md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Admin / Products</p>
            <h1 className="mt-2 text-3xl font-bold">Quản lý sản phẩm</h1>
            <p className="mt-1 text-slate-300">Theo dõi, thêm mới, cập nhật và xóa sản phẩm.</p>
            <p className="mt-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
              Tổng số sản phẩm: {products.length}
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            + Thêm sản phẩm
          </button>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Ảnh</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Tên sản phẩm</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Danh mục</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Giá</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Kho</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                      <div className="text-5xl mb-3">📦</div>
                      Không tìm thấy sản phẩm nào
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">#{product.id}</td>
                      <td>
                        <img
                          src={product.image}
                          alt=""
                          className="h-16 w-16 rounded-lg object-cover object-center"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800">
                          {product.category_id}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {Number(product.price || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫
                      </td>
                      <td className="px-6 py-4">                        <div
                        style={{ width: `${Math.min(product.stock * 5, 100)}%` }}
                      ></div>
                        <span className="ml-1 text-sm font-medium text-slate-900">{product.stock}</span>

                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-2xl leading-none text-slate-600 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 px-6 py-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">Tên sản phẩm *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên sản phẩm"
                  className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">Mô tả *</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả"
                  className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">Danh mục *</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">Giá (₫) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Nhập giá"
                  className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">Số lượng kho *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="Nhập số lượng"
                  className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-900">
                  Ảnh sản phẩm
                </label>

                <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 p-4 text-center hover:bg-slate-50">

                  {file ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="mx-auto h-32 rounded-xl object-cover object-center"
                    />
                  ) : formData.image ? (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="mx-auto h-32 rounded-xl object-cover object-center"
                    />
                  ) : (
                    <span className="text-slate-500">
                      📷 Click để chọn ảnh
                    </span>
                  )}

                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const selectedFile = e.target.files[0];

                      if (selectedFile) {
                        setFile(selectedFile);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-900 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
              >
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
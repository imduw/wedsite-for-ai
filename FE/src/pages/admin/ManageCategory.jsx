import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3000";

export default function ManageCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/admin/categories`);
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
  
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = useMemo(() => {
    const kw = searchTerm.trim().toLowerCase();
    if (!kw) return categories;
    return categories.filter((c) => {
      const name = (c.name || "").toLowerCase();
      const description = (c.description || "").toLowerCase();
      return name.includes(kw) || description.includes(kw);
    });
  }, [categories, searchTerm]);

  const handleOpenAdd = () => {
    setFormData({ name: "", description: "" });
    setEditingId(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await axios.put(`${API_BASE}/admin/categories/update/${editingId}`, {
          name: formData.name.trim(),
          description: formData.description.trim(),
        });
      } else {
        await axios.post(`${API_BASE}/admin/categories/create`, {
          name: formData.name.trim(),
          description: formData.description.trim(),
        });
      }

      await fetchCategories();
      setShowModal(false);
    } catch (err) {
      console.error(err);
    
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa danh mục này?")) return;

    try {
      await axios.delete(`${API_BASE}/admin/categories/delete/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-slate-900 p-6 text-white shadow-lg md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Admin / Categories</p>
            <h1 className="mt-2 text-3xl font-bold">Quản lý danh mục</h1>
            <p className="mt-1 text-slate-300">Theo dõi, thêm mới và xóa danh mục sản phẩm.</p>
              <p className="mt-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
              Tổng số danh mục: {categories.length}
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            + Thêm danh mục
          </button>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên hoặc mô tả..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Tên danh mục</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Mô tả</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Hành động</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
                      Đang tải danh mục...
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
                      Không có danh mục phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-600">#{cat.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{cat.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{cat.description || "—"}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingId(cat.id);
                              setFormData({ name: cat.name || "", description: cat.description || "" });
                              setShowModal(true);
                            }}
                            className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-yellow-600"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
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
              <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-2xl leading-none text-slate-600 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 px-6 py-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">Tên danh mục *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Nhập tên danh mục"
                  className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">Mô tả</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Nhập mô tả"
                  className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
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
                disabled={saving}
                className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
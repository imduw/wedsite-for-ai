import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3000";

const statusMeta = {
    pending: { label: "Chờ xác nhận", className: "bg-amber-100 text-amber-800" },
    accepted: { label: "Đã xác nhận", className: "bg-blue-100 text-blue-800" },
    shipped: { label: "Đang giao", className: "bg-purple-100 text-purple-800" },
    completed: { label: "Hoàn tất", className: "bg-emerald-100 text-emerald-800" },
    cancelled: { label: "Đã hủy", className: "bg-rose-100 text-rose-800" },
};

const statusOptions = ["pending", "accepted", "shipped", "completed", "cancelled"];

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
});

const formatStatus = (status) => statusMeta[status]?.label || status;

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

export default function ManageOrder() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDetail, setShowDetail] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [savingStatus, setSavingStatus] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("");

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/admin/orders`);
            setOrders(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            alert("Không tải được danh sách đơn hàng");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        if (!keyword) return orders;

        return orders.filter((order) => {
            const id = String(order.id || "").toLowerCase();
            const status = String(order.status || "").toLowerCase();
            const customerName = String(order.customer_name || "").toLowerCase();
            const customerEmail = String(order.customer_email || "").toLowerCase();
            return (
                id.includes(keyword) ||
                status.includes(keyword) ||
                customerName.includes(keyword) ||
                customerEmail.includes(keyword)
            );
        });
    }, [orders, searchTerm]);

    const openDetail = async (orderId) => {
        try {
            setShowDetail(true);
            setDetailLoading(true);
            setSelectedOrder(null);
            setSelectedStatus("");

            const res = await axios.get(`${API_BASE}/admin/orders/detail/${orderId}`);
            setSelectedOrder(res.data);
            setSelectedStatus(res.data.status || "pending");
        } catch (err) {
            console.error(err);
            alert("Không tải được chi tiết đơn hàng");
            setShowDetail(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleSaveStatus = async () => {
        if (!selectedOrder) return;

        try {
            setSavingStatus(true);
            await axios.put(`${API_BASE}/admin/orders/status/${selectedOrder.id}`, {
                status: selectedStatus,
            });

            await fetchOrders();
            const res = await axios.get(`${API_BASE}/admin/orders/detail/${selectedOrder.id}`);
            setSelectedOrder(res.data);
            setSelectedStatus(res.data.status || selectedStatus);
            alert("Đã cập nhật trạng thái đơn hàng");
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Cập nhật trạng thái thất bại");
        } finally {
            setSavingStatus(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-slate-900 p-6 text-white shadow-lg md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Admin / Orders</p>
                        <h1 className="mt-2 text-3xl font-bold">Quản lý đơn hàng</h1>
                        <p className="mt-1 text-slate-300">Theo dõi, xem chi tiết và cập nhật trạng thái đơn hàng.</p>
                        <p className="mt-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
                            Tổng số đơn hàng: {orders.length}
                        </p>
                    </div>

                </div>

                <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm theo mã đơn, khách hàng, email hoặc trạng thái..."
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                </div>

                <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Mã đơn</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Khách hàng</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Tổng tiền</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Trạng thái</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Sản phẩm</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Ngày tạo</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                                            Đang tải đơn hàng...
                                        </td>
                                    </tr>
                                ) : filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                                            Không tìm thấy đơn hàng nào.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => {
                                        const meta = statusMeta[order.status] || statusMeta.pending;

                                        return (
                                            <tr key={order.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-900">#{order.id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-slate-900">{order.customer_name || `Khách hàng #${order.user_id}`}</div>
                                                    <div className="text-sm text-slate-500">{order.customer_email || "—"}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{formatCurrency(order.total_price)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>
                                                        {meta.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{order.item_count || 0} sản phẩm</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {order.created_at ? new Date(order.created_at).toLocaleString("vi-VN") : "—"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => openDetail(order.id)}
                                                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                                                    >
                                                        Xem chi tiết
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Chi tiết đơn hàng</p>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {selectedOrder ? `#${selectedOrder.id}` : "Đang tải..."}
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowDetail(false)}
                                className="rounded-full bg-slate-100 px-3 py-1 text-2xl leading-none text-slate-600 hover:bg-slate-200"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="max-h-[calc(90vh-80px)] overflow-y-auto px-6 py-5">
                            {detailLoading ? (
                                <div className="py-20 text-center text-slate-500">Đang tải chi tiết đơn hàng...</div>
                            ) : selectedOrder ? (
                                <div className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                                            <p className="text-sm text-slate-500">Khách hàng</p>
                                            <p className="mt-1 text-lg font-semibold text-slate-900">{selectedOrder.customer?.name || "—"}</p>
                                            <p className="text-sm text-slate-600">{selectedOrder.customer?.email || "—"}</p>
                                        </div>
                                        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                                            <p className="text-sm text-slate-500">Thông tin đơn hàng</p>
                                            <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-700">
                                                <span>Mã: #{selectedOrder.id}</span>
                                                <span>Tổng: {formatCurrency(selectedOrder.total_price)}</span>
                                                <span>
                                                    Ngày: {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString("vi-VN") : "—"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 p-4">
                                        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                                            <div>
                                                <p className="text-sm text-slate-500">Trạng thái hiện tại</p>
                                                <p className="text-xl font-bold text-slate-900">{formatStatus(selectedOrder.status)}</p>
                                            </div>
                                            <div className="flex flex-col gap-2 md:min-w-80 md:flex-row md:items-end">
                                                <div className="flex-1">
                                                    <label className="mb-1 block text-sm font-medium text-slate-700">Cập nhật trạng thái</label>
                                                    <select
                                                        value={selectedStatus}
                                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                    >
                                                        {statusOptions.map((status) => (
                                                            <option key={status} value={status}>
                                                                {formatStatus(status)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <button
                                                    onClick={handleSaveStatus}
                                                    disabled={savingStatus || selectedStatus === selectedOrder.status}
                                                    className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {savingStatus ? "Đang lưu..." : "Lưu trạng thái"}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="overflow-hidden rounded-2xl border border-slate-200">
                                            <table className="min-w-full">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Sản phẩm</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Hình ảnh</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Số lượng</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Đơn giá</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Tạm tính</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200">
                                                    {selectedOrder.items?.length ? (
                                                        selectedOrder.items.map((item, index) => (
                                                            <tr key={`${item.product_id}-${index}`} className="hover:bg-slate-50">
                                                                <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.product_name}</td>
                                                                <td className="px-4 py-3">
                                                                    {item.image ? (
                                                                        <img src={item.image} alt={item.product_name} className="h-12 w-12 rounded object-cover" />
                                                                    ) : (
                                                                        <div className="h-12 w-12 rounded bg-slate-200"></div>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-slate-600">{item.quantity}</td>
                                                                <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(item.price)}</td>
                                                                <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatCurrency(item.subtotal)}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="4" className="px-4 py-6 text-center text-slate-500">
                                                                Đơn hàng này chưa có sản phẩm.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

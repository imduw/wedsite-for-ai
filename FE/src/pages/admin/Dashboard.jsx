

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:3000'

const statusLabels = {
  pending: 'Chờ xác nhận',
  accepted: 'Đã xác nhận',
  shipped: 'Đang giao',
  completed: 'Đã hoàn tất',
  cancelled: 'Đã hủy',
}

const formatCurrency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

function getStatusClass(status) {
  if (status === 'completed') return 'bg-emerald-100 text-emerald-700'
  if (status === 'shipped') return 'bg-blue-100 text-blue-700'
  if (status === 'pending') return 'bg-amber-100 text-amber-700'
  if (status === 'accepted') return 'bg-cyan-100 text-cyan-700'
  return 'bg-rose-100 text-rose-700'
}

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentOrders: [],
    topProducts: [],
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`${API_BASE}/admin/dashboard/summary`)
        setDashboardData({
          stats: Array.isArray(res.data?.stats) ? res.data.stats : [],
          recentOrders: Array.isArray(res.data?.recentOrders) ? res.data.recentOrders : [],
          topProducts: Array.isArray(res.data?.topProducts) ? res.data.topProducts : [],
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const quickNote = useMemo(() => {
    const pendingOrders = dashboardData.recentOrders.filter((order) => order.status === 'pending').length
    const lowStockProducts = dashboardData.topProducts.filter((product) => product.stock <= 10).length
    return `Có ${pendingOrders} đơn hàng chờ xử lý và ${lowStockProducts} sản phẩm cần chú ý.`
  }, [dashboardData.recentOrders, dashboardData.topProducts])

  return (
    <div className="p-4 md:p-6 space-y-6 w-full">
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">Dashboard Admin</h1>
            <p className="mt-1 text-sm text-slate-500">Theo dõi hoạt động hệ thống bán hàng theo thời gian thực.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Xuất báo cáo
            </button>
            <button className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-amber-300">
              Tao khuyen mai
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading && dashboardData.stats.length === 0 ? (
          <div className="col-span-full rounded-xl bg-white p-4 shadow-sm text-slate-500">Đang tải dữ liệu...</div>
        ) : dashboardData.stats.map((item) => (
          <div key={item.label} className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-xl font-extrabold text-slate-900">
              {item.label.includes('Doanh thu') ? formatCurrency.format(Number(item.value || 0)) : item.value}
            </p>
            <p className="mt-1 text-sm font-semibold text-emerald-600">{item.change}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Don hang gan day</h3>
            <a href="/admin/orders" className="text-sm font-semibold text-blue-600 hover:underline">
              Xem tat ca
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-2 py-2">Mã đơn</th>
                  <th className="px-2 py-2">Khách hàng</th>
                  <th className="px-2 py-2">Tổng tiền</th>
                  <th className="px-2 py-2">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100">
                    <td className="px-2 py-3 font-semibold text-slate-800">{order.id}</td>
                    <td className="px-2 py-3 text-slate-700">{order.customer}</td>
                    <td className="px-2 py-3 text-slate-700">{formatCurrency.format(Number(order.total || 0))}</td>
                    <td className="px-2 py-3">
                      <span className={'rounded-full px-2 py-1 text-xs font-bold ' + getStatusClass(order.status)}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Sản phẩm bán chạy</h3>
            <ul className="mt-4 space-y-3">
              {dashboardData.topProducts.map((item) => (
                <li key={item.name} className="rounded-lg bg-slate-50 p-3">
                  <p className="font-semibold text-slate-800">{item.name}</p>
                  <p className="mt-1 text-xs text-slate-500">Đã bán: {item.sold} | Tồn kho: {item.stock}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-slate-900 p-5 text-slate-100 shadow-sm">
            <h3 className="text-lg font-bold">Thông báo nhanh</h3>
            <p className="mt-2 text-sm text-slate-300">{quickNote}</p>
            <button className="mt-4 rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-amber-300">
              Xử lý ngay
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
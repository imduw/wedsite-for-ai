import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SideBar({ user }) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/', { replace: true })
  }

  const menuItems = [
    { label: 'Tổng quan', icon: '📊', href: '/admin/dashboard', id: 'dashboard' },
    { label: 'Đơn hàng', icon: '📦', href: '/admin/orders', id: 'orders' },
    { label: 'Danh mục', icon: '📋', href: '/admin/categories', id: 'categories' },
    { label: 'Sản phẩm', icon: '🛍️', href: '/admin/products', id: 'products' },
    { label: 'Khách hàng', icon: '👥', href: '/admin/customers', id: 'customers' },
    { label: 'Báo cáo', icon: '📈', href: '/admin/reports', id: 'reports' },
    { label: 'Cài đặt', icon: '⚙️', href: '/admin/settings', id: 'settings' },
  ]

  return (
    <>
      {/* Hamburger Button (Mobile) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-slate-800 text-white md:hidden"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 text-slate-200 shadow-lg transition-transform duration-300 z-30 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-5 border-b border-slate-700">
          <h2 className="text-xl font-extrabold text-white">ShopNow</h2>
          <p className="text-xs text-slate-400 mt-1">Admin Panel</p>
        </div>

        {/* User Info */}
        <div className="mx-4 mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || 'A'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 px-3 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => {
                e.preventDefault()
                navigate(item.href)
                setIsOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors group cursor-pointer"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium group-hover:text-white">{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
          >
            <span>🚪</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Overlay (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
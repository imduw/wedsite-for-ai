import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Header() {
  const [search, setSearch] = useState('')
  const [user, setUser] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const navigate = useNavigate()


  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse user:', e)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    const term = search.trim()

    if (!term) return
    navigate(`/search?name=${encodeURIComponent(term)}`)
    setSearch('')
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
        <h1 className="text-2xl font-extrabold tracking-wide md:text-3xl">
          Shop<span className="text-amber-400">Now</span>
        </h1>

        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm sản phẩm..."
              className="w-full min-w-0 rounded-lg border border-white/15 bg-slate-800 px-4 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-amber-400 md:w-72"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-amber-300"
            >
              Tìm
            </button>
          </form>

          {!user ? (
            <button
              type="button"
              onClick={() => (window.location.href = 'http://localhost:3000/auth/google')}
              className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-900 hover:bg-slate-100"
            >
              Đăng nhập
            </button>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 hover:bg-slate-700"
              >
                <img
                  src={user.avatar || user.photos?.[0]?.value}
                  alt={user.name}
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-sm font-semibold">{user.name}</span>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-48 rounded-lg bg-white text-slate-900 shadow-lg">
                  <div className="border-b border-slate-200 px-4 py-2">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <a href="/user/cart" className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-100">
                    Xem giỏ hàng
                  </a>
                  

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full border-t border-slate-200 px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <nav className="border-y border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-200">
            <Link to="/" className="hover:text-amber-300">Trang chủ</Link>
            <Link to="/products" className="hover:text-amber-300">Sản phẩm</Link>
            <a href="#" className="hover:text-amber-300">Danh mục</a>
            <Link to="/user/orders" className="hover:text-amber-300">Đơn hàng của tôi</Link>
          </div>
          
        </div>
      </nav>
    </header>
  )
}

export default Header
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/',          icon: '🌸', label: 'Today'     },
  { to: '/overview',  icon: '🗓️', label: 'Overview'  },
  { to: '/analytics', icon: '📊', label: 'Analytics' },
  { to: '/rewards',   icon: '🏆', label: 'Rewards'   },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen bg-[#FFF8F8]">
      <aside className="w-64 shrink-0 bg-white shadow-soft flex flex-col py-8 px-5 sticky top-0 h-screen">
        <div className="mb-10">
          <h1 className="font-display text-2xl text-rose">Bloom</h1>
          <p className="text-xs text-text-light mt-0.5">your habit garden</p>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blush text-rose-dark shadow-soft'
                    : 'text-text-muted hover:bg-blush-light hover:text-text-primary'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-blush">
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="w-8 h-8 rounded-full bg-blush flex items-center justify-center text-rose font-medium text-sm">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary leading-tight">{user?.username}</p>
              <p className="text-xs text-text-light">building habits ✨</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/auth') }}
            className="w-full text-left text-xs text-text-light hover:text-rose px-4 py-2 rounded-xl hover:bg-blush-light transition-all"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

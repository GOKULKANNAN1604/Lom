/**
 * src/components/common/Sidebar.jsx
 * Left navigation sidebar — links to all pages.
 */
import { NavLink, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const NAV = [
  { to: '/dashboard',   icon: '🏠', label: 'Dashboard'  },
  { to: '/journal',     icon: '📓', label: 'Journal'    },
  { to: '/notes',       icon: '🗒️',  label: 'Notes'      },
  { to: '/finance',     icon: '💰', label: 'Finance'    },
  { to: '/performance', icon: '🔥', label: 'Performance'},
  { to: '/study',       icon: '📚', label: 'Study Vault'},
  { to: '/tech',        icon: '💻', label: 'Tech'       },
  { to: '/profile',     icon: '👤', label: 'Profile'    },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Mobile Drawer Overlay Background */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Navigation Drawer */}
      <aside
        className={`fixed left-0 top-0 h-screen w-56 border-r border-border
          bg-overlay flex flex-col z-50 transition-transform duration-300 md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🧠</span>
            <span className="font-bold text-primary text-sm tracking-wide">Life OS</span>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="md:hidden text-muted hover:text-primary p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl border border-border text-xs transition-colors"
            title="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose} // Auto-close drawer on mobile link click
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                 transition-all duration-150
                 ${isActive
                   ? 'bg-black/[0.05] dark:bg-white/[0.10] text-primary'
                   : 'text-muted hover:text-secondary hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                 }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout + Theme */}
        <div className="p-4 border-t border-border animate-fade-in">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-tech/20 border border-tech/30
                flex items-center justify-center text-xs font-bold text-tech shrink-0">
                {user?.username?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <span className="text-sm text-secondary truncate">{user?.username}</span>
            </div>
            
            <button 
              onClick={toggleTheme}
              className="w-7 h-7 rounded-lg border border-border bg-white/[0.03] dark:bg-black/20 flex items-center justify-center text-xs transition-all duration-200 cursor-pointer active:scale-95 hover:bg-black/5 dark:hover:bg-white/5 shrink-0"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
          <button onClick={logout} id="sidebar-logout"
            className="btn-ghost w-full text-xs py-1.5">
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

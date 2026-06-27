/**
 * src/components/common/MobileHeader.jsx
 * Sticky header for mobile viewports containing the hamburger menu button.
 */
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

export default function MobileHeader({ onMenuClick }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-overlay border-b border-border
      flex items-center justify-between px-4 z-30 md:hidden">
      
      {/* Menu / Hamburger button */}
      <button
        onClick={onMenuClick}
        className="p-2 text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-xl border border-border transition-colors"
        title="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Brand Name */}
      <div className="flex items-center gap-2">
        <span className="text-xl">🧠</span>
        <span className="font-bold text-primary text-sm tracking-wide">Life OS</span>
      </div>

      {/* Right Side: Theme Toggle + Profile Bubble */}
      <div className="flex items-center gap-2">
        <button 
          onClick={toggleTheme}
          className="w-8 h-8 rounded-xl border border-border bg-white/[0.03] dark:bg-black/20 flex items-center justify-center text-sm transition-all duration-200 cursor-pointer active:scale-95 hover:bg-black/5 dark:hover:bg-white/5"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className="w-8 h-8 rounded-xl bg-tech/20 border border-tech/30
          flex items-center justify-center text-xs font-bold text-tech">
          {user?.username?.[0]?.toUpperCase() ?? 'U'}
        </div>
      </div>
    </header>
  );
}

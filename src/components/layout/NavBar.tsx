import { NavLink } from 'react-router-dom'
import { useTheme } from './ThemeProvider'

const LINKS = [
  { to: '/', label: 'Type', end: true },
  { to: '/practice', label: 'Practice' },
  { to: '/break', label: 'Break' },
  { to: '/coach', label: 'Coach' },
  { to: '/history', label: 'History' },
]

export function NavBar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="w-full border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2 font-semibold text-lg" style={{ color: 'var(--accent)' }}>
          <span aria-hidden>⌨</span>
          <span>break{' '}type</span>
        </NavLink>

        <nav className="flex items-center gap-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive ? '' : 'hover:opacity-80'}`
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--bg)' : 'var(--text-subtle)',
                backgroundColor: isActive ? 'var(--accent)' : 'transparent',
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <NavLink
            to="/settings"
            className="px-3 py-1.5 rounded-md text-sm"
            style={{ color: 'var(--text-subtle)' }}
          >
            Settings
          </NavLink>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="px-3 py-1.5 rounded-md text-sm border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-subtle)' }}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
      </div>
    </header>
  )
}

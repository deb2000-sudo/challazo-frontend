import { useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../theme/useTheme'
import Icon from '../ui/Icon'
import { pageTitleFor } from './navItems'

/**
 * Fixed header beside the sidebar: page title on the left, notifications and
 * the theme switch on the right. On small screens it also carries the menu
 * button that opens the sidebar drawer.
 */
export default function TopBar({ onMenuClick, notificationCount = 0 }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const { isDark, toggleTheme } = useTheme()

  if (!user) return null

  const title = pageTitleFor(user, pathname)
  const badge = notificationCount > 30 ? '30+' : notificationCount

  return (
    <header className="topbar">
      <div className="topbar__start">
        <button
          type="button"
          className="topbar__menu"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Icon name="menu" size={22} />
        </button>
        <h2 className="topbar__title">{title}</h2>
      </div>

      <div className="topbar__end">
        <button
          type="button"
          className="topbar__icon-btn topbar__bell"
          aria-label={
            notificationCount ? `${notificationCount} notifications` : 'Notifications'
          }
        >
          <Icon name="bell" size={20} strokeWidth={1.6} />
          {notificationCount > 0 && <span className="topbar__badge">{badge}</span>}
        </button>

        <button
          type="button"
          className="topbar__icon-btn topbar__theme"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          title={isDark ? 'Light theme' : 'Dark theme'}
        >
          <Icon name={isDark ? 'sun' : 'moon'} size={20} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  )
}

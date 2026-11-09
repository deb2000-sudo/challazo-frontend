import { useState } from 'react'
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import BrandMark from '../brand/BrandMark'
import { useAuth } from '../../hooks/useAuth'
import { prefetchRouteData } from '../../lib/prefetch'
import { homePath } from '../../utils/access'
import Avatar from '../ui/Avatar'
import Icon from '../ui/Icon'
import { RoleBadge } from '../ui/Badge'
import ProfileModal from './ProfileModal'
import { isUnder, navFor } from './navItems'

/**
 * The app sidebar: a rail that collapses to icons (with hover tooltips) and
 * expands to full labels. `collapsed` is owned by Layout so the top bar and
 * content offset move with it. On small screens it becomes an off-canvas
 * drawer driven by `open`.
 */
export default function Navbar({ collapsed, onToggleCollapsed, open, onClose, onExpand }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)
  const links = navFor(user)

  const handleLogout = async () => {
    onClose()
    await logout()
    navigate('/login')
  }

  if (!user) return null

  const asideClass = ['sidebar', collapsed ? 'is-collapsed' : '', open ? 'is-open' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <>
      {open && (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}

      <aside className={asideClass} aria-label="Sidebar navigation">
        <div className="sidebar__header">
          <Link
            to={homePath(user)}
            className="brand sidebar__brand"
            onClick={onClose}
            data-tooltip="Challazo"
          >
            <BrandMark variant="c" size={36} title="Challazo" />
            <span className="brand__name czm-wordmark sidebar__label">Challazo</span>
          </Link>
          <button
            type="button"
            className="sidebar__close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Primary navigation">
          {links.map((link) => {
            if (link.children) {
              const groupActive = link.children.some((child) => isUnder(location.pathname, child.to))

              // Collapsed rail: a group has no room for its children, so the
              // button widens the sidebar and the group opens in place.
              if (collapsed) {
                return (
                  <button
                    key={link.label}
                    type="button"
                    className={`sidebar-link ${groupActive ? 'is-active' : ''}`}
                    data-tooltip={link.label}
                    onClick={onExpand}
                    aria-label={`${link.label} (expand navigation)`}
                  >
                    <span className="sidebar-link__icon"><Icon name={link.icon} size={18} /></span>
                    <span className="sidebar__label">{link.label}</span>
                    <Icon name="chevronDown" size={14} className="sidebar-link__arrow sidebar__label" />
                  </button>
                )
              }

              return (
                <details
                  className={`sidebar-nav-group ${groupActive ? 'is-active' : ''}`}
                  open={groupActive || undefined}
                  key={link.label}
                >
                  <summary className="sidebar-link" data-tooltip={link.label}>
                    <span className="sidebar-link__icon"><Icon name={link.icon} size={18} /></span>
                    <span className="sidebar__label">{link.label}</span>
                    <Icon name="chevronDown" size={14} className="sidebar-nav-group__chevron" />
                  </summary>
                  <div className="sidebar-nav-group__items">
                    {link.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        onMouseEnter={() => prefetchRouteData(child.to)}
                        onFocus={() => prefetchRouteData(child.to)}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `sidebar-sub-link ${isActive ? 'is-active' : ''}`
                        }
                      >
                        <span><Icon name={child.icon} size={15} /></span>
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                </details>
              )
            }
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onMouseEnter={() => prefetchRouteData(link.to)}
                onFocus={() => prefetchRouteData(link.to)}
                onClick={onClose}
                data-tooltip={link.label}
                className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
              >
                <span className="sidebar-link__icon"><Icon name={link.icon} size={18} /></span>
                <span className="sidebar__label">{link.label}</span>
                <Icon name="arrowRight" size={14} className="sidebar-link__arrow sidebar__label" />
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar__footer">
          <details className="sidebar-profile-menu">
            <summary className="sidebar-profile" data-tooltip={user.name}>
              <Avatar name={user.name} size="sm" />
              <div className="sidebar__label">
                <strong>{user.name}</strong>
                <RoleBadge account={user} />
              </div>
              <Icon name="chevronDown" size={15} className="sidebar-profile__chevron sidebar__label" />
            </summary>
            <div className="sidebar-profile-menu__popover">
              <div className="sidebar-profile-menu__heading">
                <small>Signed in as</small>
                <strong>{user.name}</strong>
              </div>
              <button
                type="button"
                className="sidebar-utility"
                onClick={(event) => {
                  event.currentTarget.closest('details')?.removeAttribute('open')
                  onClose()
                  setProfileOpen(true)
                }}
              >
                <Icon name="user" size={17} />
                Profile
              </button>
              <Link
                className="sidebar-utility"
                to="/settings/change-password"
                onClick={(event) => {
                  event.currentTarget.closest('details')?.removeAttribute('open')
                  onClose()
                }}
              >
                <Icon name="settings" size={17} />
                Settings
              </Link>
              <button type="button" className="sidebar-utility sidebar-utility--danger" onClick={handleLogout}>
                <Icon name="logout" size={17} />
                Sign out
              </button>
            </div>
          </details>
        </div>

        <button
          type="button"
          className="sidebar__toggle"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon name="chevronDown" size={14} strokeWidth={2.5} className="sidebar__toggle-icon" />
        </button>
      </aside>

      {/* Mounted only while open, so it fetches /auth/me fresh each time. */}
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </>
  )
}

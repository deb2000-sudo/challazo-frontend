import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { COMPLETE_PROFILE_PATH, needsProfileCompletion } from '../../utils/access'
import { useDropSurface } from '../drop/useDropSurface'
import { MobileNoticeBanner } from './DesktopOnly'
import Navbar from './Navbar'
import TopBar from './TopBar'

const COLLAPSED_KEY = 'challazo:sidebar-collapsed'

function readCollapsed() {
  try {
    const stored = window.localStorage.getItem(COLLAPSED_KEY)
    // The rail starts collapsed; the choice sticks once the user toggles it.
    return stored == null ? true : stored === '1'
  } catch {
    return true
  }
}

/**
 * App chrome for authenticated / main pages: sidebar + top bar + content +
 * footer. The sidebar's collapsed state lives here because the top bar and
 * the content offset both move with it.
 *
 * An account Super Admin created must finish its profile first, and until then
 * the API refuses every screen. So any page in this shell — /admin,
 * /super-admin, a typed URL — sends that user to /complete-profile, which lives
 * outside the shell (no sidebar). Only an explicit `false` redirects: students,
 * evaluators and seeded accounts are never blocked by a missing flag.
 */
export default function Layout() {
  useDropSurface()
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0')
    } catch {
      /* storage unavailable — the state still works for this session */
    }
  }, [collapsed])

  if (needsProfileCompletion(user)) {
    return <Navigate to={COMPLETE_PROFILE_PATH} replace />
  }

  return (
    <div className={`drop app-shell ${collapsed ? 'is-collapsed' : ''}`}>
      <Navbar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((value) => !value)}
        onExpand={() => setCollapsed(false)}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <TopBar onMenuClick={() => setDrawerOpen(true)} />
      <div className="app-content">
        <MobileNoticeBanner />
        <main className="grow">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

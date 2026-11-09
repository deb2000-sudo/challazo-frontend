import { adminPath, isAdminRole, PERMISSIONS, userPermissions } from '../../utils/access'
import { ROLES } from '../../utils/constants'

/**
 * Sidebar contents and the helpers that read them. Kept out of the component
 * files so the sidebar and the top bar can share them.
 */

const NAV_BY_ROLE = {
  [ROLES.STUDENT]: [
    { to: '/student', label: 'Dashboard', icon: 'chart', end: true },
    { to: '/student/submission', label: 'Submission', icon: 'upload' },
    { to: '/student/evaluations', label: 'Evaluations', icon: 'clipboard' },
    { to: '/hackathons', label: 'Hackathons', icon: 'trophy' },
  ],
  [ROLES.EVALUATOR]: [
    { to: '/evaluator', label: 'Assigned submissions', icon: 'clipboard', end: true },
    { to: '/hackathons', label: 'Hackathons', icon: 'trophy' },
  ],
}

/**
 * The admin sidebar. Each item carries the permission key that opens it, so a
 * custom role sees only its own screens; Admin and Super Admin see all of them.
 */
const ADMIN_NAV = [
  { to: '/admin', label: 'Overview', icon: 'chart', end: true, permission: PERMISSIONS.OVERVIEW },
  { to: '/admin/submissions', label: 'Submissions', icon: 'video', permission: PERMISSIONS.SUBMISSIONS },
  { to: '/hackathons', label: 'Hackathons', icon: 'trophy', permission: PERMISSIONS.HACKATHONS },
  { to: '/admin/themes', label: 'Themes', icon: 'sparkles', permission: PERMISSIONS.THEMES },
  {
    to: '/admin/evaluation-requirements',
    label: 'Requirements',
    icon: 'clipboard',
    permission: PERMISSIONS.REQUIREMENTS,
  },
  {
    to: '/admin/ai-prompts',
    label: 'Video Analysis',
    icon: 'sparkles',
    permission: PERMISSIONS.VIDEO_ANALYSIS,
  },
  {
    label: 'General Management',
    icon: 'users',
    children: [
      {
        to: '/admin/users',
        label: 'Student Management',
        icon: 'user',
        permission: PERMISSIONS.STUDENT_MANAGEMENT,
      },
      {
        to: '/admin/evaluators',
        label: 'Evaluator Management',
        icon: 'shield',
        permission: PERMISSIONS.EVALUATOR_MANAGEMENT,
      },
      // Campuses students pick from at registration — kept beside the people
      // pages because an unlisted campus blocks their sign-up.
      {
        to: '/admin/universities',
        label: 'University Management',
        icon: 'university',
        permission: PERMISSIONS.UNIVERSITY_MANAGEMENT,
      },
      {
        to: '/admin/batches',
        label: 'Batch Management',
        icon: 'calendar',
        permission: PERMISSIONS.BATCH_MANAGEMENT,
      },
    ],
  },
  {
    to: '/admin/settings',
    label: 'Application Settings',
    icon: 'settings',
    permission: PERMISSIONS.APPLICATION_SETTINGS,
  },
  {
    to: '/admin/analysis',
    label: 'Analysis',
    icon: 'chart',
    permission: PERMISSIONS.ANALYSIS,
  },
  // Super Admin only: no custom role can be given role_management.
  {
    label: 'Application Access',
    icon: 'shield',
    children: [
      {
        to: '/admin/access/roles',
        label: 'Application Managed Roles',
        icon: 'shield',
        permission: PERMISSIONS.ROLE_MANAGEMENT,
      },
      {
        to: '/admin/access/users',
        label: 'Application Managed Users',
        icon: 'userPlus',
        permission: PERMISSIONS.ROLE_MANAGEMENT,
      },
      {
        to: '/admin/application-logs',
        label: 'Application Logs',
        icon: 'chart',
        permission: PERMISSIONS.ROLE_MANAGEMENT,
      },
    ],
  },
]

/**
 * Sidebar items for this user, with groups that end up empty dropped. ADMIN_NAV
 * is written with /admin; a Super Admin's links move to /super-admin.
 * /hackathons is outside the admin shell and stays as it is.
 */
export function navFor(user) {
  if (!user) return []
  if (!isAdminRole(user.role)) return NAV_BY_ROLE[user.role] || []
  const allowed = userPermissions(user)
  const rehome = (item) => ({ ...item, to: adminPath(item.to, user) })
  return ADMIN_NAV.flatMap((item) => {
    if (!item.children) return allowed.includes(item.permission) ? [rehome(item)] : []
    const children = item.children
      .filter((child) => allowed.includes(child.permission))
      .map(rehome)
    return children.length ? [{ ...item, children }] : []
  })
}

/** True when `pathname` is `to` or sits underneath it (segment-aware). */
export function isUnder(pathname, to) {
  return pathname === to || pathname.startsWith(`${to}/`)
}

/** Screens that live outside the sidebar, keyed by path prefix. */
const EXTRA_TITLES = [
  ['/settings/change-password', 'Settings'],
  ['/student/submissions', 'Submission'],
  ['/student/new', 'Submission'],
  ['/evaluator/submissions', 'Assigned submissions'],
  ['/evaluator/evaluations', 'Assigned submissions'],
  ['/ai-scoring', 'AI Scoring'],
]

/**
 * The title shown in the top bar: the sidebar label whose path is the longest
 * match for the current URL, so /admin/submissions/42 still reads
 * "Submissions". Falls back to a humanised last path segment.
 */
export function pageTitleFor(user, pathname) {
  const entries = navFor(user).flatMap((item) => (item.children ? item.children : [item]))
  let best = null
  for (const entry of entries) {
    const matches = entry.end ? pathname === entry.to : isUnder(pathname, entry.to)
    if (matches && (!best || entry.to.length > best.to.length)) best = entry
  }
  if (best) return best.label

  const extra = EXTRA_TITLES.find(([prefix]) => isUnder(pathname, prefix))
  if (extra) return extra[1]

  const segment = pathname.split('/').filter(Boolean).pop() || 'Overview'
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

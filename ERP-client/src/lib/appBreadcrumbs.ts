export type AppBreadcrumbItem = {
  label: string
  to?: string
}

export function getAppBreadcrumbs(pathname: string): AppBreadcrumbItem[] {
  const p = pathname.replace(/\/$/, '') || '/'

  if (p === '/dashboard') {
    return [{ label: 'Dashboard' }]
  }

  if (p === '/profile') return [{ label: 'Profile' }]
  if (p === '/settings') return [{ label: 'Settings' }]
  if (p === '/help') return [{ label: 'Help & Support' }]
  if (p === '/users') return [{ label: 'Users' }]

  if (p === '/invoices') return [{ label: 'Invoices' }]
  if (p.startsWith('/invoices')) {
    const list: AppBreadcrumbItem = { label: 'Invoices', to: '/invoices' }
    if (p === '/invoices/create') return [list, { label: 'New Invoice' }]
    if (/^\/invoices\/edit\/[^/]+$/.test(p)) return [list, { label: 'Edit Invoice' }]
    const m = /^\/invoices\/([^/]+)$/.exec(p)
    if (m && m[1] !== 'create') return [list, { label: m[1] }]
  }

  if (p === '/inventory') return [{ label: 'Inventory' }]
  if (p.startsWith('/inventory')) {
    const list: AppBreadcrumbItem = { label: 'Inventory', to: '/inventory' }
    if (p === '/inventory/create') return [list, { label: 'New Item' }]
    if (/^\/inventory\/edit\/[^/]+$/.test(p)) return [list, { label: 'Edit Item' }]
    const m = /^\/inventory\/([^/]+)$/.exec(p)
    if (m && m[1] !== 'create') return [list, { label: m[1] }]
  }

  if (p === '/projects') return [{ label: 'Projects' }]
  if (p.startsWith('/projects')) {
    const list: AppBreadcrumbItem = { label: 'Projects', to: '/projects' }
    if (p === '/projects/create') return [list, { label: 'New Project' }]
    if (/^\/projects\/edit\/[^/]+$/.test(p)) return [list, { label: 'Edit Project' }]
    const m = /^\/projects\/([^/]+)$/.exec(p)
    if (m && m[1] !== 'create') return [list, { label: m[1] }]
  }

  const tail = p.split('/').filter(Boolean).pop() ?? 'Page'
  try {
    return [{ label: decodeURIComponent(tail) }]
  } catch {
    return [{ label: tail }]
  }
}

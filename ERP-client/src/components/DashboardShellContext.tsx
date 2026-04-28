import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'

/** localStorage key for persisted desktop drawer collapsed (mini) vs expanded. */
const DRAWER_COLLAPSED_STORAGE_KEY = 'erp-dashboard-drawer-collapsed'

function readStoredDrawerCollapsed(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = localStorage.getItem(DRAWER_COLLAPSED_STORAGE_KEY)
    if (raw === 'true') return true
    if (raw === 'false') return false
  } catch {
    /* private mode / quota */
  }
  return false
}

function writeStoredDrawerCollapsed(value: boolean) {
  try {
    localStorage.setItem(DRAWER_COLLAPSED_STORAGE_KEY, String(value))
  } catch {
    /* ignore */
  }
}

type DashboardShellContextValue = {
  desktopDrawerCollapsed: boolean
  setDesktopDrawerCollapsed: Dispatch<SetStateAction<boolean>>
}

const DashboardShellContext = createContext<DashboardShellContextValue | null>(null)

export function DashboardShellProvider({ children }: { children: ReactNode }) {
  const [desktopDrawerCollapsed, setDesktopDrawerCollapsedState] = useState(() =>
    readStoredDrawerCollapsed()
  )
  const setDesktopDrawerCollapsed = useCallback((action: SetStateAction<boolean>) => {
    setDesktopDrawerCollapsedState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action
      writeStoredDrawerCollapsed(next)
      return next
    })
  }, [])
  const value = useMemo(
    () => ({ desktopDrawerCollapsed, setDesktopDrawerCollapsed }),
    [desktopDrawerCollapsed, setDesktopDrawerCollapsed]
  )
  return <DashboardShellContext.Provider value={value}>{children}</DashboardShellContext.Provider>
}

export function useDashboardShell() {
  const ctx = useContext(DashboardShellContext)
  if (ctx == null) {
    throw new Error('useDashboardShell must be used within DashboardShellProvider')
  }
  return ctx
}

import { createRootRoute, Outlet } from '@tanstack/react-router'
import { useAuth } from '@/auth/AuthProvider'
import { AIAssistant } from '@/components/AIAssistant'
import { Alert } from '@mui/material'

function RootComponent() {
  const { isAuthenticated, error } = useAuth()

  return (
    <>
      {error && (
        <Alert
          severity="error"
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            right: 16,
            zIndex: 9999,
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      )}
      {isAuthenticated && <AIAssistant />}
      <Outlet />
    </>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})

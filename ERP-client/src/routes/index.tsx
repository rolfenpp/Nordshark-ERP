import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuth } from '@/auth/AuthProvider'

export const Route = createFileRoute('/')({
  component: IndexComponent,
})

function IndexComponent() {
  const { isAuthenticated } = useAuth()
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  } else {
    return <Navigate to="/login" replace />
  }
}

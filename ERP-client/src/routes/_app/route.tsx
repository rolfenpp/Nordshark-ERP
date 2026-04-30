import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppToastContainer } from '@/components/AppToastContainer'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'

export const Route = createFileRoute('/_app')({
  component: AppLayoutComponent,
})

function AppLayoutComponent() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AppToastContainer />
        <Outlet />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

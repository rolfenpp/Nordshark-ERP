import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { AppToastContainer } from '@/components/AppToastContainer'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import { RoutePageSkeleton } from '@/components/Skeletons'

export const Route = createFileRoute('/_app')({
  component: AppLayoutComponent,
})

function AppLayoutComponent() {
  const routeBusy = useRouterState({
    select: (s) => s.isLoading || s.status === 'pending',
  })

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AppToastContainer />
        {routeBusy ? <RoutePageSkeleton /> : <Outlet />}
      </DashboardLayout>
    </ProtectedRoute>
  )
}

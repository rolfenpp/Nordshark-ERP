import { createFileRoute } from '@tanstack/react-router'
import { useInvoices } from '@/api/invoices'
import { useUsers } from '@/api/users'
import { useProjects } from '@/api/projects'
import { useInventoryItems } from '@/api/inventory'
import { DashboardRouteView } from '@/components/dashboard/DashboardRouteView'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'

export const Route = createFileRoute('/_app/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: invoices = [], isLoading: lInv, isError: eInv, error: errInv } = useInvoices()
  const { isError: eUs, error: errUs } = useUsers()
  const { data: projects = [], isLoading: lPr, isError: ePr, error: errPr } = useProjects()
  const { data: inventory = [], isLoading: lIn, isError: eIn, error: errIn } = useInventoryItems()

  const firstError = [errInv, errUs, errPr, errIn].find((e) => e != null) as Error | undefined

  const loadingCore = lInv || lPr || lIn

  if (loadingCore) {
    return <DashboardSkeleton />
  }

  return (
    <DashboardRouteView
      invoices={invoices}
      projects={projects}
      inventory={inventory}
      firstError={firstError}
      eInv={eInv}
      eUs={eUs}
      ePr={ePr}
      eIn={eIn}
    />
  )
}


import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import { DashboardLayout } from './DashboardLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { FadeInContent } from './FadeInContent'
import { PageHeader } from './PageHeader'

export type ResourceListPageProps = {
  title: ReactNode
  actions?: ReactNode
  children: ReactNode
  fadeDelay?: number
  fadeDuration?: number
}

export function ResourceListPage({
  title,
  actions,
  children,
  fadeDelay = 100,
  fadeDuration = 600,
}: ResourceListPageProps) {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <FadeInContent delay={fadeDelay} duration={fadeDuration}>
          <Box>
            <PageHeader title={title} actions={actions} />
            {children}
          </Box>
        </FadeInContent>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

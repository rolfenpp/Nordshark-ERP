import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import { DashboardLayout } from './DashboardLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { FadeInContent } from './FadeInContent'
import { PageHeader } from './PageHeader'

export type ResourceListPageProps = {
  title: ReactNode
  /** Buttons / actions next to the title (Excel export, Create, etc.) */
  actions?: ReactNode
  children: ReactNode
  /** Passed to FadeInContent (matches prior per-route values). */
  fadeDelay?: number
  fadeDuration?: number
}

/**
 * Standard shell for dashboard list routes: auth → layout → fade → header + body.
 */
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

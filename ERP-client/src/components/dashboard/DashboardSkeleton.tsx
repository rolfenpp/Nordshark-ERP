import { Box, Skeleton } from '@mui/material'

const KPI_KEYS = [0, 1, 2, 3] as const

export function DashboardSkeleton() {
  return (
    <Box role="status" aria-live="polite">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        {KPI_KEYS.map((i) => (
          <Box
            key={i}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Skeleton variant="text" width="45%" height={22} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="70%" height={36} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="30%" height={16} />
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3,
          mb: 4,
        }}
      >
        <Skeleton variant="rounded" sx={{ borderRadius: 2, height: { xs: 280, lg: 320 } }} />
        <Skeleton variant="rounded" sx={{ borderRadius: 2, height: { xs: 260, lg: 320 } }} />
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 3,
        }}
      >
        <Skeleton variant="rounded" sx={{ borderRadius: 2, height: 220 }} />
        <Skeleton variant="rounded" sx={{ borderRadius: 2, height: 220 }} />
      </Box>
    </Box>
  )
}

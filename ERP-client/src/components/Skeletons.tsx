import { Box, Skeleton } from '@mui/material'

const STAT_KEYS = [0, 1, 2, 3] as const
const TABLE_ROWS = [0, 1, 2, 3, 4, 5, 6, 7] as const
const TABLE_COLS = [0, 1, 2, 3, 4, 5] as const

export function RoutePageSkeleton() {
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
        {STAT_KEYS.map((i) => (
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
            <Skeleton variant="text" width="50%" height={28} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="38%" height={18} />
          </Box>
        ))}
      </Box>
      <Skeleton variant="rounded" height={48} sx={{ mb: 2, borderRadius: 1 }} />
      <Box
        sx={{
          borderRadius: 1,
          overflow: 'hidden',
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${TABLE_COLS.length}, minmax(0, 1fr))`,
            gap: 1,
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {TABLE_COLS.map((c) => (
            <Skeleton key={c} variant="text" height={22} />
          ))}
        </Box>
        {TABLE_ROWS.map((r) => (
          <Box
            key={r}
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${TABLE_COLS.length}, minmax(0, 1fr))`,
              gap: 1,
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              '&:last-of-type': { borderBottom: 0 },
            }}
          >
            {TABLE_COLS.map((c) => (
              <Skeleton key={`${r}-${c}`} variant="text" height={18} />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

const FORM_FIELD_ROWS = [0, 1, 2, 3, 4, 5] as const

export function DetailRouteSkeleton() {
  return (
    <Box role="status" aria-live="polite">
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: { xs: 'stretch', md: 'flex-end' },
          mb: 3,
        }}
      >
        <Skeleton variant="rounded" width={100} height={36} sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' } }} />
        <Skeleton variant="rounded" width={100} height={36} sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' } }} />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 3 }}>
        <Box>
          <Skeleton variant="rounded" height={52} sx={{ mb: 2, borderRadius: 1 }} />
          <Skeleton variant="rounded" sx={{ borderRadius: 2, height: { xs: 160, sm: 200 } }} />
        </Box>
        <Skeleton variant="rounded" sx={{ borderRadius: 2, height: { xs: 200, sm: 240 } }} />
      </Box>
      <Box sx={{ borderRadius: 1, border: 1, borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, p: 2, borderBottom: 1, borderColor: 'divider' }}>
          {[0, 1, 2, 3, 4].map((c) => (
            <Skeleton key={c} variant="text" height={20} />
          ))}
        </Box>
        {[0, 1, 2].map((r) => (
          <Box
            key={r}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 1,
              p: 2,
              borderBottom: r < 2 ? 1 : 0,
              borderColor: 'divider',
            }}
          >
            {[0, 1, 2, 3, 4].map((c) => (
              <Skeleton key={c} variant="text" height={18} />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export function EditFormRouteSkeleton() {
  return (
    <Box role="status" aria-live="polite">
      <Box
        sx={{
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: 3,
          mb: 2,
        }}
      >
        <Skeleton variant="text" width={200} height={28} sx={{ mb: 3 }} />
        {FORM_FIELD_ROWS.map((i) => (
          <Box
            key={i}
            sx={{ mb: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}
          >
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={56} />
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'flex-end' }}>
        <Skeleton variant="rounded" width={100} height={36} />
        <Skeleton variant="rounded" width={120} height={36} />
      </Box>
    </Box>
  )
}

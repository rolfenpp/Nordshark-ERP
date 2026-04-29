import { Box, Skeleton } from '@mui/material'

const STAT_KEYS = [0, 1, 2, 3] as const
const TABLE_ROWS = [0, 1, 2, 3, 4, 5, 6, 7] as const
const TABLE_COLS = [0, 1, 2, 3, 4, 5] as const

/** Full-page placeholder while the router is resolving a lazy route (`_app/route.tsx`). */
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

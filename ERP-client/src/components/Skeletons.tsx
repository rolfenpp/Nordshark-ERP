import { Box, Skeleton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'

interface TableSkeletonProps {
  rows?: number
  columns?: number
  showHeader?: boolean
}

export function TableSkeleton({ rows = 5, columns = 6, showHeader = true }: TableSkeletonProps) {
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table>
          {showHeader && (
            <TableHead>
              <TableRow>
                {Array.from({ length: columns }).map((_, index) => (
                  <TableCell key={index}>
                    <Skeleton variant="text" width="80%" height={24} />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton variant="text" width="90%" height={20} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}

export function DashboardSkeleton() {
  return (
    <Box>
      <Skeleton variant="text" width="60%" height={48} sx={{ mb: 3 }} />
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {[1, 2, 3, 4].map((item) => (
          <Box key={item} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, textAlign: 'center' }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mx: 'auto', mb: 1 }} />
            <Skeleton variant="text" width="60%" height={32} sx={{ mx: 'auto', mb: 1 }} />
            <Skeleton variant="text" width="40%" height={20} sx={{ mx: 'auto' }} />
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="90%" height={20} />
        </Box>
        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Skeleton variant="text" width="50%" height={32} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="70%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="85%" height={20} />
        </Box>
      </Box>
    </Box>
  )
}

export function ProjectsSkeleton() {
  return (
    <Box>
      <Skeleton variant="text" width="60%" height={48} sx={{ mb: 3 }} />
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {[1, 2, 3, 4].map((item) => (
          <Box key={item} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, textAlign: 'center' }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mx: 'auto', mb: 1 }} />
            <Skeleton variant="text" width="60%" height={32} sx={{ mx: 'auto', mb: 1 }} />
            <Skeleton variant="text" width="40%" height={20} sx={{ mx: 'auto' }} />
          </Box>
        ))}
      </Box>

      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, mb: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={56} />
      </Box>

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 1, overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 2 }}>
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton key={index} variant="text" width="80%" height={24} />
            ))}
          </Box>
        </Box>
        
        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <Box key={rowIndex} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 2 }}>
              {Array.from({ length: 10 }).map((_, colIndex) => (
                <Box key={colIndex}>
                  {colIndex === 0 ? (
                    <Box>
                      <Skeleton variant="text" width="90%" height={20} sx={{ mb: 0.5 }} />
                      <Skeleton variant="text" width="60%" height={16} />
                    </Box>
                  ) : colIndex === 4 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 1 }} />
                      <Skeleton variant="text" width="30%" height={16} />
                    </Box>
                  ) : colIndex === 5 ? (
                    <Box>
                      <Skeleton variant="text" width="70%" height={20} sx={{ mb: 0.5 }} />
                      <Skeleton variant="text" width="50%" height={16} />
                    </Box>
                  ) : colIndex === 7 ? (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {Array.from({ length: 3 }).map((_, avatarIndex) => (
                        <Skeleton key={avatarIndex} variant="circular" width={24} height={24} />
                      ))}
                    </Box>
                  ) : (
                    <Skeleton variant="text" width="90%" height={20} />
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export function InventorySkeleton() {
  return (
    <Box>
      <Skeleton variant="text" width="60%" height={48} sx={{ mb: 3 }} />
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {[1, 2, 3, 4].map((item) => (
          <Box key={item} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, textAlign: 'center' }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mx: 'auto', mb: 1 }} />
            <Skeleton variant="text" width="60%" height={32} sx={{ mx: 'auto', mb: 1 }} />
            <Skeleton variant="text" width="40%" height={20} sx={{ mx: 'auto' }} />
          </Box>
        ))}
      </Box>

      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, mb: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={56} />
      </Box>

      <TableSkeleton rows={8} columns={9} />
    </Box>
  )
}

export function InvoicesSkeleton() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Skeleton variant="text" width="40%" height={48} />
        <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
      </Box>
      <TableSkeleton rows={6} columns={6} />
    </Box>
  )
}

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type DataTableColumn<T> = {
  id: string
  label: string
  align?: 'left' | 'right' | 'center'
  hideOnCompact?: boolean
  sortable?: boolean
  sortAccessor?: (row: T) => string | number | Date | null | undefined
  render: (row: T) => ReactNode
}

function compareCell(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number' && !Number.isNaN(a) && !Number.isNaN(b)) {
    return a - b
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime()
  }
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

export type DataTableProps<T> = {
  rows: T[]
  columns: DataTableColumn<T>[]
  getRowId: (row: T) => string | number
  compact?: boolean
  emptyMessage?: string
  isDesktop: boolean
  renderMobileRow?: (row: T) => ReactNode
  defaultRowsPerPage?: number
  rowsPerPageOptions?: number[]
  paperSx?: SxProps<Theme>
  'aria-label'?: string
}

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  compact = false,
  emptyMessage = 'No data',
  isDesktop,
  renderMobileRow,
  defaultRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25, 50],
  paperSx,
  'aria-label': ariaLabel,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage)
  const [orderBy, setOrderBy] = useState<string | null>(null)
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    setPage(0)
  }, [rows])

  const sortedRows = useMemo(() => {
    if (!orderBy) return rows
    const col = columns.find((c) => c.id === orderBy)
    if (!col?.sortAccessor) return rows
    return [...rows].sort((a, b) => {
      const cmp = compareCell(col.sortAccessor!(a), col.sortAccessor!(b))
      return order === 'asc' ? cmp : -cmp
    })
  }, [rows, columns, orderBy, order])

  const pageCount = Math.max(0, Math.ceil(sortedRows.length / rowsPerPage) - 1)
  const safePage = Math.min(page, pageCount)

  const paginatedRows = useMemo(() => {
    const start = safePage * rowsPerPage
    return sortedRows.slice(start, start + rowsPerPage)
  }, [sortedRows, safePage, rowsPerPage])

  const handleSort = (columnId: string) => {
    const col = columns.find((c) => c.id === columnId)
    if (!col?.sortable || !col.sortAccessor) return
    if (orderBy === columnId) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setOrderBy(columnId)
      setOrder('asc')
    }
  }

  const visibleColumns = columns.filter((c) => !(compact && c.hideOnCompact))

  const pagination = (
    <TablePagination
      component="div"
      count={sortedRows.length}
      page={safePage}
      onPageChange={(_, newPage) => setPage(newPage)}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={(e) => {
        setRowsPerPage(Number.parseInt(e.target.value, 10))
        setPage(0)
      }}
      rowsPerPageOptions={rowsPerPageOptions}
      labelRowsPerPage="Rows per page"
    />
  )

  if (!isDesktop && renderMobileRow) {
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden', ...paperSx }}>
        <Box sx={{ display: 'grid', gap: 2, p: paginatedRows.length ? 0 : 2 }}>
          {paginatedRows.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>{emptyMessage}</Box>
          ) : (
            paginatedRows.map((row) => (
              <Box key={String(getRowId(row))}>{renderMobileRow(row)}</Box>
            ))
          )}
        </Box>
        {pagination}
      </Paper>
    )
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', ...paperSx }}>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table stickyHeader size={compact ? 'small' : 'medium'} aria-label={ariaLabel}>
          <TableHead>
            <TableRow>
              {visibleColumns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align}
                  sortDirection={orderBy === col.id ? order : false}
                  sx={{ whiteSpace: 'nowrap', fontWeight: 300 }}
                >
                  {col.sortable && col.sortAccessor ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : 'asc'}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} align="center" sx={{ py: 4 }}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row) => (
                <TableRow key={String(getRowId(row))} hover>
                  {visibleColumns.map((col) => (
                    <TableCell key={col.id} align={col.align}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {pagination}
    </Paper>
  )
}

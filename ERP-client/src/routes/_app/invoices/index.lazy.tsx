import { createLazyFileRoute } from '@tanstack/react-router'
import { ResourceListPage } from '@/components/ResourceListPage'
import { ListPageToolbar } from '@/components/ListPageToolbar'
import { PrimaryActionButton } from '@/components/PrimaryActionButton'
import { ListStatsGrid } from '@/components/ListStatsGrid'
import { ListStatCard } from '@/components/ListStatCard'
import { ListSummaryFooter } from '@/components/ListSummaryFooter'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import {
  Alert,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { keyframes } from '@mui/system'
import {
  Search,
  Edit,
  Delete,
  Visibility,
  Receipt,
  Warning,
  CheckCircle,
  Schedule,
  Download,
  Email,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useState, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { exportToExcel } from '@/lib/excelExport'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useCompactListLayout } from '@/hooks/useCompactListLayout'
import { LIST_SEARCH_DEBOUNCE_MS } from '@/lib/listBreakpoints'
import { useInvoices, useDeleteInvoice, type InvoiceListDto, type InvoiceStatus } from '@/api/invoices'
import { normalizeInvoiceStatus } from '@/lib/statusNormalize'
import { formatDisplayDate, parseApiDate } from '@/lib/dates'
import { format } from 'date-fns'

const exportSpinner = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

export const Route = createLazyFileRoute('/_app/invoices/')({
  component: InvoicesIndexComponent,
})

function buildInvoicesExportSheet(
  invoices: InvoiceListDto[],
  getStatusLabel: (status: string) => string
): (string | number)[][] {
  const header: string[] = [
    'Invoice #',
    'Date',
    'Due Date',
    'Client',
    'Client Email',
    'Subtotal',
    'Tax',
    'Total',
    'Status',
    'Payment Method',
    'Paid Date',
  ]
  const rows = invoices.map((invoice) => [
    invoice.invoiceNumber,
    formatDisplayDate(invoice.issueDate),
    formatDisplayDate(invoice.dueDate),
    invoice.clientName,
    invoice.clientEmail ?? 'N/A',
    invoice.subtotal,
    invoice.taxAmount,
    invoice.total,
    getStatusLabel(invoice.status),
    invoice.paymentMethod || 'N/A',
    invoice.paidDate ? formatDisplayDate(invoice.paidDate) : 'N/A',
  ])
  return [header, ...rows]
}

function getStatusLabel(status: string) {
  const s = normalizeInvoiceStatus(status)
  switch (s) {
    case 'paid':
      return 'Paid'
    case 'pending':
      return 'Pending'
    case 'overdue':
      return 'Overdue'
    case 'draft':
      return 'Draft'
    default:
      return status || '—'
  }
}

function getStatusColor(status: string) {
  const s = normalizeInvoiceStatus(status)
  switch (s) {
    case 'paid':
      return 'success'
    case 'pending':
      return 'warning'
    case 'overdue':
      return 'error'
    case 'draft':
      return 'default'
    default:
      return 'default'
  }
}

function InvoicesIndexComponent() {
  const navigate = useNavigate()
  const theme = useTheme()
  const smUp = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true })
  const compactList = useCompactListLayout()

  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebouncedValue(searchTerm, LIST_SEARCH_DEBOUNCE_MS)
  const [filterStatus, setFilterStatus] = useState<'all' | InvoiceStatus>('all')
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const exportBtnRef = useRef<HTMLButtonElement | null>(null)

  const { data: list = [], isLoading, isError, error: listError } = useInvoices()
  const deleteInvoice = useDeleteInvoice()

  const filteredInvoices = useMemo(() => {
    let filtered = list
    if (filterStatus !== 'all') {
      filtered = filtered.filter((invoice) => normalizeInvoiceStatus(invoice.status) === filterStatus)
    }
    if (debouncedSearchTerm.trim()) {
      const q = debouncedSearchTerm.toLowerCase()
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(q) ||
          invoice.clientName.toLowerCase().includes(q) ||
          (invoice.clientEmail ?? '').toLowerCase().includes(q)
      )
    }
    return filtered
  }, [list, debouncedSearchTerm, filterStatus])

  const toDetail = useCallback(
    (id: number) => navigate({ to: '/invoices/$invoiceId', params: { invoiceId: String(id) } }),
    [navigate]
  )
  const toEdit = useCallback(
    (id: number) => navigate({ to: '/invoices/edit/$invoiceId', params: { invoiceId: String(id) } }),
    [navigate]
  )

  const confirmDelete = useCallback(
    (id: number, invoiceNumber: string) => {
      if (window.confirm(`Delete invoice ${invoiceNumber}? This cannot be undone.`)) {
        void deleteInvoice.mutate(id)
      }
    },
    [deleteInvoice]
  )

  const columns: DataTableColumn<InvoiceListDto>[] = useMemo(
    () => [
      {
        id: 'number',
        label: 'Invoice #',
        sortable: true,
        sortAccessor: (inv) => inv.invoiceNumber,
        render: (invoice) => (
          <Typography
            variant="subtitle2"
            sx={{ cursor: 'pointer' }}
            onClick={() => toDetail(invoice.id)}
          >
            {invoice.invoiceNumber}
          </Typography>
        ),
      },
      {
        id: 'issue',
        label: 'Date',
        hideOnCompact: true,
        sortable: true,
        sortAccessor: (inv) => parseApiDate(inv.issueDate)?.getTime() ?? 0,
        render: (invoice) => formatDisplayDate(invoice.issueDate),
      },
      {
        id: 'due',
        label: 'Due Date',
        hideOnCompact: true,
        sortable: true,
        sortAccessor: (inv) => parseApiDate(inv.dueDate)?.getTime() ?? 0,
        render: (invoice) => formatDisplayDate(invoice.dueDate),
      },
      {
        id: 'client',
        label: 'Client',
        sortable: true,
        sortAccessor: (inv) => inv.clientName.toLowerCase(),
        render: (invoice) => (
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {invoice.clientName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: compactList ? 'none' : 'inline' }}>
              {invoice.clientEmail}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'subtotal',
        label: 'Amount',
        align: 'right',
        hideOnCompact: true,
        sortable: true,
        sortAccessor: (inv) => inv.subtotal,
        render: (invoice) => `$${invoice.subtotal.toFixed(2)}`,
      },
      {
        id: 'tax',
        label: 'Tax',
        align: 'right',
        hideOnCompact: true,
        sortable: true,
        sortAccessor: (inv) => inv.taxAmount,
        render: (invoice) => `$${invoice.taxAmount.toFixed(2)}`,
      },
      {
        id: 'total',
        label: 'Total',
        align: 'right',
        sortable: true,
        sortAccessor: (inv) => inv.total,
        render: (invoice) => (
          <Typography variant="body2" fontWeight="medium">
            ${invoice.total.toFixed(2)}
          </Typography>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        sortable: true,
        sortAccessor: (inv) => inv.status,
        render: (invoice) => (
          <Chip
            label={getStatusLabel(invoice.status)}
            color={getStatusColor(invoice.status) as 'success' | 'default' | 'warning' | 'error'}
            size="small"
          />
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'center',
        render: (invoice) => (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Tooltip title="View Details">
              <IconButton size="small" color="primary" onClick={() => toDetail(invoice.id)}>
                <Visibility />
              </IconButton>
            </Tooltip>
            <Box sx={{ display: compactList ? 'none' : 'inline-flex' }}>
              <Tooltip title="Edit Invoice">
                <IconButton size="small" color="warning" onClick={() => toEdit(invoice.id)}>
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Not available in this app version">
                <span>
                  <IconButton size="small" color="info" disabled>
                    <Download />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Not available in this app version">
                <span>
                  <IconButton size="small" color="secondary" disabled>
                    <Email />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Delete invoice">
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => confirmDelete(invoice.id, invoice.invoiceNumber)}
                    disabled={deleteInvoice.isPending}
                  >
                    <Delete />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
        ),
      },
    ],
    [compactList, toDetail, toEdit, confirmDelete, deleteInvoice.isPending]
  )

  const handleExportClick = () => setShowExportDialog(true)
  const handleExportCancel = () => setShowExportDialog(false)
  const handleExportConfirm = () => {
    setIsExporting(true)
    try {
      const sheet = buildInvoicesExportSheet(filteredInvoices, getStatusLabel)
      const currentDate = format(new Date(), 'yyyy-MM-dd')
      exportToExcel(sheet, {
        filename: `invoices-export-${currentDate}.xlsx`,
        sheetName: 'Invoices',
      })
      setShowExportDialog(false)
    } catch (error) {
      console.error('Export failed:', error)
      alert(`Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsExporting(false)
    }
  }

  const totalInvoices = list.length
  const totalAmount = list.reduce((sum, invoice) => sum + invoice.total, 0)
  const paidInvoices = list.filter((invoice) => normalizeInvoiceStatus(invoice.status) === 'paid').length
  const overdueInvoices = list.filter((invoice) => normalizeInvoiceStatus(invoice.status) === 'overdue').length

  const exportButton = (
    <Button
      variant="outlined"
      startIcon={<Download />}
      onClick={handleExportClick}
      disabled={filteredInvoices.length === 0}
      sx={{
        borderColor: 'success.main',
        color: 'success.main',
        '&:hover': { borderColor: 'success.main', backgroundColor: 'success.main', color: 'white' },
        '&:disabled': { borderColor: 'action.disabled', color: 'action.disabled' },
      }}
      ref={exportBtnRef}
    >
      Export Excel
    </Button>
  )

  if (isLoading) {
    return null
  }

  return (
    <ResourceListPage>
      <ListStatsGrid compact={compactList}>
        <ListStatCard icon={Receipt} iconColor="primary" value={totalInvoices.toLocaleString()} label="Total Invoices" />
        <ListStatCard icon={CheckCircle} iconColor="success" value={paidInvoices.toLocaleString()} label="Paid" />
        <ListStatCard
          icon={Schedule}
          iconColor="info"
          value={list.filter((i) => normalizeInvoiceStatus(i.status) === 'pending').length.toLocaleString()}
          label="Pending"
        />
        <ListStatCard icon={Warning} iconColor="warning" value={overdueInvoices.toLocaleString()} label="Overdue" />
      </ListStatsGrid>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(listError as Error)?.message || 'Failed to load invoices.'}
        </Alert>
      )}

      <ListPageToolbar
        search={
          <TextField
            fullWidth
            size="small"
            placeholder="Search by invoice number, client, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        }
        filters={
          <FormControl fullWidth size="small">
            <InputLabel id="invoices-status-filter-label">Status</InputLabel>
            <Select
              labelId="invoices-status-filter-label"
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value as 'all' | InvoiceStatus)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
            </Select>
          </FormControl>
        }
        actions={
          <>
            {exportButton}
            <PrimaryActionButton label="New Invoice" to="/invoices/create" />
          </>
        }
      />

      <DataTable<InvoiceListDto>
          columns={columns}
          rows={filteredInvoices}
          getRowId={(r) => r.id}
          compact={compactList}
          isDesktop={smUp}
          emptyMessage="No invoices match your filters."
          defaultRowsPerPage={10}
          renderMobileRow={(inv) => (
            <Card variant="outlined">
              <CardContent sx={{ display: 'grid', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">{inv.invoiceNumber}</Typography>
                  <Chip
                    label={getStatusLabel(inv.status)}
                    color={getStatusColor(inv.status) as 'success' | 'default' | 'warning' | 'error'}
                    size="small"
                  />
                </Box>
                <Typography variant="body2">{inv.clientName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Due {formatDisplayDate(inv.dueDate)}
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>${inv.total.toFixed(2)}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button
                    size="small"
                    onClick={() => toDetail(inv.id)}
                    startIcon={<Visibility />}
                  >
                    View
                  </Button>
                  <Button size="small" onClick={() => toEdit(inv.id)} startIcon={<Edit />}>
                    Edit
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        />

      <ListSummaryFooter
          primary={
            <Typography variant="body2" color="text.secondary">
              Showing {filteredInvoices.length} of {list.length} invoices
            </Typography>
          }
        >
          <Typography variant="body2" color="text.secondary">
            Total Amount: <strong>${totalAmount.toLocaleString()}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Paid:{' '}
            <strong>
              $
              {filteredInvoices
                .filter((i) => normalizeInvoiceStatus(i.status) === 'paid')
                .reduce((sum, i) => sum + i.total, 0)
                .toLocaleString()}
            </strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Outstanding:{' '}
            <strong>
              $
              {filteredInvoices
                .filter((i) => normalizeInvoiceStatus(i.status) !== 'paid')
                .reduce((sum, i) => sum + i.total, 0)
                .toLocaleString()}
            </strong>
          </Typography>
        </ListSummaryFooter>

      <Dialog
        open={showExportDialog}
        onClose={isExporting ? undefined : handleExportCancel}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown={isExporting}
        aria-labelledby="export-dialog-title"
        aria-describedby="export-dialog-description"
        disableRestoreFocus
        closeAfterTransition
        TransitionProps={{ onExited: () => exportBtnRef.current?.focus() }}
      >
        <DialogTitle id="export-dialog-title">Export to Excel</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph id="export-dialog-description">
            This will export {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} to an Excel file.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Columns: Invoice #, Date, Due Date, Client, Client Email, Subtotal, Tax, Total, Status, Payment Method, Paid
            Date.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExportCancel} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            onClick={handleExportConfirm}
            variant="outlined"
            disabled={isExporting}
            startIcon={
              isExporting ? (
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    border: '2px solid currentColor',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: `${exportSpinner} 1s linear infinite`,
                  }}
                />
              ) : (
                <Download />
              )
            }
            sx={{
              borderColor: 'success.main',
              color: 'success.main',
              '&:hover': { borderColor: 'success.main', backgroundColor: 'success.main', color: 'white' },
              '&:disabled': { borderColor: 'action.disabled', color: 'action.disabled' },
            }}
            autoFocus
          >
            {isExporting ? 'Exporting...' : 'Download Excel'}
          </Button>
        </DialogActions>
      </Dialog>
    </ResourceListPage>
  )
}

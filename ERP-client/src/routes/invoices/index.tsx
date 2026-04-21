import { createFileRoute } from '@tanstack/react-router'
import { TableSkeleton } from '../../components/Skeletons'
import { ResourceListPage } from '../../components/ResourceListPage'
import { ListStatsGrid } from '../../components/ListStatsGrid'
import { ListSummaryFooter } from '../../components/ListSummaryFooter'
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  Receipt,
  Warning,
  CheckCircle,
  Schedule,
  Download,
  Email
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { exportToExcel } from '../../lib/excelExport'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useCompactListLayout } from '../../hooks/useCompactListLayout'
import { LIST_SEARCH_DEBOUNCE_MS } from '../../lib/listBreakpoints'

export const Route = createFileRoute('/invoices/')({
  component: InvoicesIndexComponent,
})

type Invoice = {
  id: string
  invoiceNumber: string
  date: string
  dueDate: string
  client: string
  clientEmail: string
  amount: number
  tax: number
  total: number
  status: 'paid' | 'pending' | 'overdue' | 'draft'
  paymentMethod: string | null
  paidDate: string | null
  notes: string
  items: { description: string; quantity: number; rate: number; amount: number }[]
}

const mockInvoices: Invoice[] = [
  {
    id: 'INV-001',
    invoiceNumber: 'INV-2024-001',
    date: '2024-01-15',
    dueDate: '2024-02-15',
    client: 'Acme Corporation',
    clientEmail: 'accounts@acme.com',
    amount: 1250.0,
    tax: 125.0,
    total: 1375.0,
    status: 'paid',
    paymentMethod: 'Bank Transfer',
    paidDate: '2024-01-20',
    notes: 'Website development services',
    items: [
      { description: 'Website Design', quantity: 1, rate: 800, amount: 800 },
      { description: 'Development Hours', quantity: 10, rate: 45, amount: 450 }
    ]
  },
  {
    id: 'INV-002',
    invoiceNumber: 'INV-2024-002',
    date: '2024-01-16',
    dueDate: '2024-02-16',
    client: 'Tech Solutions Inc.',
    clientEmail: 'finance@techsolutions.com',
    amount: 3450.0,
    tax: 345.0,
    total: 3795.0,
    status: 'pending',
    paymentMethod: null,
    paidDate: null,
    notes: 'Software licensing and support',
    items: [
      { description: 'Enterprise License', quantity: 5, rate: 600, amount: 3000 },
      { description: 'Support Package', quantity: 1, rate: 450, amount: 450 }
    ]
  },
  {
    id: 'INV-003',
    invoiceNumber: 'INV-2024-003',
    date: '2024-01-10',
    dueDate: '2024-02-10',
    client: 'Global Industries',
    clientEmail: 'ap@globalindustries.com',
    amount: 8900.0,
    tax: 890.0,
    total: 9790.0,
    status: 'overdue',
    paymentMethod: null,
    paidDate: null,
    notes: 'Consulting services for Q1',
    items: [
      { description: 'Strategic Consulting', quantity: 40, rate: 200, amount: 8000 },
      { description: 'Report Generation', quantity: 1, rate: 900, amount: 900 }
    ]
  },
  {
    id: 'INV-004',
    invoiceNumber: 'INV-2024-004',
    date: '2024-01-20',
    dueDate: '2024-02-20',
    client: 'StartupXYZ',
    clientEmail: 'hello@startupxyz.com',
    amount: 2200.0,
    tax: 220.0,
    total: 2420.0,
    status: 'draft',
    paymentMethod: null,
    paidDate: null,
    notes: 'Mobile app development',
    items: [
      { description: 'App Design', quantity: 1, rate: 1200, amount: 1200 },
      { description: 'Development', quantity: 20, rate: 50, amount: 1000 }
    ]
  }
]

function buildInvoicesExportSheet(
  invoices: Invoice[],
  getStatusLabel: (status: Invoice['status']) => string
): (string | number)[][] {
  const header: string[] = [
    'Invoice #',
    'Date',
    'Due Date',
    'Client',
    'Client Email',
    'Amount',
    'Tax',
    'Total',
    'Status',
    'Payment Method',
    'Paid Date',
    'Notes'
  ]
  const rows = invoices.map((invoice) => [
    invoice.invoiceNumber,
    new Date(invoice.date).toLocaleDateString(),
    new Date(invoice.dueDate).toLocaleDateString(),
    invoice.client,
    invoice.clientEmail,
    invoice.amount,
    invoice.tax,
    invoice.total,
    getStatusLabel(invoice.status),
    invoice.paymentMethod || 'N/A',
    invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : 'N/A',
    invoice.notes,
  ])
  return [header, ...rows]
}

function InvoicesIndexComponent() {
  const navigate = useNavigate()
  const theme = useTheme()

  const smUp = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true })
  const compactList = useCompactListLayout()

  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebouncedValue(searchTerm, LIST_SEARCH_DEBOUNCE_MS)
  const [filterStatus, setFilterStatus] = useState<'all' | Invoice['status']>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const exportBtnRef = useRef<HTMLButtonElement | null>(null)

  const filteredInvoices = useMemo(() => {
    let filtered = mockInvoices

    if (filterStatus !== 'all') {
      filtered = filtered.filter((invoice) => invoice.status === filterStatus)
    }

    if (debouncedSearchTerm.trim()) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          invoice.client.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          invoice.clientEmail.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    }

    return filtered
  }, [debouncedSearchTerm, filterStatus])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleStatusFilter = (status: 'all' | Invoice['status']) => {
    setFilterStatus(status)
  }

  const handleExportClick = () => {
    setShowExportDialog(true)
  }

  const getStatusLabel = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'Paid'
      case 'pending':
        return 'Pending'
      case 'overdue':
        return 'Overdue'
      case 'draft':
        return 'Draft'
      default:
        return status
    }
  }

  const handleExportConfirm = () => {
    setIsExporting(true)
    try {
      const sheet = buildInvoicesExportSheet(filteredInvoices, getStatusLabel)
      const currentDate = new Date().toISOString().split('T')[0]
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

  const handleExportCancel = () => {
    setShowExportDialog(false)
  }

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
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

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const totalInvoices = mockInvoices.length
  const totalAmount = mockInvoices.reduce((sum, invoice) => sum + invoice.total, 0)
  const paidInvoices = mockInvoices.filter((invoice) => invoice.status === 'paid').length
  const overdueInvoices = mockInvoices.filter((invoice) => invoice.status === 'overdue').length

  return (
    <ResourceListPage
      title="Invoice Management"
      actions={
        <>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportClick}
            disabled={filteredInvoices.length === 0}
            sx={{
              borderColor: 'success.main',
              color: 'success.main',
              '&:hover': {
                borderColor: 'success.main',
                backgroundColor: 'success.main',
                color: 'white'
              },
              '&:disabled': {
                borderColor: 'action.disabled',
                color: 'action.disabled'
              }
            }}
            ref={exportBtnRef}
          >
            Export Excel
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate({ to: '/invoices/create' })}>
            New Invoice
          </Button>
        </>
      }
    >
      <style>
        {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
      </style>

      <ListStatsGrid compact={compactList}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Receipt color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 300 }}>
                  {totalInvoices.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                  Total Invoices
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle color="success" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 300 }}>
                  {paidInvoices.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                  Paid
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Schedule color="info" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 300 }}>
                  {mockInvoices.filter((i) => i.status === 'pending').length.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                  Pending
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Warning color="warning" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 300 }}>
                  {overdueInvoices.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                  Overdue
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </ListStatsGrid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
            gap: 2,
            alignItems: 'center'
          }}
        >
          <TextField
            fullWidth
            placeholder="Search by invoice number, client, or email..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
          <FormControl fullWidth>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={filterStatus}
              label="Status Filter"
              onChange={(e) => handleStatusFilter(e.target.value as 'all' | Invoice['status'])}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {isLoading ? (
        <TableSkeleton />
      ) : smUp ? (
        <Paper sx={{ width: '100%' }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table stickyHeader size={compactList ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 300 }}>Invoice #</TableCell>

                  <TableCell
                    sx={{ display: compactList ? 'none' : 'table-cell', whiteSpace: 'nowrap', fontWeight: 300 }}
                  >
                    Date
                  </TableCell>
                  <TableCell
                    sx={{ display: compactList ? 'none' : 'table-cell', whiteSpace: 'nowrap', fontWeight: 300 }}
                  >
                    Due Date
                  </TableCell>

                  <TableCell sx={{ fontWeight: 300 }}>Client</TableCell>

                  <TableCell
                    align="right"
                    sx={{ display: compactList ? 'none' : 'table-cell', whiteSpace: 'nowrap', fontWeight: 300 }}
                  >
                    Amount
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ display: compactList ? 'none' : 'table-cell', whiteSpace: 'nowrap', fontWeight: 300 }}
                  >
                    Tax
                  </TableCell>

                  <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontWeight: 300 }}>
                    Total
                  </TableCell>
                  <TableCell sx={{ fontWeight: 300 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 300 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate({ to: `/invoices/${invoice.id}` })}
                      >
                        {invoice.invoiceNumber}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ display: compactList ? 'none' : 'table-cell' }}>
                      {new Date(invoice.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ display: compactList ? 'none' : 'table-cell' }}>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {invoice.client}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: compactList ? 'none' : 'inline' }}
                        >
                          {invoice.clientEmail}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{ display: compactList ? 'none' : 'table-cell', whiteSpace: 'nowrap' }}
                    >
                      ${invoice.amount.toFixed(2)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ display: compactList ? 'none' : 'table-cell', whiteSpace: 'nowrap' }}
                    >
                      ${invoice.tax.toFixed(2)}
                    </TableCell>

                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" fontWeight="medium">
                        ${invoice.total.toFixed(2)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip label={getStatusLabel(invoice.status)} color={getStatusColor(invoice.status)} size="small" />
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate({ to: `/invoices/${invoice.id}` })}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>

                        <Box sx={{ display: compactList ? 'none' : 'inline-flex' }}>
                          <Tooltip title="Edit Invoice">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() =>
                              navigate({
                                to: '/invoices/edit/$invoiceId',
                                params: { invoiceId: invoice.id },
                              })
                            }
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download PDF">
                            <IconButton size="small" color="info">
                              <Download />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Send Email">
                            <IconButton size="small" color="secondary">
                              <Email />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Invoice">
                            <IconButton size="small" color="error">
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gap: 2 }}>
          {filteredInvoices.map((inv) => (
            <Card key={inv.id} variant="outlined">
              <CardContent sx={{ display: 'grid', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">{inv.invoiceNumber}</Typography>
                  <Chip label={getStatusLabel(inv.status)} color={getStatusColor(inv.status)} size="small" />
                </Box>
                <Typography variant="body2">{inv.client}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Due {new Date(inv.dueDate).toLocaleDateString()}
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  ${inv.total.toFixed(2)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button
                    size="small"
                    onClick={() => navigate({ to: `/invoices/${inv.id}` })}
                    startIcon={<Visibility />}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    onClick={() =>
                      navigate({
                        to: '/invoices/edit/$invoiceId',
                        params: { invoiceId: inv.id },
                      })
                    }
                    startIcon={<Edit />}
                  >
                    Edit
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {!isLoading && (
        <ListSummaryFooter
          primary={
            <Typography variant="body2" color="text.secondary">
              Showing {filteredInvoices.length} of {mockInvoices.length} invoices
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
                .filter((i) => i.status === 'paid')
                .reduce((sum, i) => sum + i.total, 0)
                .toLocaleString()}
            </strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Outstanding:{' '}
            <strong>
              $
              {filteredInvoices
                .filter((i) => i.status !== 'paid')
                .reduce((sum, i) => sum + i.total, 0)
                .toLocaleString()}
            </strong>
          </Typography>
        </ListSummaryFooter>
      )}

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
        TransitionProps={{
          onExited: () => {
            exportBtnRef.current?.focus()
          }
        }}
      >
        <DialogTitle id="export-dialog-title">Export to Excel</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph id="export-dialog-description">
            This will export {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} to an Excel file.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The export will include all currently filtered data with the following columns:
            Invoice #, Date, Due Date, Client, Client Email, Amount, Tax, Total, Status, Payment Method, Paid Date, and Notes.
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
                    animation: 'spin 1s linear infinite'
                  }}
                />
              ) : (
                <Download />
              )
            }
            sx={{
              borderColor: 'success.main',
              color: 'success.main',
              '&:hover': {
                borderColor: 'success.main',
                backgroundColor: 'success.main',
                color: 'white'
              },
              '&:disabled': {
                borderColor: 'action.disabled',
                color: 'action.disabled'
              }
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

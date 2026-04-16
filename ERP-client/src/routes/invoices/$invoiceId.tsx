import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../../components/DashboardLayout'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import { FadeInContent } from '../../components/FadeInContent'
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from '@mui/material'
import {
  Edit,
  Delete,
  ArrowBack,
  Warning,
  CheckCircle,
  Schedule,
  Download,
  Email,
  Receipt,
  Business,
  Person,
  Payment
} from '@mui/icons-material'
import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/invoices/$invoiceId')({
  component: InvoiceViewComponent,
})

function InvoiceViewComponent() {
  const navigate = useNavigate()
  const { invoiceId } = Route.useParams()
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState<any>(null)

  const mockInvoice = {
    id: invoiceId,
    invoiceNumber: 'INV-2024-001',
    date: '2024-01-15',
    dueDate: '2024-02-15',
    client: 'Acme Corporation',
    clientEmail: 'accounts@acme.com',
    clientAddress: '123 Business St, Suite 100, New York, NY 10001',
    amount: 1250.00,
    tax: 125.00,
    total: 1375.00,
    status: 'paid',
    paymentMethod: 'Bank Transfer',
    paidDate: '2024-01-20',
    notes: 'Website development services for Q1 2024. Includes responsive design and CMS integration.',
    terms: 'Net 30',
    currency: 'USD',
    taxRate: 10,
    items: [
      { description: 'Website Design & UX', quantity: 1, rate: 800, amount: 800 },
      { description: 'Development Hours', quantity: 10, rate: 45, amount: 450 }
    ],
    companyInfo: {
      name: 'Nordshark Solutions',
      address: '456 Tech Avenue, San Francisco, CA 94102',
      email: 'invoices@nordshark.com',
      phone: '+1 (555) 123-4567',
      website: 'www.nordshark.com'
    }
  }

  useEffect(() => {
    setInvoice(mockInvoice)
    setLoading(false)
  }, [invoiceId])

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'paid': return { color: 'success', icon: <CheckCircle fontSize="small" /> }
      case 'pending': return { color: 'warning', icon: <Schedule fontSize="small" /> }
      case 'overdue': return { color: 'error', icon: <Warning fontSize="small" /> }
      case 'draft': return { color: 'default', icon: <Receipt fontSize="small" /> }
      default: return { color: 'default', icon: <Receipt fontSize="small" /> }
    }
  }

  const handleEdit = () => {
    navigate({ to: `/invoices/${invoiceId}/edit` })
  }

  const handleDelete = () => {
    console.log('Delete invoice:', invoiceId)
    navigate({ to: '/invoices/' })
  }

  const handleDownload = () => {
    console.log('Downloading invoice PDF...')
  }

  const handleSendEmail = () => {
    console.log('Sending invoice email...')
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <Typography>Loading invoice details...</Typography>
          </Box>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!invoice) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Alert severity="error">Invoice not found</Alert>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const statusDisplay = getStatusDisplay(invoice.status)

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <FadeInContent delay={200} duration={800}>
          <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => navigate({ to: '/invoices/' })}
                  sx={{ mr: 2 }}
                >
                  Back to Invoices
                </Button>
                <Typography variant="h4" component="h1">
                  Invoice {invoice.invoiceNumber}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={handleEdit}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleDownload}
                >
                  Download
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Email />}
                  onClick={handleSendEmail}
                >
                  Send Email
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </Box>
            </Box>

            <Alert 
              severity={statusDisplay.color as any} 
              icon={statusDisplay.icon}
              sx={{ mb: 3 }}
            >
              <Typography variant="body1" fontWeight="medium">
                Status: {statusDisplay.color === 'success' ? 'Paid' : 
                         statusDisplay.color === 'warning' ? 'Pending' : 
                         statusDisplay.color === 'error' ? 'Overdue' : 'Draft'}
              </Typography>
              <Typography variant="body2">
                {invoice.status === 'paid' && `Paid on ${new Date(invoice.paidDate).toLocaleDateString()} via ${invoice.paymentMethod}`}
                {invoice.status === 'pending' && `Due on ${new Date(invoice.dueDate).toLocaleDateString()}`}
                {invoice.status === 'overdue' && `Overdue since ${new Date(invoice.dueDate).toLocaleDateString()}`}
                {invoice.status === 'draft' && 'This is a draft invoice'}
              </Typography>
            </Alert>

            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, 
              gap: 3 
            }}>
              <Box>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                    gap: 3 
                  }}>
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business /> Company Information
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" gutterBottom>
                        {invoice.companyInfo.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {invoice.companyInfo.address}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Email: {invoice.companyInfo.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Phone: {invoice.companyInfo.phone}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Website: {invoice.companyInfo.website}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person /> Client Information
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" gutterBottom>
                        {invoice.client}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {invoice.clientAddress}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Email: {invoice.clientEmail}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Invoice Items
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Description</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Rate</TableCell>
                          <TableCell align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {invoice.items.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {item.description}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">${item.rate.toFixed(2)}</TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="medium">
                                ${item.amount.toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>

                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Additional Information
                  </Typography>
                  {invoice.notes && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>Notes</Typography>
                      <Typography variant="body1">{invoice.notes}</Typography>
                    </Box>
                  )}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                    gap: 2 
                  }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Terms</Typography>
                      <Typography variant="body1">{invoice.terms}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Currency</Typography>
                      <Typography variant="body1">{invoice.currency}</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>

              <Box>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Invoice Summary
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Invoice Number</Typography>
                      <Typography variant="body2" fontWeight="medium">{invoice.invoiceNumber}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Date</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {new Date(invoice.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Due Date</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Chip 
                        label={statusDisplay.color === 'success' ? 'Paid' : 
                               statusDisplay.color === 'warning' ? 'Pending' : 
                               statusDisplay.color === 'error' ? 'Overdue' : 'Draft'} 
                        color={statusDisplay.color as any} 
                        size="small" 
                        icon={statusDisplay.icon}
                      />
                    </Box>
                  </Box>
                </Paper>

                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Financial Summary
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                      <Typography variant="body2" fontWeight="medium">${invoice.amount.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Tax ({invoice.taxRate}%)</Typography>
                      <Typography variant="body2" fontWeight="medium">${invoice.tax.toFixed(2)}</Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1" fontWeight="bold">Total</Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        ${invoice.total.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {invoice.status === 'paid' && (
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Payment /> Payment Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                        <Typography variant="body2" fontWeight="medium">{invoice.paymentMethod}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Paid Date</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {new Date(invoice.paidDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                )}

                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Edit />}
                      onClick={handleEdit}
                    >
                      Edit Invoice
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Download />}
                      onClick={handleDownload}
                    >
                      Download PDF
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Email />}
                      onClick={handleSendEmail}
                    >
                      Send to Client
                    </Button>
                    {invoice.status === 'pending' && (
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Payment />}
                        color="success"
                      >
                        Mark as Paid
                      </Button>
                    )}
                  </Box>
                </Paper>
              </Box>
            </Box>
          </Box>
        </FadeInContent>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

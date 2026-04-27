import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { FadeInContent } from '@/components/FadeInContent'
import { DetailPageHeader } from '@/components/DetailPageHeader'
import { SectionHeader } from '@/components/PageHeader'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import {
  Save,
  Cancel,
  Add,
  Delete,
  AttachMoney,
} from '@mui/icons-material'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useCreateInvoice, type CreateInvoiceDto } from '@/api/invoices'

export const Route = createFileRoute('/invoices/create')({
  component: CreateInvoiceComponent,
})

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

function CreateInvoiceComponent() {
  const navigate = useNavigate()
  const create = useCreateInvoice()
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    client: '',
    clientEmail: '',
    clientAddress: '',
    notes: '',
    terms: 'Net 30',
    taxRate: 10,
    currency: 'USD',
    status: 'draft' as const,
  })
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
  ])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleItemChange = (id: string, field: string, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate
        }
        return updatedItem
      }
      return item
    }))
  }

  const addItem = () => {
    const maxId = items.length ? Math.max(...items.map((item) => parseInt(item.id, 10) || 0), 0) : 0
    const newId = String(maxId + 1)
    setItems((prev) => [...prev, { id: newId, description: '', quantity: 1, rate: 0, amount: 0 }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id))
    }
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * (formData.taxRate / 100)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleSubmit = () => {
    const number = formData.invoiceNumber.trim() || `INV-${Date.now()}`
    const body: CreateInvoiceDto = {
      invoiceNumber: number,
      issueDate: new Date(formData.date + 'T12:00:00.000Z').toISOString(),
      dueDate: new Date(formData.dueDate + 'T12:00:00.000Z').toISOString(),
      clientName: formData.client.trim() || 'Client',
      clientEmail: formData.clientEmail || undefined,
      clientAddress: formData.clientAddress || undefined,
      status: formData.status,
      taxRatePercent: formData.taxRate,
      terms: formData.terms,
      currency: formData.currency,
      notes: formData.notes || undefined,
      lines: items
        .filter((it) => it.description.trim() !== '')
        .map((it, i) => ({
          lineNumber: i + 1,
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.rate,
        })),
    }
    if (body.lines.length === 0) {
      return
    }
    create.mutate(body, {
      onSuccess: (res) => navigate({ to: '/invoices/$invoiceId', params: { invoiceId: String(res.id) } }),
    })
  }

  const handleCancel = () => {
    navigate({ to: '/invoices/' })
  }

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  const terms = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt']

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <FadeInContent delay={200} duration={800}>
          <Box>
            <DetailPageHeader showBack={false} title="Create New Invoice" />

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Invoice Details
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                gap: 3 
              }}>
                <Box>
                  <TextField
                    fullWidth
                    label="Invoice Number"
                    value={formData.invoiceNumber}
                    onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                    required
                    helperText="Auto-generated if left empty"
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    type="date"
                    label="Invoice Date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    type="date"
                    label="Due Date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Box>
                <Box>
                  <FormControl fullWidth>
                    <InputLabel>Payment Terms</InputLabel>
                    <Select
                      value={formData.terms}
                      label="Payment Terms"
                      onChange={(e) => handleInputChange('terms', e.target.value)}
                    >
                      {terms.map((term) => (
                        <MenuItem key={term} value={term}>{term}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={formData.currency}
                      label="Currency"
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                    >
                      {currencies.map((currency) => (
                        <MenuItem key={currency} value={currency}>{currency}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Tax Rate (%)"
                    value={formData.taxRate}
                    onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                    type="number"
                    InputProps={{
                      endAdornment: '%',
                    }}
                    helperText="Tax rate applied to subtotal"
                  />
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Client Information
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                gap: 3 
              }}>
                <Box>
                  <TextField
                    fullWidth
                    label="Client Name"
                    value={formData.client}
                    onChange={(e) => handleInputChange('client', e.target.value)}
                    required
                    helperText="Company or individual name"
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Client Email"
                    value={formData.clientEmail}
                    onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                    type="email"
                    required
                    helperText="For sending invoice"
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Client Address"
                    value={formData.clientAddress}
                    onChange={(e) => handleInputChange('clientAddress', e.target.value)}
                    helperText="Billing address"
                  />
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
              <SectionHeader
                title="Invoice Items"
                actions={
                  <Button variant="outlined" startIcon={<Add />} onClick={addItem}>
                    Add Item
                  </Button>
                }
              />

              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Rate</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <TextField
                            fullWidth
                            label="Description"
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            required
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            fullWidth
                            label="Qty"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            type="number"
                            required
                            size="small"
                            sx={{ minWidth: 80 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            fullWidth
                            label="Rate"
                            value={item.rate}
                            onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            type="number"
                            required
                            size="small"
                            InputProps={{
                              startAdornment: <AttachMoney />,
                            }}
                            sx={{ minWidth: 100 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            ${item.amount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeItem(item.id)}
                            disabled={items.length === 1}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Additional Information
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                gap: 3 
              }}>
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    helperText="Additional notes for the client"
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Terms & Conditions"
                    value={formData.terms}
                    onChange={(e) => handleInputChange('terms', e.target.value)}
                    helperText="Payment terms and conditions"
                  />
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
              <Typography variant="h6" gutterBottom component="h2">
                Invoice Summary
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip label={formData.client || 'Client Name'} color="primary" />
                    <Chip label={formData.invoiceNumber || 'Invoice #'} color="secondary" />
                    <Chip label={`${formData.currency} Currency`} color="info" />
                    <Chip label={`${formData.taxRate}% Tax`} color="warning" />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Subtotal: <strong>${calculateSubtotal().toFixed(2)}</strong>
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Tax ({formData.taxRate}%): <strong>${calculateTax().toFixed(2)}</strong>
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total: <strong>${calculateTotal().toFixed(2)}</strong>
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: 2 
                  }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Invoice Date: {formData.date ? new Date(formData.date).toLocaleDateString() : 'Not set'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Due Date: {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : 'Not set'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Paper>

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column-reverse', sm: 'row' },
                justifyContent: 'space-between',
                gap: 2,
                '& > .MuiButton-root': { minHeight: { xs: 44, sm: 36 } },
              }}
            >
              <Button variant="outlined" onClick={handleCancel} startIcon={<Cancel />} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSubmit} startIcon={<Save />} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                Create Invoice
              </Button>
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              The invoice will be created as a draft. You can edit it later and send it to the client when ready.
            </Alert>
          </Box>
        </FadeInContent>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

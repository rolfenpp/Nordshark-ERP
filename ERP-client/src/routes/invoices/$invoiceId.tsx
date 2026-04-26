import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../../components/DashboardLayout'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import { FadeInContent } from '../../components/FadeInContent'
import { DetailPageHeader } from '../../components/DetailPageHeader'
import { Box, Typography, Paper, Button, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert } from '@mui/material'
import { Edit, Delete, CheckCircle, Schedule, Warning, Receipt } from '@mui/icons-material'
import { useNavigate } from '@tanstack/react-router'
import { useInvoice, useDeleteInvoice } from '../../api/invoices'

export const Route = createFileRoute('/invoices/$invoiceId')({
  component: InvoiceViewComponent,
})

function InvoiceViewComponent() {
  const navigate = useNavigate()
  const { invoiceId } = Route.useParams()
  const id = Number(invoiceId)
  const { data: inv, isLoading, isError, error } = useInvoice(id)
  const del = useDeleteInvoice()

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'paid':
        return { color: 'success' as const, icon: <CheckCircle fontSize="small" /> }
      case 'pending':
        return { color: 'warning' as const, icon: <Schedule fontSize="small" /> }
      case 'overdue':
        return { color: 'error' as const, icon: <Warning fontSize="small" /> }
      case 'draft':
        return { color: 'info' as const, icon: <Receipt fontSize="small" /> }
      default:
        return { color: 'info' as const, icon: <Receipt fontSize="small" /> }
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Box sx={{ p: 3 }}>Loading invoice…</Box>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (isError || !inv) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{(error as Error)?.message || 'Invoice not found.'}</Alert>
          </Box>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const st = getStatusDisplay(inv.status)

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <FadeInContent delay={200} duration={800}>
          <Box>
            <DetailPageHeader
              backLabel="Back to Invoices"
              onBack={() => navigate({ to: '/invoices/' })}
              title={inv.invoiceNumber}
            >
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => navigate({ to: '/invoices/edit/$invoiceId', params: { invoiceId: String(inv.id) } })}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => {
                  if (confirm('Delete this invoice?')) {
                    del.mutate(inv.id, { onSuccess: () => navigate({ to: '/invoices/' }) })
                  }
                }}
              >
                Delete
              </Button>
            </DetailPageHeader>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 3 }}>
              <Box>
                <Alert severity={st.color} icon={st.icon} sx={{ mb: 2 }}>
                  <Typography variant="body1" fontWeight="medium">Status: {inv.status}</Typography>
                </Alert>
                <Paper sx={{ p: 3, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>Client</Typography>
                  <Typography variant="body1">{inv.clientName}</Typography>
                  {inv.clientEmail && (
                    <Typography variant="body2" color="text.secondary">
                      {inv.clientEmail}
                    </Typography>
                  )}
                  {inv.clientAddress && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {inv.clientAddress}
                    </Typography>
                  )}
                </Paper>
                {inv.notes && (
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Notes</Typography>
                    <Typography variant="body2">{inv.notes}</Typography>
                  </Paper>
                )}
              </Box>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">Issue</Typography>
                <Typography variant="body1" gutterBottom>{new Date(inv.issueDate).toLocaleDateString()}</Typography>
                <Typography variant="subtitle2" color="text.secondary">Due</Typography>
                <Typography variant="body1" gutterBottom>{new Date(inv.dueDate).toLocaleDateString()}</Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2">Subtotal: ${inv.subtotal.toFixed(2)}</Typography>
                <Typography variant="body2">Tax ({inv.taxRatePercent}%): ${inv.taxAmount.toFixed(2)}</Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>Total: ${inv.total.toFixed(2)} {inv.currency}</Typography>
                {inv.paymentMethod && <Typography variant="body2" sx={{ mt: 1 }}>Payment: {inv.paymentMethod}</Typography>}
                {inv.paidDate && <Typography variant="body2">Paid: {new Date(inv.paidDate).toLocaleDateString()}</Typography>}
                {inv.terms && <Typography variant="body2" sx={{ mt: 1 }}>Terms: {inv.terms}</Typography>}
              </Paper>
            </Box>

            <Paper sx={{ p: 0 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Rate</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inv.lines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>{line.lineNumber}</TableCell>
                        <TableCell>{line.description}</TableCell>
                        <TableCell align="right">{line.quantity}</TableCell>
                        <TableCell align="right">${line.unitPrice.toFixed(2)}</TableCell>
                        <TableCell align="right">${line.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </FadeInContent>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

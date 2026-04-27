import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { FadeInContent } from '@/components/FadeInContent'
import { DetailPageHeader } from '@/components/DetailPageHeader'
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  Alert
} from '@mui/material'
import {
  Edit,
  Delete,
  Warning,
  CheckCircle,
  Error,
  LocationOn,
  AttachMoney,
  Inventory as InventoryIcon
} from '@mui/icons-material'
import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useInventoryItem, useDeleteInventoryItem, type InventoryItemDto } from '@/api/inventory'

export const Route = createFileRoute('/inventory/$itemId')({
  component: InventoryItemComponent,
})

function toViewModel(raw: InventoryItemDto) {
  const min = raw.reorderLevel ?? 0
  const q = raw.quantityOnHand
  const status = q === 0 ? 'Out of Stock' : min > 0 && q <= min ? 'Low Stock' : 'In Stock'
  return {
    id: String(raw.id),
    name: raw.name,
    description: raw.description,
    category: raw.category,
    sku: raw.sku,
    quantity: q,
    minQuantity: min,
    price: raw.unitPrice,
    status,
    location: raw.location,
    supplier: raw.supplier,
    tags: raw.tags,
    lastUpdated: raw.updatedUtc ?? raw.createdUtc,
    createdDate: raw.createdUtc,
    isActive: true,
    trackExpiry: false,
    expiryDate: null as string | null,
    notes: '' as string,
  }
}

function InventoryItemComponent() {
  const navigate = useNavigate()
  const { itemId } = Route.useParams()
  const id = Number(itemId)
  const { data: raw, isLoading, isError, error } = useInventoryItem(id)
  const del = useDeleteInventoryItem()
  const item = useMemo(() => (raw ? toViewModel(raw) : null), [raw])

  const getStatusDisplay = (status: string, quantity: number, minQuantity: number) => {
    if (status === 'Out of Stock' || quantity === 0) {
      return { color: 'error', icon: <Error fontSize="small" /> }
    } else if (status === 'Low Stock' || quantity <= minQuantity) {
      return { color: 'warning', icon: <Warning fontSize="small" /> }
    } else {
      return { color: 'success', icon: <CheckCircle fontSize="small" /> }
    }
  }

  const handleEdit = () => {
    navigate({ to: '/inventory/edit/$itemId', params: { itemId: String(itemId) } })
  }

  const handleDelete = () => {
    if (confirm('Delete this item?')) {
      del.mutate(id, { onSuccess: () => navigate({ to: '/inventory/' }) })
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <Typography>Loading item details...</Typography>
          </Box>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (isError || !item) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Alert severity="error">{(error as Error)?.message || 'Item not found'}</Alert>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const statusDisplay = getStatusDisplay(item.status, item.quantity, item.minQuantity)

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <FadeInContent delay={200} duration={800}>
          <Box>
            <DetailPageHeader
              backLabel="Back to Inventory"
              onBack={() => navigate({ to: '/inventory/' })}
              title={item.name}
            >
              <Button variant="outlined" startIcon={<Edit />} onClick={handleEdit}>
                Edit
              </Button>
              <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleDelete}>
                Delete
              </Button>
            </DetailPageHeader>

            <Alert 
              severity={statusDisplay.color as any} 
              icon={statusDisplay.icon}
              sx={{ mb: 3 }}
            >
              <Typography variant="body1" fontWeight="medium">
                Status: {item.status}
              </Typography>
              <Typography variant="body2">
                Current quantity: {item.quantity} units
                {item.quantity <= item.minQuantity && ` (Reorder point: ${item.minQuantity})`}
              </Typography>
            </Alert>

            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, 
              gap: 3 
            }}>
              <Box>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Basic Information
                  </Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                    gap: 2 
                  }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">SKU</Typography>
                      <Typography variant="body1" fontWeight="medium">{item.sku}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Category</Typography>
                      <Typography variant="body1" fontWeight="medium">{item.category}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Location</Typography>
                      <Typography variant="body1" fontWeight="medium">{item.location}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Supplier</Typography>
                      <Typography variant="body1" fontWeight="medium">{item.supplier}</Typography>
                    </Box>
                  </Box>
                  {item.description && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Description</Typography>
                        <Typography variant="body1">{item.description}</Typography>
                      </Box>
                    </>
                  )}
                </Paper>

                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Quantity & Pricing
                  </Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
                    gap: 2 
                  }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Current Quantity</Typography>
                      <Typography variant="h5" fontWeight="bold" color={item.quantity <= item.minQuantity ? 'warning.main' : 'inherit'}>
                        {item.quantity}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Unit Price</Typography>
                      <Typography variant="h5" fontWeight="bold" color="success.main">
                        ${item.price.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total Value</Typography>
                      <Typography variant="h5" fontWeight="bold">
                        ${(item.price * item.quantity).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                    gap: 2 
                  }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Minimum Quantity</Typography>
                      <Typography variant="body1">{item.minQuantity}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Reorder Point</Typography>
                      <Typography variant="body1">{item.minQuantity}</Typography>
                    </Box>
                  </Box>
                </Paper>

                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Additional Information
                  </Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                    gap: 2 
                  }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Created Date</Typography>
                      <Typography variant="body1">{new Date(item.createdDate).toLocaleDateString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                      <Typography variant="body1">{new Date(item.lastUpdated).toLocaleDateString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Active Status</Typography>
                      <Chip 
                        label={item.isActive ? 'Active' : 'Inactive'} 
                        color={item.isActive ? 'success' : 'default'} 
                        size="small" 
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Expiry Tracking</Typography>
                      <Chip 
                        label={item.trackExpiry ? 'Enabled' : 'Disabled'} 
                        color={item.trackExpiry ? 'info' : 'default'} 
                        size="small" 
                      />
                    </Box>
                  </Box>
                  {item.tags && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Tags</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {item.tags.split(',').map((tag: string, index: number) => (
                            <Chip key={index} label={tag.trim()} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    </>
                  )}
                  {item.notes && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Notes</Typography>
                        <Typography variant="body1">{item.notes}</Typography>
                      </Box>
                    </>
                  )}
                </Paper>
              </Box>

              <Box>
                <Paper sx={{ p: 3, mb: 3 }}>
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
                      Edit Item
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<InventoryIcon />}
                    >
                      Adjust Quantity
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<LocationOn />}
                    >
                      Change Location
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<AttachMoney />}
                    >
                      Update Price
                    </Button>
                  </Box>
                </Paper>

                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Item Summary
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Item ID</Typography>
                      <Typography variant="body2" fontWeight="medium">{item.id}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Category</Typography>
                      <Typography variant="body2" fontWeight="medium">{item.category}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Chip 
                        label={item.status} 
                        color={statusDisplay.color as any} 
                        size="small" 
                        icon={statusDisplay.icon}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Location</Typography>
                      <Typography variant="body2" fontWeight="medium">{item.location}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Supplier</Typography>
                      <Typography variant="body2" fontWeight="medium">{item.supplier}</Typography>
                    </Box>
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

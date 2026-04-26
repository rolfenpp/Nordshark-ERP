import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../../components/DashboardLayout'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import { FadeInContent } from '../../components/FadeInContent'
import { DetailPageHeader } from '../../components/DetailPageHeader'
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
  FormControlLabel,
  Switch,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider
} from '@mui/material'
import {
  Save,
  Cancel,
  AttachMoney,

} from '@mui/icons-material'
import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useInventoryItem, useUpdateInventoryItem, type UpdateInventoryItemDto } from '../../api/inventory'

export const Route = createFileRoute('/inventory/edit/$itemId')({
  component: EditInventoryComponent,
})

function EditInventoryComponent() {
  const navigate = useNavigate()
  const { itemId } = Route.useParams()
  const id = Number(itemId)
  const { data: item, isLoading } = useInventoryItem(id)
  const update = useUpdateInventoryItem()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    sku: '',
    quantity: '',
    minQuantity: '',
    price: '',
    location: '',
    supplier: '',
    tags: '',
    isActive: true,
    trackExpiry: false,
    expiryDate: '',
    notes: '',
  })

  useEffect(() => {
    if (!item) return
    setFormData({
      name: item.name,
      description: item.description ?? '',
      category: item.category ?? '',
      sku: item.sku,
      quantity: String(item.quantityOnHand),
      minQuantity: item.reorderLevel != null ? String(item.reorderLevel) : '',
      price: String(item.unitPrice),
      location: item.location ?? '',
      supplier: item.supplier ?? '',
      tags: item.tags ?? '',
      isActive: true,
      trackExpiry: false,
      expiryDate: '',
      notes: '',
    })
  }, [item])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = () => {
    const body: UpdateInventoryItemDto = {
      sku: formData.sku,
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category || undefined,
      location: formData.location || undefined,
      supplier: formData.supplier || undefined,
      tags: formData.tags || undefined,
      quantityOnHand: parseInt(formData.quantity, 10) || 0,
      unitPrice: parseFloat(formData.price) || 0,
      reorderLevel: formData.minQuantity ? parseInt(formData.minQuantity, 10) : undefined,
    }
    update.mutate(
      { id, item: body },
      { onSuccess: () => navigate({ to: '/inventory/$itemId', params: { itemId: String(id) } }) }
    )
  }

  const handleCancel = () => {
    navigate({ to: '/inventory/$itemId', params: { itemId: String(id) } })
  }

  const categories = [
    'Electronics',
    'Furniture',
    'Office Supplies',
    'Lighting',
    'Hardware',
    'Software',
    'Clothing',
    'Food & Beverages',
    'Other'
  ]

  if (isLoading || !item) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <Typography>Loading item data...</Typography>
          </Box>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <FadeInContent delay={200} duration={800}>
          <Box>
            <DetailPageHeader
              backLabel="Back to Item"
              onBack={() => navigate({ to: '/inventory/$itemId', params: { itemId: String(id) } })}
              title="Edit Inventory Item"
            />

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Item Information
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                gap: 3 
              }}>
                <Box>
                  <TextField
                    fullWidth
                    label="Item Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    helperText="Enter a descriptive name for the item"
                  />
                </Box>
                <Box>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      label="Category"
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      required
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="SKU"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    required
                    helperText="Stock Keeping Unit - unique identifier"
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    required
                    helperText="Where is this item stored?"
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    helperText="Describe the item and its specifications"
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Supplier"
                    value={formData.supplier}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                    helperText="Who supplies this item?"
                  />
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Quantity & Pricing
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
                gap: 3 
              }}>
                <Box>
                  <TextField
                    fullWidth
                    label="Current Quantity"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    type="number"
                    required
                    helperText="Current stock level"
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Minimum Quantity"
                    value={formData.minQuantity}
                    onChange={(e) => handleInputChange('minQuantity', e.target.value)}
                    type="number"
                    required
                    helperText="When to reorder?"
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Unit Price"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    type="number"
                    InputProps={{
                      startAdornment: <AttachMoney />,
                    }}
                    required
                    helperText="Price per unit"
                  />
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Additional Settings
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                gap: 3 
              }}>
                <Box>
                  <TextField
                    fullWidth
                    label="Tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    helperText="Separate tags with commas (e.g., electronics, office, premium)"
                  />
                </Box>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.trackExpiry}
                        onChange={(e) => handleInputChange('trackExpiry', e.target.checked)}
                      />
                    }
                    label="Track expiration date"
                  />
                  {formData.trackExpiry && (
                    <TextField
                      fullWidth
                      type="date"
                      label="Expiry Date"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mt: 2 }}
                    />
                  )}
                </Box>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      />
                    }
                    label="Item is active"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    Active items appear in inventory lists
                  </Typography>
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    helperText="Additional notes about this item"
                  />
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Item Summary
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip label={formData.name || 'Item Name'} color="primary" />
                    <Chip label={formData.category || 'Category'} color="secondary" />
                    <Chip label={formData.sku || 'SKU'} color="info" />
                    <Chip label={formData.location || 'Location'} color="warning" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {formData.description || 'No description provided'}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: 2 
                  }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {formData.quantity || 'Not set'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Price: {formData.price ? `$${parseFloat(formData.price).toFixed(2)}` : 'Not set'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Supplier: {formData.supplier || 'Not specified'}
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
                '& > .MuiButton-root': { width: { xs: '100%', sm: 'auto' }, minHeight: { xs: 44, sm: 36 } },
              }}
            >
              <Button variant="outlined" onClick={handleCancel} startIcon={<Cancel />}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSubmit} startIcon={<Save />}>
                Save Changes
              </Button>
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              Changes will be applied immediately. You can always revert changes from the item history.
            </Alert>
          </Box>
        </FadeInContent>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

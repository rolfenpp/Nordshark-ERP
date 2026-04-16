import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../../components/DashboardLayout'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import { FadeInContent } from '../../components/FadeInContent'
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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Save,
  Cancel,
  ArrowBack,
  AttachMoney,
  Add
} from '@mui/icons-material'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useCreateInventoryItem, type CreateInventoryItemDto } from '../../api/inventory'
import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSuccess, showError } from '../../lib/toast'

export const Route = createFileRoute('/inventory/create')({
  component: CreateInventoryComponent,
})

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
  category: z.string().max(100, 'Category must be 100 characters or less').optional(),
  sku: z.string().max(100, 'SKU must be 100 characters or less').optional(),
  quantityOnHand: z.number().min(0, 'Quantity must be 0 or greater'),
  reorderLevel: z.number().min(0, 'Reorder level must be 0 or greater').optional(),
  unitPrice: z.number().min(0, 'Unit price must be 0 or greater'),
  location: z.string().optional(),
  supplier: z.string().optional(),
  tags: z.string().optional(),
  isActive: z.boolean(),
  trackExpiry: z.boolean(),
  expiryDate: z.string().optional(),
}).refine((data) => {
  if (data.trackExpiry && !data.expiryDate) {
    return false
  }
  return true
}, {
  message: 'Expiry date is required when tracking expiry',
  path: ['expiryDate']
})

type FormData = z.infer<typeof schema>

function CreateInventoryComponent() {
  const navigate = useNavigate()
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  const [categories, setCategories] = useState([
    'Electronics',
    'Furniture',
    'Office Supplies',
    'Lighting',
    'Hardware',
    'Software',
    'Clothing',
    'Food & Beverages',
    'Other'
  ])

  const createMutation = useCreateInventoryItem()

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      sku: '',
      quantityOnHand: 0,
      reorderLevel: undefined,
      unitPrice: 0,
      location: '',
      supplier: '',
      tags: '',
      isActive: true,
      trackExpiry: false,
      expiryDate: ''
    }
  })

  const trackExpiry = watch('trackExpiry')

  const handleAddCategory = () => {
    if (newCategoryName.trim() && newCategoryName.length <= 100) {
      const trimmedCategory = newCategoryName.trim()
      
      if (!categories.includes(trimmedCategory)) {
        setCategories(prev => [...prev, trimmedCategory])
        setValue('category', trimmedCategory)
        showSuccess(`Category "${trimmedCategory}" added successfully!`)
      }
      
      setNewCategoryName('')
      setShowAddCategoryDialog(false)
      
      setTimeout(() => {
      }, 100)
    }
  }

  const handleCancelAddCategory = () => {
    setNewCategoryName('')
    setShowAddCategoryDialog(false)
  }

  const onSubmit = (data: FormData) => {
    const createData: CreateInventoryItemDto = {
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      category: data.category?.trim() || undefined,
      sku: data.sku?.trim() || undefined,
      quantityOnHand: data.quantityOnHand,
      unitPrice: data.unitPrice,
      reorderLevel: data.reorderLevel || undefined,
    }

    createMutation.mutate(createData, {
      onSuccess: (newItem) => {
        console.log('Successfully created inventory item:', newItem)
        navigate({ to: '/inventory/' })
      },
      onError: (error) => {
        console.error('Failed to create inventory item:', error)
        showError('Failed to create inventory item. Please try again.')
      }
    })
  }

  const handleCancel = () => {
    navigate({ to: '/inventory/' })
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <FadeInContent delay={200} duration={800}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate({ to: '/inventory/' })}
                sx={{ mr: 2 }}
              >
                Back to Inventory
              </Button>
              <Typography variant="h4" component="h1">
                Add New Inventory Item
              </Typography>
            </Box>

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
                  <Controller
                    name="name"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Item Name *"
                        required
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message || "Enter a descriptive name for the item (required, max 200 characters)"}
                      />
                    )}
                  />
                </Box>
                <Box>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FormControl fullWidth error={!!fieldState.error}>
                        <InputLabel>Category</InputLabel>
                        <Select
                          {...field}
                          label="Category"
                        >
                          {categories.map((category) => (
                            <MenuItem key={category} value={category}>{category}</MenuItem>
                          ))}
                          <Divider />
                          <MenuItem 
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setShowAddCategoryDialog(true)
                            }}
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              color: 'primary.main',
                              fontWeight: 500
                            }}
                          >
                            <Add fontSize="small" />
                            Add New Category
                          </MenuItem>
                        </Select>
                        {fieldState.error && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                            {fieldState.error.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Box>
                <Box>
                  <Controller
                    name="sku"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="SKU"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message || "Stock Keeping Unit - unique identifier (optional)"}
                      />
                    )}
                  />
                </Box>
                <Box>
                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Location"
                        helperText="Where is this item stored? (optional)"
                      />
                    )}
                  />
                </Box>
                <Box>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={3}
                        label="Description"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message || "Describe the item and its specifications (optional, max 1000 characters)"}
                      />
                    )}
                  />
                </Box>
                <Box>
                  <Controller
                    name="supplier"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Supplier"
                        helperText="Who supplies this item? (optional)"
                      />
                    )}
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
                  <Controller
                    name="quantityOnHand"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Quantity On Hand"
                        type="number"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message || "Current quantity in stock (0 is valid)"}
                        InputProps={{
                          inputProps: { min: 0 }
                        }}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    )}
                  />
                </Box>
                <Box>
                  <Controller
                    name="reorderLevel"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Reorder Level"
                        type="number"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message || "When to reorder? (optional, 0 is valid)"}
                        InputProps={{
                          inputProps: { min: 0 }
                        }}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    )}
                  />
                </Box>
                <Box>
                  <Controller
                    name="unitPrice"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Unit Price"
                        type="number"
                        error={!!fieldState.error}
                        InputProps={{
                          startAdornment: <AttachMoney />,
                          inputProps: { min: 0, step: 0.01 }
                        }}
                        helperText={fieldState.error?.message || "Price per unit (required, 0 is valid)"}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    )}
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
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Tags"
                        helperText="Separate tags with commas (e.g., electronics, office, premium) (optional)"
                      />
                    )}
                  />
                </Box>
                <Box>
                  <Controller
                    name="trackExpiry"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        }
                        label="Track expiration date"
                      />
                    )}
                  />
                  {trackExpiry && (
                    <Controller
                      name="expiryDate"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type="date"
                          label="Expiry Date"
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          InputLabelProps={{ shrink: true }}
                          sx={{ mt: 2 }}
                        />
                      )}
                    />
                  )}
                </Box>
                <Box>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        }
                        label="Item is active"
                      />
                    )}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    Active items appear in inventory lists
                  </Typography>
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
                    <Chip label={watch('name') || 'Item Name'} color="primary" />
                    <Chip label={watch('category') || 'Category'} color="secondary" />
                    <Chip label={watch('sku') || 'SKU'} color="info" />
                    <Chip label={watch('location') || 'Location'} color="warning" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {watch('description') || 'No description provided'}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: 2 
                  }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {watch('quantityOnHand')}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Price: ${(watch('unitPrice') || 0).toFixed(2)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Reorder Level: {watch('reorderLevel') || 'Not set'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<Cancel />}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit(onSubmit)}
                startIcon={<Save />}
                disabled={!watch('name')?.trim() || isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Item'}
              </Button>
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              Only the item name is required. Other fields are optional and can be updated later. The new item will be added to your inventory immediately.
            </Alert>

            <Dialog 
              open={showAddCategoryDialog} 
              onClose={handleCancelAddCategory}
              maxWidth="sm"
              fullWidth
              disableRestoreFocus
              disableAutoFocus
            >
              <DialogTitle>Add New Category</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Category Name"
                  fullWidth
                  variant="outlined"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  helperText="Enter a new category name (max 100 characters)"
                  inputProps={{ maxLength: 100 }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCategory()
                    }
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCancelAddCategory}>Cancel</Button>
                <Button 
                  onClick={handleAddCategory} 
                  variant="contained"
                  disabled={!newCategoryName.trim()}
                >
                  Add Category
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </FadeInContent>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

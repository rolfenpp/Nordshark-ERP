import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../../components/DashboardLayout'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import { TableSkeleton } from '../../components/Skeletons'
import { ResourceListPage } from '../../components/ResourceListPage'
import { ListStatsGrid } from '../../components/ListStatsGrid'
import { ListSummaryFooter } from '../../components/ListSummaryFooter'
import { PageHeader } from '../../components/PageHeader'
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
  Tooltip
} from '@mui/material'
import type { ChipProps } from '@mui/material/Chip'
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  Inventory as InventoryIcon,
  Warning,
  CheckCircle,
  AttachMoney
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useInventoryItems } from '../../api/inventory'
import { showError } from '../../lib/toast'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useCompactListLayout } from '../../hooks/useCompactListLayout'
import { LIST_SEARCH_DEBOUNCE_MS } from '../../lib/listBreakpoints'

export const Route = createFileRoute('/inventory/')({
  component: InventoryIndexComponent,
})

function InventoryIndexComponent() {
  const navigate = useNavigate()
  const theme = useTheme()

  const smUp = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true })
  const compactList = useCompactListLayout()

  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebouncedValue(searchTerm, LIST_SEARCH_DEBOUNCE_MS)

  const { data: inventoryItems = [], isLoading, error } = useInventoryItems()

  useEffect(() => {
    if (error) {
      showError(`Failed to load inventory: ${error.message || 'Unknown error occurred'}`)
    }
  }, [error])

  const filteredInventory = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return inventoryItems

    return inventoryItems.filter(item =>
      item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    )
  }, [inventoryItems, debouncedSearchTerm])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const getStatusDisplay = (quantity: number, reorderLevel?: number) => {
    if (quantity === 0) {
      return { color: 'error', icon: <Warning fontSize="small" />, label: 'Out of Stock' }
    } else if (reorderLevel && quantity <= reorderLevel) {
      return { color: 'warning', icon: <Warning fontSize="small" />, label: 'Low Stock' }
    } else {
      return { color: 'success', icon: <CheckCircle fontSize="small" />, label: 'In Stock' }
    }
  }

  const totalValue = inventoryItems.reduce((sum, item) => sum + (item.unitPrice * item.quantityOnHand), 0)
  const totalItems = inventoryItems.reduce((sum, item) => sum + item.quantityOnHand, 0)
  const lowStockItems = inventoryItems.filter(item => item.reorderLevel && item.quantityOnHand <= item.reorderLevel).length

  const headerActions = (
    <Button
      variant="contained"
      startIcon={<Add />}
      onClick={() => navigate({ to: '/inventory/create' })}
    >
      Add New Item
    </Button>
  )

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Box>
            <PageHeader
              title="Inventory Management"
              actions={
                <Button variant="contained" startIcon={<Add />} disabled>
                  Add New Item
                </Button>
              }
            />
            <TableSkeleton rows={8} columns={9} />
          </Box>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Box>
            <PageHeader title="Inventory Management" actions={headerActions} />
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="error" gutterBottom>
                Failed to load inventory
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {error.message || 'An error occurred while fetching inventory items. Please try again later.'}
              </Typography>
            </Paper>
          </Box>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ResourceListPage title="Inventory Management" actions={headerActions}>
      <ListStatsGrid compact={compactList}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InventoryIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">{inventoryItems.length}</Typography>
                <Typography variant="body2" color="text.secondary">Total Items</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InventoryIcon color="success" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">{totalItems}</Typography>
                <Typography variant="body2" color="text.secondary">Total Quantity</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Warning color="warning" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">{lowStockItems}</Typography>
                <Typography variant="body2" color="text.secondary">Low Stock Items</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoney color="info" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">${totalValue.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary">Total Value</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </ListStatsGrid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by name, SKU, or category..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {smUp ? (
        <Paper sx={{ width: '100%' }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table stickyHeader size={compactList ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>Item</TableCell>

                  <TableCell sx={{ display: compactList ? 'none' : 'table-cell', whiteSpace: 'nowrap' }}>
                    Category
                  </TableCell>
                  <TableCell sx={{ display: compactList ? 'none' : 'table-cell', whiteSpace: 'nowrap' }}>
                    SKU
                  </TableCell>

                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>Quantity</TableCell>

                  <TableCell
                    align="right"
                    sx={{ display: compactList ? 'none' : 'table-cell', whiteSpace: 'nowrap' }}
                  >
                    Price
                  </TableCell>

                  <TableCell>Status</TableCell>

                  <TableCell sx={{ display: compactList ? 'none' : 'table-cell', whiteSpace: 'nowrap' }}>
                    Description
                  </TableCell>
                  <TableCell sx={{ display: compactList ? 'none' : 'table-cell', whiteSpace: 'nowrap' }}>
                    Last Updated
                  </TableCell>

                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInventory.map((item) => {
                  const statusDisplay = getStatusDisplay(item.quantityOnHand, item.reorderLevel)
                  return (
                    <TableRow key={item.id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {item.id}
                          </Typography>
                          {compactList && (
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {item.category || 'Uncategorized'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                SKU: {item.sku || 'N/A'}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell sx={{ display: compactList ? 'none' : 'table-cell' }}>
                        {item.category || 'Uncategorized'}
                      </TableCell>
                      <TableCell sx={{ display: compactList ? 'none' : 'table-cell' }}>
                        {item.sku || 'N/A'}
                      </TableCell>

                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Typography
                          variant="body2"
                          color={item.reorderLevel && item.quantityOnHand <= item.reorderLevel ? 'warning.main' : 'inherit'}
                          fontWeight="medium"
                        >
                          {item.quantityOnHand}
                        </Typography>
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{ display: compactList ? 'none' : 'table-cell', whiteSpace: 'nowrap' }}
                      >
                        ${item.unitPrice.toFixed(2)}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={statusDisplay.label}
                          color={statusDisplay.color as ChipProps['color']}
                          size="small"
                          icon={statusDisplay.icon}
                        />
                      </TableCell>

                      <TableCell sx={{ display: compactList ? 'none' : 'table-cell' }}>
                        {item.description ? 'Has Description' : 'No Description'}
                      </TableCell>
                      <TableCell sx={{ display: compactList ? 'none' : 'table-cell' }}>
                        {new Date(item.updatedUtc || item.createdUtc).toLocaleDateString()}
                      </TableCell>

                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate({ to: `/inventory/${item.id}` })}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>

                          <Box sx={{ display: compactList ? 'none' : 'inline-flex' }}>
                            <Tooltip title="Edit Item">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() =>
                                  navigate({
                                    to: '/inventory/edit/$itemId',
                                    params: { itemId: String(item.id) },
                                  })
                                }
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Item">
                              <IconButton size="small" color="error">
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gap: 2 }}>
          {filteredInventory.map((item) => {
            const statusDisplay = getStatusDisplay(item.quantityOnHand, item.reorderLevel)
            return (
              <Card key={item.id} variant="outlined">
                <CardContent sx={{ display: 'grid', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1">{item.name}</Typography>
                    <Chip
                      label={statusDisplay.label}
                      color={statusDisplay.color as ChipProps['color']}
                      size="small"
                      icon={statusDisplay.icon}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {item.category || 'Uncategorized'} • SKU: {item.sku || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    Quantity: <strong>{item.quantityOnHand}</strong> • Price: <strong>${item.unitPrice.toFixed(2)}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Updated: {new Date(item.updatedUtc || item.createdUtc).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button
                      size="small"
                      onClick={() => navigate({ to: `/inventory/${item.id}` })}
                      startIcon={<Visibility />}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      onClick={() =>
                        navigate({
                          to: '/inventory/edit/$itemId',
                          params: { itemId: String(item.id) },
                        })
                      }
                      startIcon={<Edit />}
                    >
                      Edit
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )
          })}
        </Box>
      )}

      <ListSummaryFooter
        primary={
          <Typography variant="body2" color="text.secondary">
            Showing {filteredInventory.length} of {inventoryItems.length} items
          </Typography>
        }
      >
        <Typography variant="body2" color="text.secondary">
          Total Value: <strong>${totalValue.toLocaleString()}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total Quantity: <strong>{totalItems.toLocaleString()}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Low Stock: <strong>{lowStockItems}</strong>
        </Typography>
      </ListSummaryFooter>
    </ResourceListPage>
  )
}

import { createFileRoute } from '@tanstack/react-router'
import { TableSkeleton } from '../../components/Skeletons'
import { ResourceListPage } from '../../components/ResourceListPage'
import { ListStatsGrid } from '../../components/ListStatsGrid'
import { ListSummaryFooter } from '../../components/ListSummaryFooter'
import { DataTable, type DataTableColumn } from '../../components/DataTable'
import {
  Alert,
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
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
  AttachMoney,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useInventoryItems, useDeleteInventoryItem, type InventoryItemDto } from '../../api/inventory'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useCompactListLayout } from '../../hooks/useCompactListLayout'
import { LIST_SEARCH_DEBOUNCE_MS } from '../../lib/listBreakpoints'

export const Route = createFileRoute('/inventory/')({
  component: InventoryIndexComponent,
})

function getStatusDisplay(quantity: number, reorderLevel?: number) {
  if (quantity === 0) {
    return { color: 'error' as const, icon: <Warning fontSize="small" />, label: 'Out of Stock' }
  }
  if (reorderLevel && quantity <= reorderLevel) {
    return { color: 'warning' as const, icon: <Warning fontSize="small" />, label: 'Low Stock' }
  }
  return { color: 'success' as const, icon: <CheckCircle fontSize="small" />, label: 'In Stock' }
}

function InventoryIndexComponent() {
  const navigate = useNavigate()
  const theme = useTheme()
  const smUp = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true })
  const compactList = useCompactListLayout()

  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebouncedValue(searchTerm, LIST_SEARCH_DEBOUNCE_MS)
  const { data: inventoryItems = [], isLoading, isError, error } = useInventoryItems()
  const deleteItem = useDeleteInventoryItem()

  const confirmDelete = useCallback(
    (id: number, name: string) => {
      if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
        void deleteItem.mutate(id)
      }
    },
    [deleteItem]
  )

  const filteredInventory = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return inventoryItems
    const q = debouncedSearchTerm.toLowerCase()
    return inventoryItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.sku && item.sku.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q))
    )
  }, [inventoryItems, debouncedSearchTerm])

  const toItem = useCallback(
    (id: number) => navigate({ to: '/inventory/$itemId', params: { itemId: String(id) } }),
    [navigate]
  )
  const toEdit = useCallback(
    (id: number) => navigate({ to: '/inventory/edit/$itemId', params: { itemId: String(id) } }),
    [navigate]
  )

  const columns: DataTableColumn<InventoryItemDto>[] = useMemo(
    () => [
      {
        id: 'item',
        label: 'Item',
        sortable: true,
        sortAccessor: (it) => it.name.toLowerCase(),
        render: (item) => (
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {item.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">ID: {item.id}</Typography>
              {compactList && (
                <Box sx={{ mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {item.category || 'Uncategorized'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">SKU: {item.sku || 'N/A'}</Typography>
                </Box>
              )}
            </Box>
        ),
      },
      {
        id: 'category',
        label: 'Category',
        hideOnCompact: true,
        sortable: true,
        sortAccessor: (it) => (it.category || 'Uncategorized').toLowerCase(),
        render: (it) => it.category || 'Uncategorized',
      },
      {
        id: 'sku',
        label: 'SKU',
        hideOnCompact: true,
        sortable: true,
        sortAccessor: (it) => (it.sku || '').toLowerCase(),
        render: (it) => it.sku || 'N/A',
      },
      {
        id: 'quantity',
        label: 'Quantity',
        align: 'right',
        sortable: true,
        sortAccessor: (it) => it.quantityOnHand,
        render: (item) => (
            <Typography
              variant="body2"
              color={item.reorderLevel && item.quantityOnHand <= item.reorderLevel ? 'warning.main' : 'inherit'}
              fontWeight="medium"
            >
              {item.quantityOnHand}
            </Typography>
        ),
      },
      {
        id: 'price',
        label: 'Price',
        align: 'right',
        hideOnCompact: true,
        sortable: true,
        sortAccessor: (it) => it.unitPrice,
        render: (it) => `$${it.unitPrice.toFixed(2)}`,
      },
      {
        id: 'status',
        label: 'Status',
        sortable: true,
        sortAccessor: (it) => {
          const s = getStatusDisplay(it.quantityOnHand, it.reorderLevel)
          return s.label
        },
        render: (item) => {
          const statusDisplay = getStatusDisplay(item.quantityOnHand, item.reorderLevel)
          return (
            <Chip
              label={statusDisplay.label}
              color={statusDisplay.color as ChipProps['color']}
              size="small"
              icon={statusDisplay.icon}
            />
          )
        },
      },
      {
        id: 'description',
        label: 'Description',
        hideOnCompact: true,
        sortable: true,
        sortAccessor: (it) => (it.description ? 1 : 0),
        render: (it) => (it.description ? 'Has Description' : 'No Description'),
      },
      {
        id: 'updated',
        label: 'Last Updated',
        hideOnCompact: true,
        sortable: true,
        sortAccessor: (it) => new Date(it.updatedUtc || it.createdUtc).getTime(),
        render: (it) => new Date(it.updatedUtc || it.createdUtc).toLocaleDateString(),
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'center',
        render: (item) => (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Tooltip title="View Details">
              <IconButton size="small" color="primary" onClick={() => toItem(item.id)}>
                <Visibility />
              </IconButton>
            </Tooltip>
            <Box sx={{ display: compactList ? 'none' : 'inline-flex' }}>
              <Tooltip title="Edit Item">
                <IconButton size="small" color="warning" onClick={() => toEdit(item.id)}>
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete item">
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => confirmDelete(item.id, item.name)}
                    disabled={deleteItem.isPending}
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
    [compactList, toItem, toEdit, confirmDelete, deleteItem.isPending]
  )

  const totalValue = inventoryItems.reduce((sum, item) => sum + item.unitPrice * item.quantityOnHand, 0)
  const totalItems = inventoryItems.reduce((sum, item) => sum + item.quantityOnHand, 0)
  const lowStockItems = inventoryItems.filter((item) => item.reorderLevel && item.quantityOnHand <= item.reorderLevel).length

  const headerActions = (
    <Button variant="contained" startIcon={<Add />} onClick={() => navigate({ to: '/inventory/create' })}>
      Add New Item
    </Button>
  )

  if (isLoading) {
    return (
      <ResourceListPage title="Inventory Management" actions={headerActions}>
        <TableSkeleton rows={8} columns={9} />
      </ResourceListPage>
    )
  }

  return (
    <ResourceListPage title="Inventory Management" actions={headerActions}>
      {/* Fetch errors: inline Alert only (no duplicate toast), same pattern as invoices/projects/users. */}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.message || 'Failed to load inventory. You can retry from the browser or after signing in again.'}
        </Alert>
      )}

      <ListStatsGrid compact={compactList}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InventoryIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 300 }}>{inventoryItems.length}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>Total Items</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InventoryIcon color="success" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 300 }}>{totalItems}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>Total Quantity</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Warning color="warning" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 300 }}>{lowStockItems}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>Low Stock Items</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoney color="info" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 300 }}>${totalValue.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>Total Value</Typography>
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
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <DataTable<InventoryItemDto>
        columns={columns}
        rows={filteredInventory}
        getRowId={(r) => r.id}
        compact={compactList}
        isDesktop={smUp}
        emptyMessage="No items match your search."
        defaultRowsPerPage={10}
        renderMobileRow={(item) => {
          const statusDisplay = getStatusDisplay(item.quantityOnHand, item.reorderLevel)
          return (
            <Card variant="outlined">
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
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  <Button size="small" onClick={() => toItem(item.id)} startIcon={<Visibility />}>
                    View
                  </Button>
                  <Button size="small" onClick={() => toEdit(item.id)} startIcon={<Edit />}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => confirmDelete(item.id, item.name)}
                    disabled={deleteItem.isPending}
                    startIcon={<Delete />}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )
        }}
      />

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
        <Typography variant="body2" color="text.secondary">Low Stock: <strong>{lowStockItems}</strong></Typography>
      </ListSummaryFooter>
    </ResourceListPage>
  )
}

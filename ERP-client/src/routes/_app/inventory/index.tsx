import { createFileRoute } from '@tanstack/react-router'
import { TableSkeleton } from '@/components/Skeletons'
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
} from '@mui/material'
import type { ChipProps } from '@mui/material/Chip'
import {
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
import { useInventoryItems, useDeleteInventoryItem, type InventoryItemDto } from '@/api/inventory'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useCompactListLayout } from '@/hooks/useCompactListLayout'
import { LIST_SEARCH_DEBOUNCE_MS } from '@/lib/listBreakpoints'
import { formatDisplayDate, parseApiDate } from '@/lib/dates'

export const Route = createFileRoute('/_app/inventory/')({
  component: InventoryIndexComponent,
})

type StockStatusFilter = 'all' | 'out' | 'low' | 'inStock'

function getStockTier(quantityOnHand: number, reorderLevel?: number): Exclude<StockStatusFilter, 'all'> {
  if (quantityOnHand === 0) return 'out'
  if (reorderLevel && quantityOnHand <= reorderLevel) return 'low'
  return 'inStock'
}

function getStatusDisplay(quantity: number, reorderLevel?: number) {
  const tier = getStockTier(quantity, reorderLevel)
  if (tier === 'out') {
    return { color: 'error' as const, icon: <Warning fontSize="small" />, label: 'Out of Stock' }
  }
  if (tier === 'low') {
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
  const [stockFilter, setStockFilter] = useState<StockStatusFilter>('all')
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
    let rows = inventoryItems
    if (stockFilter !== 'all') {
      rows = rows.filter((item) => getStockTier(item.quantityOnHand, item.reorderLevel) === stockFilter)
    }
    if (!debouncedSearchTerm.trim()) return rows
    const q = debouncedSearchTerm.toLowerCase()
    return rows.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.sku && item.sku.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q))
    )
  }, [inventoryItems, debouncedSearchTerm, stockFilter])

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
        sortAccessor: (it) => parseApiDate(it.updatedUtc || it.createdUtc)?.getTime() ?? 0,
        render: (it) => formatDisplayDate(it.updatedUtc || it.createdUtc),
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

  const toolbar = (
      <ListPageToolbar
        search={
          <TextField
            fullWidth
            size="small"
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
        }
        filters={
          <FormControl fullWidth size="small">
            <InputLabel id="inventory-stock-filter-label">Stock</InputLabel>
            <Select
              labelId="inventory-stock-filter-label"
              label="Stock"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as StockStatusFilter)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="inStock">In stock</MenuItem>
              <MenuItem value="low">Low stock</MenuItem>
              <MenuItem value="out">Out of stock</MenuItem>
            </Select>
          </FormControl>
        }
        actions={<PrimaryActionButton label="Add New Item" to="/inventory/create" />}
      />
  )

  if (isLoading) {
    return (
      <ResourceListPage>
        {toolbar}
        <TableSkeleton rows={8} columns={9} />
      </ResourceListPage>
    )
  }

  return (
    <ResourceListPage>
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.message || 'Failed to load inventory. You can retry from the browser or after signing in again.'}
        </Alert>
      )}

      <ListStatsGrid compact={compactList}>
        <ListStatCard icon={InventoryIcon} iconColor="primary" value={inventoryItems.length} label="Total Items" />
        <ListStatCard icon={InventoryIcon} iconColor="success" value={totalItems} label="Total Quantity" />
        <ListStatCard icon={Warning} iconColor="warning" value={lowStockItems} label="Low Stock Items" />
        <ListStatCard
          icon={AttachMoney}
          iconColor="info"
          value={`$${totalValue.toLocaleString()}`}
          label="Total Value"
        />
      </ListStatsGrid>

      {toolbar}

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
                  Updated: {formatDisplayDate(item.updatedUtc || item.createdUtc)}
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

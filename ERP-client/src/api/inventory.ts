import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/axios'
import { apiRequest } from '../lib/apiError'
import { showSuccess, showError } from '../lib/toast'

export interface InventoryItemDto {
  id: number
  sku: string
  name: string
  description?: string
  category?: string
  location?: string
  supplier?: string
  tags?: string
  quantityOnHand: number
  unitPrice: number
  reorderLevel?: number
  createdUtc: string
  updatedUtc?: string
}

export interface CreateInventoryItemDto {
  sku?: string
  name: string
  description?: string
  category?: string
  location?: string
  supplier?: string
  tags?: string
  quantityOnHand: number
  unitPrice: number
  reorderLevel?: number
}

export interface UpdateInventoryItemDto {
  sku?: string
  name: string
  description?: string
  category?: string
  location?: string
  supplier?: string
  tags?: string
  quantityOnHand: number
  unitPrice: number
  reorderLevel?: number
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (filters: string) => [...inventoryKeys.lists(), { filters }] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: number) => [...inventoryKeys.details(), id] as const,
}

const inventoryApi = {
  getAll: () =>
    apiRequest(
      () => http.get<InventoryItemDto[]>('/inventory').then((r) => r.data),
      'Failed to load inventory items.'
    ),

  getById: (id: number) =>
    apiRequest(
      () => http.get<InventoryItemDto>(`/inventory/${id}`).then((r) => r.data),
      'Failed to load this inventory item.'
    ),

  create: (item: CreateInventoryItemDto) =>
    apiRequest(
      () => http.post<InventoryItemDto>('/inventory', item).then((r) => r.data),
      'Failed to create inventory item.'
    ),

  update: (id: number, item: UpdateInventoryItemDto) =>
    apiRequest(
      () => http.put(`/inventory/${id}`, item).then(() => undefined),
      'Failed to update inventory item.'
    ),

  delete: (id: number) =>
    apiRequest(
      () => http.delete(`/inventory/${id}`).then(() => undefined),
      'Failed to delete inventory item.'
    ),

  async checkSkuExists(sku: string): Promise<boolean> {
    try {
      const items = await inventoryApi.getAll()
      return items.some((item) => item.sku === sku)
    } catch {
      return true
    }
  },
}

export const useInventoryItems = () => {
  return useQuery({
    queryKey: inventoryKeys.lists(),
    queryFn: () => inventoryApi.getAll(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

export const useInventoryItem = (id: number) => {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: () => inventoryApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: inventoryApi.create,
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })

      queryClient.setQueryData(inventoryKeys.detail(newItem.id), newItem)

      showSuccess(`Item "${newItem.name}" created successfully!`)
    },
    onError: (error: Error) => {
      console.error('Failed to create inventory item:', error)
      showError(error.message || 'Failed to create inventory item')
    },
  })
}

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, item }: { id: number; item: UpdateInventoryItemDto }) =>
      inventoryApi.update(id, item),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(id) })

      showSuccess('Item updated successfully!')
    },
    onError: (error: Error) => {
      console.error('Failed to update inventory item:', error)
      showError(error.message || 'Failed to update inventory item')
    },
  })
}

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: inventoryApi.delete,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })

      queryClient.removeQueries({ queryKey: inventoryKeys.detail(deletedId) })

      showSuccess('Item deleted successfully!')
    },
    onError: (error: Error) => {
      console.error('Failed to delete inventory item:', error)
      showError(error.message || 'Failed to delete inventory item')
    },
  })
}

export const getInventory = () => inventoryApi.getAll()

export const postInventory = (item: CreateInventoryItemDto) => inventoryApi.create(item)

export const getInventoryById = (id: number) => inventoryApi.getById(id)

export const putInventoryById = (id: number, item: UpdateInventoryItemDto) => inventoryApi.update(id, item)

export const deleteInventoryById = (id: number) => inventoryApi.delete(id)

export { inventoryApi }

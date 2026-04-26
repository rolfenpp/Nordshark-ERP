import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/axios'
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
  async getAll(): Promise<InventoryItemDto[]> {
    try {
      const response = await http.get<InventoryItemDto[]>('/inventory')
      return response.data
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - Please log in again')
      }
      if (error.response?.status === 403) {
        throw new Error('Access denied - You do not have permission to view inventory')
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch inventory items')
    }
  },

  async getById(id: number): Promise<InventoryItemDto> {
    try {
      const response = await http.get<InventoryItemDto>(`/inventory/${id}`)
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Inventory item not found')
      }
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - Please log in again')
      }
      if (error.response?.status === 403) {
        throw new Error('Access denied - You do not have permission to view this item')
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch inventory item')
    }
  },

  async create(item: CreateInventoryItemDto): Promise<InventoryItemDto> {
    try {
      const response = await http.post<InventoryItemDto>('/inventory', item)
      return response.data
    } catch (error: any) {
      if (error.response?.status === 400) {
        const validationErrors = error.response.data?.errors
        if (validationErrors) {
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
            .join('; ')
          throw new Error(`Validation failed: ${errorMessages}`)
        }
        throw new Error(error.response.data?.message || 'Invalid data provided')
      }
      if (error.response?.status === 409) {
        throw new Error('An item with this SKU already exists in your company')
      }
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - Please log in again')
      }
      if (error.response?.status === 403) {
        throw new Error('Access denied - You do not have permission to create inventory items')
      }
      throw new Error(error.response?.data?.message || 'Failed to create inventory item')
    }
  },

  async update(id: number, item: UpdateInventoryItemDto): Promise<void> {
    try {
      await http.put(`/inventory/${id}`, item)
    } catch (error: any) {
      if (error.response?.status === 400) {
        const validationErrors = error.response.data?.errors
        if (validationErrors) {
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
            .join('; ')
          throw new Error(`Validation failed: ${errorMessages}`)
        }
        throw new Error(error.response.data?.message || 'Invalid data provided')
      }
      if (error.response?.status === 404) {
        throw new Error('Inventory item not found')
      }
      if (error.response?.status === 409) {
        throw new Error('An item with this SKU already exists in your company')
      }
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - Please log in again')
      }
      if (error.response?.status === 403) {
        throw new Error('Access denied - You do not have permission to edit this item')
      }
      throw new Error(error.response?.data?.message || 'Failed to update inventory item')
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await http.delete(`/inventory/${id}`)
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Inventory item not found')
      }
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - Please log in again')
      }
      if (error.response?.status === 403) {
        throw new Error('Access denied - You do not have permission to delete this item')
      }
      throw new Error(error.response?.data?.message || 'Failed to delete inventory item')
    }
  },

  async checkSkuExists(sku: string): Promise<boolean> {
    try {
      const items = await this.getAll()
      return items.some(item => item.sku === sku)
    } catch (error) {
      return true
    }
  }
}

export const useInventoryItems = () => {
  return useQuery({
    queryKey: inventoryKeys.lists(),
    queryFn: inventoryApi.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
      
      queryClient.setQueryData(
        inventoryKeys.detail(newItem.id),
        newItem
      )
      
      showSuccess(`Item "${newItem.name}" created successfully!`)
    },
    onError: (error: any) => {
      console.error('Failed to create inventory item:', error)
      showError(error.message || 'Failed to create inventory item')
    }
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
    onError: (error: any) => {
      console.error('Failed to update inventory item:', error)
      showError(error.message || 'Failed to update inventory item')
    }
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
    onError: (error: any) => {
      console.error('Failed to delete inventory item:', error)
      showError(error.message || 'Failed to delete inventory item')
    }
  })
}

export const getInventory = () => inventoryApi.getAll()

export const postInventory = (item: CreateInventoryItemDto) => inventoryApi.create(item)

export const getInventoryById = (id: number) => inventoryApi.getById(id)

export const putInventoryById = (id: number, item: UpdateInventoryItemDto) => inventoryApi.update(id, item)

export const deleteInventoryById = (id: number) => inventoryApi.delete(id)

export { inventoryApi }

import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/axios'
import { apiRequest } from '../lib/apiError'
import { showSuccess, showError } from '../lib/toast'

export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'draft'

export interface InvoiceLineDto {
  id: number
  lineNumber: number
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface InvoiceListDto {
  id: number
  invoiceNumber: string
  issueDate: string
  dueDate: string
  clientName: string
  clientEmail?: string
  subtotal: number
  taxAmount: number
  total: number
  status: string
  paymentMethod?: string
  paidDate?: string
}

export interface InvoiceDetailDto {
  id: number
  invoiceNumber: string
  issueDate: string
  dueDate: string
  clientName: string
  clientEmail?: string
  clientAddress?: string
  status: string
  subtotal: number
  taxAmount: number
  total: number
  taxRatePercent: number
  terms?: string
  currency: string
  notes?: string
  paymentMethod?: string
  paidDate?: string
  createdUtc: string
  updatedUtc?: string
  lines: InvoiceLineDto[]
}

export interface CreateInvoiceLineDto {
  lineNumber: number
  description: string
  quantity: number
  unitPrice: number
}

export interface CreateInvoiceDto {
  invoiceNumber?: string
  issueDate: string
  dueDate: string
  clientName: string
  clientEmail?: string
  clientAddress?: string
  status?: string
  taxRatePercent: number
  terms?: string
  currency?: string
  notes?: string
  lines: CreateInvoiceLineDto[]
}

export interface UpdateInvoiceDto extends CreateInvoiceDto {
  paymentMethod?: string
  paidDate?: string
}

export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  detail: (id: number) => [...invoiceKeys.all, 'detail', id] as const,
}

const invoicesApi = {
  getAll: () =>
    apiRequest(
      () => http.get<InvoiceListDto[]>('/invoices').then((r) => r.data),
      'Failed to load invoices.'
    ),
  getById: (id: number) =>
    apiRequest(
      () => http.get<InvoiceDetailDto>(`/invoices/${id}`).then((r) => r.data),
      'Failed to load invoice.'
    ),
  create: (body: CreateInvoiceDto) =>
    apiRequest(
      () => http.post<InvoiceDetailDto>('/invoices', body).then((r) => r.data),
      'Failed to create invoice.'
    ),
  update: (id: number, body: UpdateInvoiceDto) =>
    apiRequest(
      () => http.put(`/invoices/${id}`, body).then(() => undefined as void),
      'Failed to update invoice.'
    ),
  delete: (id: number) =>
    apiRequest(
      () => http.delete(`/invoices/${id}`).then(() => undefined as void),
      'Failed to delete invoice.'
    ),
}

export const useInvoices = () =>
  useQuery({
    queryKey: invoiceKeys.lists(),
    queryFn: invoicesApi.getAll,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })

export const useInvoice = (id: number) =>
  useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoicesApi.getById(id),
    enabled: Number.isFinite(id) && id > 0,
  })

export const useCreateInvoice = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: invoicesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoiceKeys.lists() })
      showSuccess('Invoice created')
    },
    onError: (e: Error) => showError(e.message || 'Failed to create invoice'),
  })
}

export const useUpdateInvoice = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateInvoiceDto }) => invoicesApi.update(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: invoiceKeys.lists() })
      qc.invalidateQueries({ queryKey: invoiceKeys.detail(id) })
      showSuccess('Invoice updated')
    },
    onError: (e: Error) => showError(e.message || 'Failed to update invoice'),
  })
}

export const useDeleteInvoice = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: invoicesApi.delete,
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: invoiceKeys.lists() })
      qc.removeQueries({ queryKey: invoiceKeys.detail(id) })
      showSuccess('Invoice deleted')
    },
    onError: (e: Error) => showError(e.message || 'Failed to delete invoice'),
  })
}

export { invoicesApi }

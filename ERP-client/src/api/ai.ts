import { useMutation, useQuery } from '@tanstack/react-query'
import { http } from '../lib/axios'
import { apiRequest } from '../lib/apiError'

export type AiSuggestedAction = {
  label: string
  route: string
}

export type AiHelpResponse = {
  answer: string
  suggestedActions: AiSuggestedAction[]
  configured: boolean
}

export type AiBriefFact = {
  label: string
  value: string
  entityType: string
}

export type AiBriefResponse = {
  asOfUtc: string
  narrative: string
  facts: AiBriefFact[]
  invoices?: {
    totalCount: number
    overdueCount: number
    pendingOrOverdueCount: number
    outstandingTotal: number
    overdueExamples: string[]
  } | null
  inventory?: {
    itemCount: number
    outOfStockCount: number
    lowStockCount: number
    stockValue: number
    exceptions: string[]
  } | null
  projects?: {
    totalCount: number
    slippingCount: number
    highPriorityOpenCount: number
    examples: string[]
  } | null
  configured: boolean
  limitations: string[]
}

export type AiInvoiceDraftLine = {
  lineNumber: number
  description: string
  quantity: number
  unitPrice: number
}

export type AiInvoiceDraftPayload = {
  clientName?: string | null
  clientEmail?: string | null
  clientAddress?: string | null
  issueDate?: string | null
  dueDate?: string | null
  currency?: string | null
  terms?: string | null
  taxRatePercent?: number | null
  notes?: string | null
  lines: AiInvoiceDraftLine[]
  warnings: string[]
  assumptions: string[]
}

export type AiInvoiceDraftResponse = {
  ok: boolean
  error?: string | null
  draft?: AiInvoiceDraftPayload | null
  configured: boolean
}

export const aiKeys = {
  all: ['ai'] as const,
  status: () => [...aiKeys.all, 'status'] as const,
  brief: () => [...aiKeys.all, 'brief'] as const,
}

const aiApi = {
  status: () =>
    apiRequest(
      () => http.get<{ configured: boolean }>('/ai/status').then((r) => r.data),
      'Failed to check AI status.',
    ),

  help: (question: string, currentRoute?: string) =>
    apiRequest(
      () =>
        http
          .post<AiHelpResponse>('/ai/help', { question, currentRoute })
          .then((r) => r.data),
      'Failed to get AI help.',
    ),

  brief: () =>
    apiRequest(
      () => http.get<AiBriefResponse>('/ai/brief').then((r) => r.data),
      'Failed to load operations brief.',
    ),

  draftInvoice: (text: string) =>
    apiRequest(
      () =>
        http
          .post<AiInvoiceDraftResponse>('/ai/drafts/invoice', { text })
          .then((r) => r.data),
      'Failed to draft invoice.',
    ),
}

export function useAiStatus() {
  return useQuery({
    queryKey: aiKeys.status(),
    queryFn: aiApi.status,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useAiBrief(enabled = false) {
  return useQuery({
    queryKey: aiKeys.brief(),
    queryFn: aiApi.brief,
    enabled,
    staleTime: 60_000,
  })
}

export function useAiBriefOnDemand() {
  return useMutation({
    mutationFn: aiApi.brief,
  })
}

export function useAiHelp() {
  return useMutation({
    mutationFn: ({ question, currentRoute }: { question: string; currentRoute?: string }) =>
      aiApi.help(question, currentRoute),
  })
}

export function useDraftInvoiceFromBrief() {
  return useMutation({
    mutationFn: (text: string) => aiApi.draftInvoice(text),
  })
}

export { aiApi }

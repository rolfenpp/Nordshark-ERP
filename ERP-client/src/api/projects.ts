import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/axios'
import { apiRequest } from '../lib/apiError'
import { showSuccess, showError } from '../lib/toast'

export interface ProjectDto {
  id: number
  name: string
  description?: string
  startDate?: string
  endDate?: string
  client?: string
  manager?: string
  status?: string
  priority?: string
  progress: number
  budget?: number
  tags?: string
  createdUtc: string
  updatedUtc?: string
}

export interface CreateProjectDto {
  name: string
  description?: string
  startDate?: string
  endDate?: string
  client?: string
  manager?: string
  status?: string
  priority?: string
  progress?: number
  budget?: number
  tags?: string
}

export type UpdateProjectDto = CreateProjectDto

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  detail: (id: number) => [...projectKeys.all, 'detail', id] as const,
}

const projectsApi = {
  getAll: () =>
    apiRequest(
      () => http.get<ProjectDto[]>('/projects').then((r) => r.data),
      'Failed to load projects.'
    ),
  getById: (id: number) =>
    apiRequest(
      () => http.get<ProjectDto>(`/projects/${id}`).then((r) => r.data),
      'Failed to load project.'
    ),
  create: (body: CreateProjectDto) =>
    apiRequest(
      () => http.post<ProjectDto>('/projects', body).then((r) => r.data),
      'Failed to create project.'
    ),
  update: (id: number, body: UpdateProjectDto) =>
    apiRequest(
      () => http.put(`/projects/${id}`, body).then(() => undefined as void),
      'Failed to update project.'
    ),
  delete: (id: number) =>
    apiRequest(
      () => http.delete(`/projects/${id}`).then(() => undefined as void),
      'Failed to delete project.'
    ),
}

export const useProjects = () =>
  useQuery({
    queryKey: projectKeys.lists(),
    queryFn: projectsApi.getAll,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })

export const useProject = (id: number) =>
  useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsApi.getById(id),
    enabled: Number.isFinite(id) && id > 0,
  })

export const useCreateProject = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.lists() })
      showSuccess('Project created')
    },
    onError: (e: Error) => showError(e.message || 'Failed to create project'),
  })
}

export const useUpdateProject = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateProjectDto }) => projectsApi.update(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: projectKeys.lists() })
      qc.invalidateQueries({ queryKey: projectKeys.detail(id) })
      showSuccess('Project updated')
    },
    onError: (e: Error) => showError(e.message || 'Failed to update project'),
  })
}

export const useDeleteProject = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: projectKeys.lists() })
      qc.removeQueries({ queryKey: projectKeys.detail(id) })
      showSuccess('Project deleted')
    },
    onError: (e: Error) => showError(e.message || 'Failed to delete project'),
  })
}

export { projectsApi }

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/axios'
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
  async getAll(): Promise<ProjectDto[]> {
    const { data } = await http.get<ProjectDto[]>('/projects')
    return data
  },
  async getById(id: number): Promise<ProjectDto> {
    const { data } = await http.get<ProjectDto>(`/projects/${id}`)
    return data
  },
  async create(body: CreateProjectDto): Promise<ProjectDto> {
    const { data } = await http.post<ProjectDto>('/projects', body)
    return data
  },
  async update(id: number, body: UpdateProjectDto): Promise<void> {
    await http.put(`/projects/${id}`, body)
  },
  async delete(id: number): Promise<void> {
    await http.delete(`/projects/${id}`)
  },
}

export const useProjects = () =>
  useQuery({
    queryKey: projectKeys.lists(),
    queryFn: projectsApi.getAll,
    staleTime: 60_000,
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

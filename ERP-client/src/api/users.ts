import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { http } from '../lib/axios'
import { apiRequest } from '../lib/apiError'

export interface UserDto {
  id: string
  email: string
  emailConfirmed: boolean
  roles: string[]
}

export const userKeys = {
  all: ['users'] as const,
  list: () => [...userKeys.all, 'list'] as const,
}

function fetchUsers(): Promise<UserDto[]> {
  return apiRequest(() => http.get<UserDto[]>('/users').then((r) => r.data), 'Failed to load users.')
}

export const useUsers = () =>
  useQuery({
    queryKey: userKeys.list(),
    queryFn: fetchUsers,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })

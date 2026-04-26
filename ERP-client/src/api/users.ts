import { useQuery } from '@tanstack/react-query'
import { http } from '../lib/axios'

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

async function fetchUsers(): Promise<UserDto[]> {
  const { data } = await http.get<UserDto[]>('/users')
  return data
}

export const useUsers = () =>
  useQuery({
    queryKey: userKeys.list(),
    queryFn: fetchUsers,
    staleTime: 60_000,
  })

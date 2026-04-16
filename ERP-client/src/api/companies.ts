import { useMutation } from '@tanstack/react-query'
import { http } from '../lib/axios'

export interface RegisterCompanyRequest {
  name: string
  adminEmail: string
  adminPassword: string
}

export interface RegisterCompanyResponse {
  companyId: number
  companyName: string
  adminUserId: string
  adminEmail: string
  token: string
}

const registerCompany = async (body: RegisterCompanyRequest): Promise<RegisterCompanyResponse> => {
  const { data } = await http.post<RegisterCompanyResponse>('/companies/register', body)
  return data
}

export const useRegisterCompany = () =>
  useMutation({
    mutationFn: registerCompany,
  })

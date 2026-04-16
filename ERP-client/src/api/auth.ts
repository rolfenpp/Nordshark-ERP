import { useMutation } from '@tanstack/react-query'
import { http } from '../lib/axios'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface RegisterResponse {
  token: string
}

const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const { data } = await http.post<LoginResponse>('/Account/login', credentials)
  return data
}

const registerUser = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  const { data } = await http.post<RegisterResponse>('/Account/register', userData)
  return data
}

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
    onError: (error) => {
      console.error('Login failed:', error)
    },
  })
}

export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,
    onError: (error) => {
      console.error('Registration failed:', error)
    },
  })
}

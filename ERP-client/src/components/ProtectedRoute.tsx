import { useEffect } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useAuth } from '@/auth/AuthProvider'
import { Box, CircularProgress, Typography } from '@mui/material'
import { attemptedPathForRedirect } from '@/lib/authRedirect'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, token } = useAuth()
  const navigate = useNavigate()
  const { pathname, search } = useRouterState({
    select: (s) => ({
      pathname: s.location.pathname,
      search: s.location.search,
    }),
  })

  useEffect(() => {
    if (!isAuthenticated && !token) {
      const path = attemptedPathForRedirect(pathname, search)
      navigate({
        to: '/login',
        replace: true,
        ...(path ? { search: { redirect: path } } : {}),
      })
    }
  }, [isAuthenticated, token, navigate, pathname, search])

  if (!isAuthenticated && !token) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Checking authentication...
        </Typography>
      </Box>
    )
  }

  return <>{children}</>
}

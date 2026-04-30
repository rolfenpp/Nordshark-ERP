import { createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { appDateLocale } from '@/lib/dates'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { AuthProvider, useAuth } from '@/auth/AuthProvider'
import { AIAssistant } from '@/components/AIAssistant'
import { Box, Alert } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { ThreeDot } from 'react-loading-indicators'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function RootComponent() {
  const theme = useTheme()
  const { isAuthenticated, ready, error } = useAuth()

  if (!ready) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <ThreeDot
          color={theme.palette.primary.main}
          size="medium"
          text=""
          textColor=""
        />
      </Box>
    )
  }

  return (
    <>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            position: 'fixed', 
            top: 16, 
            left: 16, 
            right: 16, 
            zIndex: 9999,
            borderRadius: 2
          }}
        >
          {error}
        </Alert>
      )}
      {isAuthenticated && <AIAssistant />}
      <Outlet />
    </>
  )
}

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={appDateLocale}>
          <AuthProvider>
            <RootComponent />
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  ),
})
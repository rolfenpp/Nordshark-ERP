import { createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { appDateLocale } from '@/lib/dates'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { AuthProvider } from '@/auth/AuthProvider'
import { useAuth } from '@/auth/AuthProvider'
import { AIAssistant } from '@/components/AIAssistant'
import { DashboardShellProvider } from '@/components/DashboardShellContext'
import { ToastContainer } from 'react-toastify'
import { useTheme } from '@mui/material/styles'
import { Box, Alert } from '@mui/material'
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
  const { isAuthenticated, ready, error } = useAuth()
  const theme = useTheme()
  
  if (!ready) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: 'linear-gradient(135deg, #f8f9fa 0%, rgb(148, 116, 151) 100%)'
        }}
      >
        <ThreeDot color="rgb(148, 116, 151)" size="medium" text="" textColor="" />
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
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme.palette.mode}
        closeButton={false}
        icon={false}
      />
      <DashboardShellProvider>
        <Outlet />
      </DashboardShellProvider>
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
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@fontsource/poppins/300.css'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/600.css'
import 'react-toastify/dist/ReactToastify.css'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { ThreeDot } from 'react-loading-indicators'
import { routeTree } from './routeTree.gen'
import { appDateLocale } from '@/lib/dates'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { AuthProvider, useAuth } from '@/auth/AuthProvider'

const router = createRouter({ routeTree })

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function AuthReadyGate({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  const { ready } = useAuth()

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

  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
      <ThemeProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={appDateLocale}>
          <AuthProvider>
            <AuthReadyGate>
              <RouterProvider router={router} />
            </AuthReadyGate>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

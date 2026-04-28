import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Stack,
  Alert,
  Fade,
  CircularProgress,
} from '@mui/material'
import { useAuth } from '@/auth/AuthProvider'
import { setAccessToken } from '@/lib/axios'
import { NordsharkBrand } from '@/components/NordsharkBrand'
import { showSuccess, showError } from '@/lib/toast'
import { useRegisterCompany } from '@/api/companies'
import { useLogin } from '@/api/auth'

export const Route = createFileRoute('/register')({
  component: RegisterRoute,
})

function RegisterRoute() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const registerMutation = useRegisterCompany()
  const loginMutation = useLogin()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get('companyName') || '').trim()
    const adminEmail = String(f.get('email') || '').trim()
    const adminPassword = String(f.get('password') || '')
    const confirm = String(f.get('confirmPassword') || '')

    if (adminPassword !== confirm) {
      showError('Passwords do not match.')
      return
    }

    try {
      const data = await registerMutation.mutateAsync({ name, adminEmail, adminPassword })
      try {
        const loginData = await loginMutation.mutateAsync({ email: adminEmail, password: adminPassword })
        setAccessToken(loginData.token)
        login(loginData.token)
      } catch {
        setAccessToken(data.token)
        login(data.token)
      }
      showSuccess('Your workspace is ready — welcome!')
      navigate({ to: '/dashboard' })
    } catch (err: any) {
      const d = err?.response?.data
      let msg = 'Could not create company. Try a different name or email.'
      if (typeof d === 'string') msg = d
      else if (d?.title && typeof d.title === 'string') msg = d.title
      else if (d?.detail && typeof d.detail === 'string') msg = d.detail
      showError(msg)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        background: 'linear-gradient(135deg, #f8f9fa 0%,rgb(156, 150, 156) 100%)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          bottom: '3%',
          left: '2%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <NordsharkBrand size="large" />
      </Box>
      <Box
        sx={{
          animation: 'slideUpFromBottom 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          '@keyframes slideUpFromBottom': {
            '0%': { transform: 'translateY(100px)', opacity: 0 },
            '100%': { transform: 'translateY(0)', opacity: 1 },
          },
        }}
      >
        <Paper
          sx={{
            p: { xs: 4, sm: 5, md: 6 },
            width: '100%',
            maxWidth: 480,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: `
              0 20px 40px rgba(0, 0, 0, 0.1),
              0 0 0 1px rgba(255, 255, 255, 0.05),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
            position: 'relative',
            zIndex: 1,
            borderRadius: 4,
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            },
          }}
        >
          <Fade in timeout={800}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  fontSize: { xs: '1.6rem', sm: '2rem' },
                  color: 'transparent',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Create your workspace
              </Typography>
              <Typography variant="body1" sx={{ color: '#666666', opacity: 0.9 }}>
                Register a company and your admin account
              </Typography>
            </Box>
          </Fade>

          <Box component="form" onSubmit={onSubmit}>
            {registerMutation.isError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                Something went wrong. Check the fields and try again.
              </Alert>
            )}

            <Stack spacing={2.5}>
              <TextField
                name="companyName"
                label="Company name"
                fullWidth
                required
                autoComplete="organization"
                sx={textFieldSx}
              />
              <TextField
                name="email"
                label="Admin email"
                type="email"
                fullWidth
                required
                autoComplete="email"
                sx={textFieldSx}
              />
              <TextField
                name="password"
                label="Password"
                type="password"
                fullWidth
                required
                autoComplete="new-password"
                sx={textFieldSx}
              />
              <TextField
                name="confirmPassword"
                label="Confirm password"
                type="password"
                fullWidth
                required
                autoComplete="new-password"
                sx={textFieldSx}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={registerMutation.isPending || loginMutation.isPending}
                sx={{
                  mt: 1,
                  py: 1.25,
                  borderRadius: 3,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                  },
                }}
              >
                {registerMutation.isPending || loginMutation.isPending ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Create company'
                )}
              </Button>
            </Stack>
          </Box>

          <Fade in timeout={1200}>
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#666666' }}>
                <Link
                  to="/login"
                  style={{
                    textDecoration: 'none',
                    color: '#667eea',
                    fontWeight: 600,
                  }}
                >
                  Already have an account? Sign in
                </Link>
              </Typography>
            </Box>
          </Fade>
        </Paper>
      </Box>
    </Box>
  )
}

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 3,
  },
} as const

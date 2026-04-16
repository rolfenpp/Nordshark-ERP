import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Box, Button, Paper, TextField, Typography, Stack, Alert, Fade, CircularProgress } from '@mui/material'
import { Google } from '@mui/icons-material'
import { useAuth } from '../auth/AuthProvider'
import { setAccessToken } from '../lib/axios'
import { NordsharkBrand } from '../components/NordsharkBrand'
import { showSuccess, showError } from '../lib/toast'
import { useLogin } from '../api/auth'
import { CONFIG } from '../config'

export const Route = createFileRoute('/login')({
  component: LoginRoute,
})

function LoginRoute() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const loginMutation = useLogin()
  
  const demoEmail = 'guest@nordshark.com'
  const demoPassword = 'Password123!'

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const f = new FormData(e.currentTarget)
    const email = String(f.get('email') || '')
    const password = String(f.get('password') || '')

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          setAccessToken(data.token)
          try { (login as any)?.(data.token) } catch { }
          showSuccess('Welcome back! 👋')
          navigate({ to: '/dashboard' })
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data || 'Invalid email or password'
          showError(errorMessage)
        },
      }
    )
  }

  function handleGoogleLogin() {
    const apiBase = CONFIG.apiBaseUrl
    const returnUrl = `${window.location.origin}/auth/callback`
    window.location.href = `${apiBase}/Account/google?returnUrl=${encodeURIComponent(returnUrl)}`
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
          pointerEvents: 'none'
        }}
      >
        <NordsharkBrand size="large" showSubtitle={false} />
      </Box>
      <Box
        sx={{
          animation: 'slideUpFromBottom 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          '@keyframes slideUpFromBottom': {
            '0%': {
              transform: 'translateY(100px)',
              opacity: 0,
            },
            '100%': {
              transform: 'translateY(0)',
              opacity: 1,
            },
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
        <Fade in={true} timeout={1000}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                mb: 2, 
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                color: 'transparent',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                backgroundSize: '200% 200%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'textShine 3s ease-in-out infinite',
                '@keyframes textShine': {
                  '0%': {
                    backgroundPosition: '0% 50%',
                  },
                  '50%': {
                    backgroundPosition: '100% 50%',
                  },
                  '100%': {
                    backgroundPosition: '0% 50%',
                  },
                },
              }}
            >
              Welcome Back
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#666666', 
                fontSize: '1.1rem',
                opacity: 0.8,
                fontWeight: 400,
              }}
            >
              Sign in to your Nordshark ERP account
            </Typography>
          </Box>
        </Fade>

        <Box component="form" onSubmit={onSubmit} sx={{ mb: 3 }}>
          {loginMutation.error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                '& .MuiAlert-icon': { fontSize: '1.5rem' }
              }}
            >
              Login failed
            </Alert>
          )}

          <Stack spacing={3}>
            <Fade in={true} timeout={1200}>
              <TextField 
                name="email" 
                label="Email Address" 
                type="email" 
                fullWidth 
                required
                variant="outlined"
                defaultValue={demoEmail}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3) !important',
                    borderRadius: 3,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: 'rgba(102, 126, 234, 0.5) !important',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)',
                    },
                    '&.Mui-focused': {
                      borderColor: '#667eea !important',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      boxShadow: '0 12px 30px rgba(102, 126, 234, 0.25)',
                    },
                    '& fieldset': {
                      border: '1px solid rgba(255, 255, 255, 0.3) !important',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(102, 126, 234, 0.5) !important',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea !important',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#666666',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    padding: '0 8px',
                    borderRadius: 2,
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: '#667eea',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    },
                    '&.MuiInputLabel-shrink': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    color: '#212121',
                    fontWeight: 500,
                    fontSize: '1rem',
                  },
                }}
              />
            </Fade>
            <Fade in={true} timeout={1400}>
              <TextField 
                name="password" 
                label="Password" 
                type="password" 
                fullWidth 
                required
                variant="outlined"
                defaultValue={demoPassword}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3) !important',
                    borderRadius: 3,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: 'rgba(102, 126, 234, 0.5) !important',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)',
                    },
                    '&.Mui-focused': {
                      borderColor: '#667eea !important',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      boxShadow: '0 12px 30px rgba(102, 126, 234, 0.25)',
                    },
                    '& fieldset': {
                      border: '1px solid rgba(255, 255, 255, 0.3) !important',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(102, 126, 234, 0.5) !important',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea !important',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#666666',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    padding: '0 8px',
                    borderRadius: 2,
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: '#667eea',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    },
                    '&.MuiInputLabel-shrink': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    color: '#212121',
                    fontWeight: 500,
                    fontSize: '1rem',
                  },
                }}
              />
            </Fade>
            
            <Fade in={true} timeout={1600}>
              <Button 
                type="submit" 
                variant="contained" 
                size="large" 
                disabled={loginMutation.isPending}
                startIcon={loginMutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{
                  py: 2,
                  px: 4,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                  color: '#ffffff',
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    transform: 'none',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.5)',
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 50%, #ec4899 100%)',
                  },
                  '&:disabled': {
                    color: '#ffffff',
                    opacity: 0.7,
                    transform: 'none',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                    transition: 'left 0.5s',
                  },
                  '&:hover::before': {
                    left: '100%',
                  },
                }}
              >
                {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
              </Button>
            </Fade>
          </Stack>
        </Box>

        <Fade in={true} timeout={1800}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Box sx={{ 
              flex: 1, 
              height: 1, 
              background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent)',
              borderRadius: 1,
            }} />
            <Typography sx={{ 
              px: 3, 
              color: '#666666', 
              fontSize: '0.9rem',
              fontWeight: 500,
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: 2,
              py: 0.5,
            }}>
              or
            </Typography>
            <Box sx={{ 
              flex: 1, 
              height: 1, 
              background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent)',
              borderRadius: 1,
            }} />
          </Box>
        </Fade>

        <Fade in={true} timeout={2000}>
          <Button 
            variant="outlined" 
            onClick={handleGoogleLogin}
            fullWidth
            startIcon={<Google sx={{ fontSize: '1.2rem' }} />}
            sx={{
              py: 1.8,
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '1rem',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: '#212121',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'none',
                borderColor: 'rgba(102, 126, 234, 0.5)',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            Continue with Google
          </Button>
        </Fade>

        <Fade in={true} timeout={2200}>
          <Box sx={{ mt: 5, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#666666', mb: 2 }}>
              <Link 
                to="/register" 
                style={{ 
                  textDecoration: 'none',
                  color: '#666666',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  display: 'inline-block',
                  background: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#667eea';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#666666';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Don't have an account?
              </Link>
            </Typography>
          </Box>
        </Fade>
      </Paper>
      </Box>
    </Box>
  )
}

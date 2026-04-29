import {
  Link,
  Navigate,
  redirect,
  useNavigate,
  createFileRoute,
} from '@tanstack/react-router'
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useEffect, useId, useRef } from 'react'
import { useAuth } from '@/auth/AuthProvider'
import { NordsharkBrand } from '@/components/NordsharkBrand'
import { AppToastContainer } from '@/components/AppToastContainer'
import { AuthLandingLayout } from '@/components/AuthLandingLayout'
import { showSuccess, showError } from '@/lib/toast'
import { formatRegisterMutationError } from '@/lib/authApiErrors'
import { DEFAULT_AFTER_AUTH, getSafeRedirectPath } from '@/lib/authRedirect'
import { getStoredToken } from '@/lib/axios'
import { useRegisterCompany } from '@/api/companies'
import { useLogin } from '@/api/auth'
import { colors } from '@/theme/theme'
import {
  authLandingAlertErrorSx,
  authLandingDarkUnderlineSx,
  authLandingFooterLinkButtonSx,
  authLandingPrimarySubmitSx,
} from '@/theme/authLanding.styles'

export const Route = createFileRoute('/register')({
  validateSearch: (raw: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof raw.redirect === 'string' ? raw.redirect : undefined,
  }),
  beforeLoad: ({ search }) => {
    if (getStoredToken()) {
      throw redirect({
        to: getSafeRedirectPath(search.redirect ?? undefined),
      })
    }
  },
  component: RegisterRoute,
})

function basicRegisterClientValid(
  name: string,
  email: string,
  password: string,
): string | null {
  if (!name.trim()) return 'Enter your company name.'
  const em = email.trim()
  if (!em) return 'Enter your admin email.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return 'Enter a valid email address.'
  if (!password) return 'Enter a password.'
  return null
}

function RegisterRoute() {
  const { login, ready, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const registerMutation = useRegisterCompany()
  const loginMutation = useLogin()
  const search = Route.useSearch()
  const postAuthTarget = getSafeRedirectPath(search.redirect, DEFAULT_AFTER_AUTH)
  const errId = useId()
  const alertRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!registerMutation.isError || !alertRef.current) return
    const el = alertRef.current.querySelector(
      '[class*="MuiAlert-message"], .MuiAlert-message',
    ) as HTMLElement | null
    el?.focus?.()
  }, [registerMutation.isError])

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get('companyName') || '').trim()
    const adminEmail = String(f.get('email') || '').trim()
    const adminPassword = String(f.get('password') || '')
    const confirm = String(f.get('confirmPassword') || '')

    const basicErr = basicRegisterClientValid(name, adminEmail, adminPassword)
    if (basicErr) {
      showError(basicErr)
      return
    }

    if (adminPassword !== confirm) {
      showError('Passwords do not match.')
      return
    }

    registerMutation.mutate(
      { name, adminEmail, adminPassword },
      {
        async onSuccess(data) {
          try {
            const loginData = await loginMutation.mutateAsync({
              email: adminEmail,
              password: adminPassword,
            })
            login(loginData.token)
          } catch {
            login(data.token)
          }
          navigate({ replace: true, to: postAuthTarget })
          window.setTimeout(
            () => showSuccess('Your workspace is ready — welcome!'),
            0,
          )
        },
      },
    )
  }

  if (ready && isAuthenticated) {
    return <Navigate replace to={postAuthTarget} />
  }

  return (
    <>
      <AppToastContainer />
      <AuthLandingLayout contentMaxWidth={460}>
        <Stack
          component="section"
          aria-label="Create workspace"
          aria-labelledby="register-heading"
          spacing={3.25}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: { xs: 'center', md: 'flex-start' },
            }}
          >
            <Box sx={{ lineHeight: 0, '& svg': { display: 'block' } }}>
              <NordsharkBrand size="medium" variant="onDark" />
            </Box>
          </Box>

          <Box>
            <Typography
              id="register-heading"
              component="h1"
              variant="h5"
              sx={{
                fontWeight: 600,
                color: colors.text.primary,
                fontSize: { xs: '1.35rem', sm: '1.5rem' },
                letterSpacing: '-0.02em',
                mb: 0.75,
              }}
            >
              Create your workspace
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: colors.text.secondary, lineHeight: 1.5 }}
            >
              Register a company and your admin account
            </Typography>
          </Box>

          <Box component="form" onSubmit={onSubmit}>
            {registerMutation.isError && (
              <Alert
                ref={alertRef}
                id={errId}
                severity="error"
                role="alert"
                aria-live="assertive"
                tabIndex={-1}
                sx={{ ...authLandingAlertErrorSx, mb: 2.5 }}
              >
                {formatRegisterMutationError(registerMutation.error)}
              </Alert>
            )}

            <Stack spacing={2.65}>
              <TextField
                name="companyName"
                placeholder="Company name"
                fullWidth
                required
                autoComplete="organization"
                variant="standard"
                inputProps={{
                  'aria-label': 'Company name',
                  'aria-describedby': registerMutation.isError ? errId : undefined,
                }}
                sx={authLandingDarkUnderlineSx}
              />
              <TextField
                name="email"
                placeholder="Admin email"
                type="email"
                fullWidth
                required
                autoComplete="email"
                variant="standard"
                inputMode="email"
                inputProps={{
                  'aria-label': 'Admin email',
                  'aria-describedby': registerMutation.isError ? errId : undefined,
                }}
                sx={authLandingDarkUnderlineSx}
              />
              <TextField
                name="password"
                placeholder="Password"
                type="password"
                fullWidth
                required
                autoComplete="new-password"
                variant="standard"
                inputProps={{
                  'aria-label': 'Password',
                  'aria-describedby': registerMutation.isError ? errId : undefined,
                }}
                sx={authLandingDarkUnderlineSx}
              />
              <TextField
                name="confirmPassword"
                placeholder="Confirm password"
                type="password"
                fullWidth
                required
                autoComplete="new-password"
                variant="standard"
                inputProps={{
                  'aria-label': 'Confirm password',
                  'aria-describedby': registerMutation.isError ? errId : undefined,
                }}
                sx={authLandingDarkUnderlineSx}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disableElevation
                disabled={registerMutation.isPending || loginMutation.isPending}
                aria-busy={registerMutation.isPending || loginMutation.isPending}
                startIcon={
                  registerMutation.isPending || loginMutation.isPending ? (
                    <CircularProgress size={22} color="inherit" aria-hidden />
                  ) : undefined
                }
                sx={authLandingPrimarySubmitSx}
              >
                {registerMutation.isPending || loginMutation.isPending
                  ? 'Creating…'
                  : 'Create company'}
              </Button>
            </Stack>
          </Box>

          <Box sx={{ textAlign: 'center', pt: 1 }}>
            <Link
              to="/login"
              {...(search.redirect ? { search: { redirect: search.redirect } } : {})}
              style={{ textDecoration: 'none' }}
            >
              <Button component="span" variant="text" sx={authLandingFooterLinkButtonSx}>
                Already have an account? Sign in
              </Button>
            </Link>
          </Box>
        </Stack>
      </AuthLandingLayout>
    </>
  )
}

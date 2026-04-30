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
import { Google } from '@mui/icons-material'
import { useEffect, useId, useRef } from 'react'
import { useAuth } from '@/auth/AuthProvider'
import { NordsharkBrand } from '@/components/NordsharkBrand'
import { AppToastContainer } from '@/components/AppToastContainer'
import { AuthLandingLayout } from '@/components/AuthLandingLayout'
import { showSuccess } from '@/lib/toast'
import {
  loginUnreachableMessage,
  formatLoginMutationError,
} from '@/lib/authApiErrors'
import { DEFAULT_AFTER_AUTH, getSafeRedirectPath } from '@/lib/authRedirect'
import { getStoredToken } from '@/lib/axios'
import { useLogin } from '@/api/auth'
import { API_ROOT } from '@/config'
import { loginRequestSchema } from '@/schemas/auth'
import { showZodError } from '@/lib/zodToast'
import {
  authLandingAlertErrorSx,
  authLandingDarkUnderlineSx,
  authLandingFooterLinkButtonSx,
  authLandingGoogleOutlinedButtonSx,
  authLandingMutedDividerCaptionSx,
  authLandingPrimarySubmitSx,
} from '@/theme/authLanding.styles'

const demoEmail = 'guest@nordshark.com'
const demoPassword = 'Password123!'

export const Route = createFileRoute('/login')({
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
  component: LoginRoute,
})

function LoginRoute() {
  const { login: setAuthToken, ready, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const search = Route.useSearch()
  const postAuthTarget = getSafeRedirectPath(search.redirect, DEFAULT_AFTER_AUTH)
  const errId = useId()
  const alertRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!loginMutation.isError || !alertRef.current) return
    const el = alertRef.current.querySelector(
      '[class*="MuiAlert-message"], .MuiAlert-message',
    ) as HTMLElement | null
    el?.focus?.()
  }, [loginMutation.isError])

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const f = new FormData(e.currentTarget)
    const email = String(f.get('email') || '')
    const password = String(f.get('password') || '')
    const parsed = loginRequestSchema.safeParse({ email, password })
    if (!parsed.success) {
      showZodError(parsed.error)
      return
    }

    loginMutation.mutate(
      parsed.data,
      {
        onSuccess: (data) => {
          setAuthToken(data.token)
          navigate({
            replace: true,
            to: postAuthTarget,
          })
          window.setTimeout(() => showSuccess('Welcome back!'), 0)
        },
      },
    )
  }

  function handleGoogleLogin() {
    const returnUrl = `${window.location.origin}/auth/callback`
    window.location.href = `${API_ROOT}/account/google?returnUrl=${encodeURIComponent(returnUrl)}`
  }

  if (ready && isAuthenticated) {
    return <Navigate replace to={postAuthTarget} />
  }

  return (
    <>
      <AppToastContainer />
      <AuthLandingLayout contentMaxWidth={400}>
        <Stack component="section" aria-label="Sign in" spacing={3.5}>
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

          <Box component="form" onSubmit={onSubmit}>
            {loginMutation.isError && (
              <Alert
                ref={alertRef}
                id={errId}
                severity="error"
                role="alert"
                aria-live="assertive"
                tabIndex={-1}
                sx={{ ...authLandingAlertErrorSx, mb: 3 }}
              >
                {formatLoginMutationError(
                  loginMutation.error,
                  loginUnreachableMessage(),
                )}
              </Alert>
            )}

            <Stack spacing={3.25}>
              <TextField
                name="email"
                placeholder="Email"
                type="email"
                fullWidth
                required
                variant="standard"
                autoComplete="email"
                inputMode="email"
                defaultValue={demoEmail}
                inputProps={{
                  'aria-describedby': loginMutation.isError ? errId : undefined,
                  'aria-label': 'Email',
                }}
                sx={authLandingDarkUnderlineSx}
              />
              <TextField
                name="password"
                placeholder="Password"
                type="password"
                fullWidth
                required
                variant="standard"
                autoComplete="current-password"
                defaultValue={demoPassword}
                inputProps={{
                  'aria-label': 'Password',
                }}
                sx={authLandingDarkUnderlineSx}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disableElevation
                disabled={loginMutation.isPending}
                aria-busy={loginMutation.isPending}
                startIcon={
                  loginMutation.isPending ? (
                    <CircularProgress size={22} color="inherit" aria-hidden />
                  ) : undefined
                }
                sx={authLandingPrimarySubmitSx}
              >
                {loginMutation.isPending ? 'Signing in' : 'Sign in'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="caption" sx={authLandingMutedDividerCaptionSx}>
            or continue with
          </Typography>

          <Button
            type="button"
            variant="outlined"
            fullWidth
            onClick={handleGoogleLogin}
            aria-label="Continue with Google"
            startIcon={<Google sx={{ opacity: 0.92 }} aria-hidden />}
            sx={authLandingGoogleOutlinedButtonSx}
          >
            Google
          </Button>

          <Box sx={{ textAlign: 'center', pt: 1 }}>
            <Link
              to="/register"
              {...(search.redirect ? { search: { redirect: search.redirect } } : {})}
              style={{ textDecoration: 'none' }}
            >
              <Button component="span" variant="text" sx={authLandingFooterLinkButtonSx}>
                Create a company account
              </Button>
            </Link>
          </Box>
        </Stack>
      </AuthLandingLayout>
    </>
  )
}

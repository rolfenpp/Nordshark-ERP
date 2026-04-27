import { Button, Menu, Typography, Box } from '@mui/material'
import { Diamond } from '@mui/icons-material'
import { useState } from 'react'
import {
  DEFAULT_UPGRADE_TARGET_ID,
  getOrganizationPlan,
  ORGANIZATION_PLANS,
  PLAN_FEATURE_ROWS,
  PLANS_FOR_COMPARISON,
  type OrganizationPlanId,
} from '@/lib/subscriptionPlans'

const BRAND_GRADIENT_ID = 'diamondGradient'

const BRAND_GRADIENT = (
  <linearGradient id={BRAND_GRADIENT_ID} x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stopColor="#667eea" />
    <stop offset="25%" stopColor="#764ba2" />
    <stop offset="50%" stopColor="#f093fb" />
    <stop offset="75%" stopColor="#f5576c" />
    <stop offset="100%" stopColor="#4facfe" />
  </linearGradient>
)

const ACCENT = '#667eea'

function featureCellSx(value: string, isRecommendedColumn: boolean) {
  const muted = value === '–' || value === '-'
  const check = value === '✓'
  return {
    color: muted ? 'text.disabled' : isRecommendedColumn ? ACCENT : 'text.secondary',
    fontWeight: check ? 600 : 400,
    lineHeight: 1.35,
  } as const
}

export function UpgradeButton({ onClick }: { onClick?: () => void }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const businessPlan = ORGANIZATION_PLANS[DEFAULT_UPGRADE_TARGET_ID]

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
    onClick?.()
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handlePlanSelect = (planId: OrganizationPlanId) => {
    console.info('[subscription] Selected organization plan:', planId, getOrganizationPlan(planId))
    handleClose()
  }

  return (
    <>
      <svg width={0} height={0}>
        <defs>{BRAND_GRADIENT}</defs>
      </svg>

      <Button
        variant="outlined"
        aria-label="Organization plans and upgrades"
        startIcon={<Diamond sx={{ fill: `url(#${BRAND_GRADIENT_ID})` }} />}
        onClick={handleClick}
        sx={{
          mr: { xs: 0.5, sm: 2 },
          minWidth: { xs: 44, sm: undefined },
          px: { xs: 1, sm: 2 },
          border: 'none',
          color: 'text.primary',
          background: 'transparent',
          textTransform: 'none',
          position: 'relative',
          borderRadius: '6px',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '6px',
            padding: '2px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            zIndex: -1,
          },
          '&:hover': {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            transform: 'none',
          },
          '@media (max-width: 599.95px)': {
            px: 0,
            py: 0,
            minWidth: 44,
            width: 44,
            height: 44,
            justifyContent: 'center',
            alignItems: 'center',
            '&::before': {
              display: 'none',
            },
            '& .MuiButton-startIcon': {
              margin: 0,
            },
          },
        }}
      >
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          Upgrade
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          '& .MuiPaper-root': {
            minWidth: { xs: 0, sm: 400 },
            maxWidth: { xs: 'calc(100vw - 24px)', sm: 440 },
            width: { xs: '100%', sm: 'auto' },
            mt: 1,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            Grow your organization
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{businessPlan.displayName}</Box>
            {' '}
            <Box component="span" sx={{ color: ACCENT, fontWeight: 600 }}>{businessPlan.pricePrimary}/month</Box>
            {' '}
            per company.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'stretch', px: 3, pb: 2, gap: 1.5 }}>
          <Box sx={{ flex: 1 }} />
          {PLANS_FOR_COMPARISON.map((planId) => {
            const plan = getOrganizationPlan(planId)
            return (
              <Box
                key={planId}
                sx={{
                  width: 100,
                  flexShrink: 0,
                  textAlign: 'center',
                  py: 1,
                  px: 0.5,
                  borderRadius: '8px',
                  ...(plan.recommended
                    ? {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                      }
                    : {
                        border: '1px solid',
                        borderColor: 'divider',
                      }),
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: plan.recommended ? 'common.white' : 'text.primary',
                  }}
                >
                  {plan.shortLabel}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.5,
                    color: plan.recommended ? 'rgba(255,255,255,0.92)' : 'text.secondary',
                    lineHeight: 1.2,
                  }}
                >
                  {plan.pricePrimary}
                </Typography>
              </Box>
            )
          })}
        </Box>

        <Box sx={{ px: 3 }}>
          {PLAN_FEATURE_ROWS.map((row, index) => (
            <Box
              key={row.id}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                py: 1,
                gap: 1.5,
                borderTop: index === 0 ? 'none' : '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" sx={{ flex: 1, fontWeight: 500, color: 'text.primary', pt: 0.5 }}>
                {row.label}
              </Typography>

              {PLANS_FOR_COMPARISON.map((planId) => {
                const plan = getOrganizationPlan(planId)
                const value = row[planId]
                const recommended = plan.recommended
                return (
                  <Box
                    key={planId}
                    sx={{
                      width: 100,
                      flexShrink: 0,
                      textAlign: 'center',
                      borderRadius: '6px',
                      py: 0.5,
                      px: 0.5,
                      backgroundColor: recommended ? 'rgba(102, 126, 234, 0.08)' : 'transparent',
                    }}
                  >
                    <Typography variant="body2" sx={featureCellSx(value, recommended)}>
                      {value}
                    </Typography>
                  </Box>
                )
              })}
            </Box>
          ))}
        </Box>

        <Box sx={{ p: 3, pt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => handlePlanSelect(DEFAULT_UPGRADE_TARGET_ID)}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 600,
              py: 1.5,
              mb: 1,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                boxShadow: 'none',
              },
            }}
          >
            Get {businessPlan.displayName}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={handleClose}
            sx={{
              color: ACCENT,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Maybe later
          </Button>
        </Box>
      </Menu>
    </>
  )
}

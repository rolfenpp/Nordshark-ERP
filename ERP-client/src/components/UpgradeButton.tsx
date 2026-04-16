import { Button, Menu, Typography, Box } from '@mui/material'
import { Diamond } from '@mui/icons-material'
import { useState } from 'react'

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

const upgradePlans = {
  basic: {
    name: 'Basic',
    price: 'Free',
    featured: false
  },
  pro: {
    name: 'Pro',
    price: '$9',
    featured: true
  }
}

const features = [
  { name: 'Users', basic: '5', pro: '50' },
  { name: 'Storage', basic: '1 GB', pro: '100 GB' },
  { name: 'Invoices per month', basic: '10', pro: 'Unlimited' },
  { name: 'Email support', basic: '✓', pro: '✓' },
  { name: 'Advanced reporting', basic: '–', pro: '✓' },
  { name: 'Custom integrations', basic: '–', pro: '✓' }
]

export function UpgradeButton({ onClick }: { onClick?: () => void }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
    onClick?.()
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handlePlanSelect = (planName: string) => {
    console.log(`Selected plan: ${planName}`)
    handleClose()
  }

  return (
    <>
      <svg width={0} height={0}>
        <defs>{BRAND_GRADIENT}</defs>
      </svg>

      <Button
        variant="outlined"
        startIcon={
          <Diamond sx={{ fill: `url(#${BRAND_GRADIENT_ID})` }} />
        }
        onClick={handleClick}
        sx={{
          mr: 2,
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
            zIndex: -1
          },
          '&:hover': {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            transform: 'none'
          }
        }}
      >
        Upgrade
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          '& .MuiPaper-root': {
            minWidth: 340,
            mt: 1,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            Upgrade your productivity
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            for <Box component="span" sx={{ color: '#667eea', fontWeight: 600 }}>$9</Box> with Pro
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', px: 3, pb: 2 }}>
          <Box sx={{ flex: 1 }} />
          <Box sx={{ 
            width: 80, 
            textAlign: 'center',
            mr: 2,
            py: 1
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {upgradePlans.basic.name}
            </Typography>
          </Box>
          <Box sx={{ 
            width: 80, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px',
            py: 1,
            px: 1,
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
              {upgradePlans.pro.name}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ px: 3 }}>
          {features.map((feature, index) => (
            <Box key={feature.name} sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              py: 1,
              borderTop: index === 0 ? 'none' : '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="body2" sx={{ 
                flex: 1, 
                fontWeight: 500,
                color: 'text.primary'
              }}>
                {feature.name}
              </Typography>
              
              <Box sx={{ 
                width: 80, 
                textAlign: 'center',
                mr: 2
              }}>
                <Typography variant="body2" sx={{ 
                  color: feature.basic === '–' ? 'text.disabled' : 'text.secondary',
                  fontWeight: feature.basic === '✓' ? 600 : 400
                }}>
                  {feature.basic}
                </Typography>
              </Box>
              
              <Box sx={{ 
                width: 80, 
                textAlign: 'center',
                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                borderRadius: '6px',
                py: 0.5
              }}>
                <Typography variant="body2" sx={{ 
                  color: feature.pro === '–' ? 'text.disabled' : '#667eea',
                  fontWeight: feature.pro === '✓' ? 600 : 500
                }}>
                  {feature.pro}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ p: 3, pt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => handlePlanSelect('Professional')}
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
                boxShadow: 'none'
              }
            }}
          >
            Get Pro
          </Button>
          
          <Button
            fullWidth
            variant="text"
            onClick={handleClose}
            sx={{
              color: '#667eea',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Maybe later
          </Button>
        </Box>
      </Menu>
    </>
  )
}

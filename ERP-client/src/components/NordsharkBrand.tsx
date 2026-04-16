import { Box, Typography, useTheme } from '@mui/material'
import { Terrain } from '@mui/icons-material'

interface NordsharkBrandProps {
  showSubtitle?: boolean
  size?: 'small' | 'medium' | 'large'
  themeToggle?: boolean
}

export function NordsharkBrand({ size = 'medium', themeToggle }: NordsharkBrandProps) {
  const theme = useTheme()
  const sizeConfig = {
    small: { logo: 28, text: '1.1rem', subtitle: '0.6rem' },
    medium: { logo: 36, text: '1.4rem', subtitle: '0.7rem' },
    large: { logo: 44, text: '1.7rem', subtitle: '0.8rem' }
  }

  const config = sizeConfig[size]
  
  const multiColorGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)'
  
  const textColor = themeToggle ? theme.palette.text.primary : '#212121'
  const logoBackground = multiColorGradient
  const sharkTextColor = multiColorGradient

  return (
    <>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          '&:hover': {
            '& .brand-text': {
              background: multiColorGradient,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              transition: 'all 0.3s ease'
            }
          }
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: config.logo,
            height: config.logo,
            clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
            background: logoBackground,
            mr: 1.5,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <Terrain 
            sx={{ 
              fontSize: config.logo * 0.7,
              color: 'white'
            }} 
          />
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            className="brand-text"
            sx={{ 
              fontWeight: 800,
              fontSize: config.text,
              letterSpacing: '-0.8px',
              color: textColor,
              transition: 'all 0.3s ease',
              lineHeight: 1.1
            }}
          >
            Nord
            <Typography 
              component="span" 
              sx={{ 
                fontWeight: 800,
                background: sharkTextColor,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: config.text
              }}
            >
              shark
            </Typography>
          </Typography>
        </Box>
      </Box>
    </>
  )
}

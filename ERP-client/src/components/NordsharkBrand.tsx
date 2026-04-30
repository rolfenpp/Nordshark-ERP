import { Box, Typography } from '@mui/material'
import { colors } from '@/theme/theme'

interface NordsharkBrandProps {
  size?: 'small' | 'medium' | 'large'
  variant?: 'onDark' | 'onLight'
}

export function NordsharkBrand({ size = 'medium', variant = 'onLight' }: NordsharkBrandProps) {
  const sizeConfig = {
    small: { text: '1.1rem' },
    medium: { text: '1.4rem' },
    large: { text: '1.7rem' },
  }

  const config = sizeConfig[size]

  const brandGradient = `linear-gradient(135deg, ${colors.primary[700]} 0%, ${colors.primary[500]} 45%, ${colors.primary[300]} 100%)`

  const textColor = variant === 'onDark' ? colors.text.primary : colors.light.textPrimary
  const wordWeight = 400
  const erpWeight = 200

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        '&:hover .brand-nord': {
          background: brandGradient,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          transition: 'color 0.3s ease',
        },
        '&:hover .brand-shark': {
          filter: 'brightness(1.08)',
          transition: 'filter 0.3s ease',
        },
      }}
    >
      <Typography
        variant="h6"
        noWrap
        component="div"
        sx={{
          fontSize: config.text,
          letterSpacing: '-0.8px',
          lineHeight: 1.1,
        }}
      >
        <Box
          component="span"
          className="brand-nord"
          sx={{
            fontWeight: wordWeight,
            color: textColor,
            transition: 'color 0.3s ease',
          }}
        >
          Nord
        </Box>
        <Typography
          component="span"
          className="brand-shark"
          sx={{
            fontWeight: wordWeight,
            background: brandGradient,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: 'inherit',
            transition: 'filter 0.3s ease',
          }}
        >
          shark
        </Typography>
        {' '}
        <Box component="span" sx={{ fontWeight: erpWeight, color: textColor }}>
          ERP
        </Box>
      </Typography>
    </Box>
  )
}

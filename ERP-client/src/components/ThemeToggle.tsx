import React from 'react'
import { IconButton, Tooltip, Box } from '@mui/material'
import { useTheme } from '@/theme/ThemeProvider'
import { colors } from '@/theme/theme'

export const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme } = useTheme()
  
  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          color: mode === 'light' ? colors.text.primary : colors.text.primary,
          backgroundColor: mode === 'light' ? colors.background.tertiary : colors.background.tertiary,
          '&:hover': {
            backgroundColor: mode === 'light' ? colors.interactive.hover : colors.interactive.hover,
            transform: 'scale(1.05)',
          },
          transition: 'all 0.2s ease',
          width: 40,
          height: 40,
        }}
      >
        {mode === 'light' ? '🌙' : '☀️'}
      </IconButton>
    </Tooltip>
  )
}

export const ThemeToggleStyled: React.FC = () => {
  const { mode, toggleTheme } = useTheme()
  
  return (
    <Box
      onClick={toggleTheme}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: 48,
        borderRadius: '50%',
        cursor: 'pointer',
        background: (theme) => mode === 'light' 
          ? theme.designTokens.gradients.brand
          : theme.designTokens.gradients.secondary || theme.designTokens.gradients.primary,
        boxShadow: mode === 'light'
          ? '0 4px 16px rgba(102, 126, 234, 0.3)'
          : '0 4px 16px rgba(255, 215, 0, 0.3)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.1) rotate(180deg)',
          boxShadow: mode === 'light'
            ? '0 6px 20px rgba(102, 126, 234, 0.4)'
            : '0 6px 20px rgba(33, 150, 243, 0.35)',
        },
        fontSize: '1.5rem',
        color: '#FFFFFF',
        fontWeight: 'bold',
      }}
    >
      {mode === 'light' ? '🌙' : '☀️'}
    </Box>
  )
}

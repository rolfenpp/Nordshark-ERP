import React, { createContext, useContext, useState, useEffect } from 'react'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { darkThemeOptions, colors, typography, borderRadius, transitions, designTokens } from './theme'

// Theme context
interface ThemeContextType {
  mode: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (mode: 'light' | 'dark') => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Light theme options (optimized for dashboard)
const createLightTheme = () => {
  const t = createTheme({
    palette: {
      mode: 'light',
      
      // Primary colors
      primary: {
        main: colors.primary[600],
        light: colors.primary[400],
        dark: colors.primary[800],
        contrastText: '#FFFFFF',
      },
      
      // Secondary colors (teal/emerald accent for light mode)
      secondary: {
        main: colors.accent.indigo,
        light: colors.accent.blueLight,
        dark: colors.primary[700],
        contrastText: '#FFFFFF',
      },
      
      // Status colors
      success: {
        main: colors.status.success,
        light: colors.status.successLight,
        dark: colors.status.success,
        contrastText: '#FFFFFF',
      },
      warning: {
        main: colors.status.warning,
        light: colors.status.warningLight,
        dark: colors.status.warning,
        contrastText: '#FFFFFF',
      },
      error: {
        main: colors.status.error,
        light: colors.status.errorLight,
        dark: colors.status.error,
        contrastText: '#FFFFFF',
      },
      info: {
        main: colors.status.info,
        light: colors.status.infoLight,
        dark: colors.status.info,
        contrastText: '#FFFFFF',
      },
      
      // Background colors (softened light theme)
      background: {
        default: '#E8EDF2',
        paper: '#FFFFFF',
      },
      
      // Text colors (clean light theme)
      text: {
        primary: '#1A1A2E',
        secondary: '#4A4A6A',
        disabled: '#8A8AA3',
      },
      
      // Divider (subtle)
      divider: '#E6E8EF',
      
      // Action colors
      action: {
        active: colors.interactive.active,
        hover: colors.interactive.hover,
        selected: colors.interactive.selected,
        disabled: '#8A8AA3',
        disabledBackground: '#F5F5F5',
      },
    },
    
    // Clean light theme shadows
    shadows: [
      'none',
      '0 1px 2px rgba(0, 0, 0, 0.06)',
      '0 2px 4px rgba(0, 0, 0, 0.08)',
      '0 4px 8px rgba(0, 0, 0, 0.12)',
      '0 8px 16px rgba(0, 0, 0, 0.16)',
      '0 16px 32px rgba(0, 0, 0, 0.20)',
      ...Array(19).fill('none'),
    ] as any,
    
    // Typography
    typography: {
      fontFamily: typography.fontFamily,
      h1: typography.h1,
      h2: typography.h2,
      h3: typography.h3,
      h4: typography.h4,
      h5: typography.h5,
      h6: typography.h6,
      body1: typography.body1,
      body2: typography.body2,
      caption: typography.caption,
      overline: typography.overline,
      button: typography.button,
    },
    
    // Spacing
    spacing: 8,
    
    // Shape
    shape: {
      borderRadius: parseInt(borderRadius.md),
    },
    
    // Clean light theme components
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.md,
            textTransform: 'none',
            fontWeight: 600,
            transition: transitions.normal,
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: colors.shadows.buttonHover,
            },
          },
          contained: {
            background: colors.gradients.primary,
            boxShadow: colors.shadows.button,
            '&:hover': {
              background: colors.gradients.secondary,
              boxShadow: colors.shadows.buttonHover,
            },
          },
          outlined: {
            borderColor: '#E1E5E9',
            color: '#1A1A2E',
            '&:hover': {
              borderColor: colors.primary[600],
              backgroundColor: colors.interactive.hover,
            },
          },
        },
      },
      
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: '#FFFFFF',
            borderRadius: borderRadius.lg,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
            border: '1px solid #E9EEF5',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            },
          },
        },
      },
      
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: '#FFFFFF',
            borderRadius: borderRadius.lg,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
            border: '1px solid #E9EEF5',
          },
        },
      },
      
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#FFFFFF',
              borderRadius: borderRadius.md,
              border: '1px solid #E1E5E9',
              '&:hover': {
                borderColor: colors.primary[400],
              },
              '&.Mui-focused': {
                borderColor: colors.primary[600],
                borderWidth: '2px',
                boxShadow: '0 0 0 3px rgba(20, 241, 149, 0.10)',
              },
            },
          },
        },
      },
      
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#FFFFFF',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
            borderBottom: '1px solid #E6E8EF',
            borderRadius: 0,
          },
        },
      },
      
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: '#FFFFFF',
            borderRight: '1px solid #E6E8EF',
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.08)',
            borderRadius: 0,
          },
        },
      },
      
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: '#E6E8EF',
          },
        },
      },
      
      MuiList: {
        styleOverrides: {
          root: {
            padding: 0,
            '& .MuiListItem-root': {
              padding: 0,
              margin: 0,
            },
          },
        },
      },
      
      MuiListItemButton: {
        styleOverrides: {
          root: {
            padding: '12px 16px',
            borderRadius: 0,
            '&:hover': {
              backgroundColor: colors.interactive.hover,
            },
            '&.Mui-selected': {
              backgroundColor: colors.interactive.selected,
              '&:hover': {
                backgroundColor: colors.interactive.active,
              },
            },
          },
        },
      },

      // Table styling for light theme
      MuiTableHead: {
        styleOverrides: {
          root: ({ theme }) => ({
            '& .MuiTableCell-root': {
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              fontWeight: 600,
              borderBottom: `1px solid ${theme.palette.divider}`,
              '&.MuiTableCell-stickyHeader': {
                backgroundColor: theme.palette.background.paper,
                zIndex: 3,
              },
            },
          }),
        },
      },

      // Table cell styling for light theme
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid #E6E8EF`,
          },
          head: {
            textTransform: 'none',
            letterSpacing: '0.02em',
          },
        },
      },

    },
    designTokens,
  })
  return t
}

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  
  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    if (savedTheme) {
      setMode(savedTheme)
    }
  }, [])
  
  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('theme', mode)
  }, [mode])
  
  const toggleTheme = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light')
  }
  
  const setTheme = (newMode: 'light' | 'dark') => {
    setMode(newMode)
  }
  
  // Create theme based on current mode
  const theme = mode === 'light' 
    ? createLightTheme() 
    : createTheme({ ...darkThemeOptions, designTokens })
  
  const contextValue: ThemeContextType = {
    mode,
    toggleTheme,
    setTheme,
  }
  
  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}

// Hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

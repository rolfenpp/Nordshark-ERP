import { createTheme, type ThemeOptions } from '@mui/material/styles'

export const colors = {
  // Neon-blue primary scale suited for dark UI
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Accents aligned with trading dashboard aesthetic
  accent: {
    blue: '#3b82f6',
    blueLight: '#60a5fa',
    blueDark: '#1d4ed8',
    indigo: '#6366f1',
    cyan: '#22D3EE',
  },

  // Deep, cool-neutral backgrounds
  background: {
    primary: '#0b0f10',
    secondary: '#0f1417',
    tertiary: '#11181c',
    card: '#121a1f',
    elevated: '#172126',
    overlay: 'rgba(11, 15, 16, 0.8)',
  },

  surface: {
    primary: '#121a1f',
    secondary: '#172126',
    tertiary: '#1a232a',
    border: '#1f2a30',
    divider: '#26343a',
  },

  text: {
    primary: '#E6F1F3',
    secondary: '#9BA6B2',
    tertiary: '#6B7785',
    disabled: '#4B5563',
    inverse: '#0b0f10',
  },

  status: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#22D3EE',
    successLight: '#4ADE80',
    warningLight: '#FBBF24',
    errorLight: '#F87171',
    infoLight: '#67E8F9',
  },

  chart: {
    blue: '#3b82f6',
    blueLight: '#60a5fa',
    indigo: '#6366f1',
    cyan: '#22D3EE',
    red: '#EF4444',
    orange: '#F59E0B',
    yellow: '#FDE047',
    purple: '#9b5de5',
  },

  interactive: {
    hover: 'rgba(59, 130, 246, 0.06)',
    active: 'rgba(59, 130, 246, 0.12)',
    focus: 'rgba(59, 130, 246, 0.16)',
    selected: 'rgba(59, 130, 246, 0.24)',
  },

  shadows: {
    card: '0 4px 20px rgba(0, 0, 0, 0.35)',
    elevated: '0 8px 32px rgba(0, 0, 0, 0.45)',
    modal: '0 16px 48px rgba(0, 0, 0, 0.55)',
    button: '0 2px 8px rgba(59, 130, 246, 0.25)',
    buttonHover: '0 4px 16px rgba(59, 130, 246, 0.35)',
  },

  gradients: {
    primary: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    secondary: 'linear-gradient(135deg, #6366f1 0%, #1d4ed8 100%)',
    accent: 'linear-gradient(135deg, #22D3EE 0%, #3b82f6 100%)',
    success: 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)',
    brand: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    blueCyan: 'linear-gradient(135deg, #3b82f6 0%, #22D3EE 100%)',
    pinkYellow: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    pinkSoft: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    info: 'linear-gradient(135deg, #22D3EE 0%, #06b6d4 100%)',
    warning: 'linear-gradient(135deg, #F59E0B 0%, #fbbf24 100%)',
    error: 'linear-gradient(135deg, #EF4444 0%, #dc2626 100%)',
  }
}

export const brand = {
  primary: '#3b82f6',
  secondary: '#6366f1',
}

export const gradients = colors.gradients

export const typography = {
  fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  
  display: {
    large: {
      fontSize: '3.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    medium: {
      fontSize: '2.75rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    small: {
      fontSize: '2.25rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
  },

  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
  },
  h6: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
  },

  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: '0.01em',
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: '0.01em',
  },

  caption: {
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0.02em',
  },
  overline: {
    fontSize: '0.625rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
  },

  // Button text
  button: {
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0.02em',
    textTransform: 'none' as const,
  },

  // Special text styles
  kpi: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  metric: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0.02em',
  },
}

export const spacing = {
  xs: '0.25rem',      
  sm: '0.5rem',     
  md: '1rem',      
  lg: '1.5rem',    
  xl: '2rem',      
  xxl: '3rem',     
  xxxl: '4rem',
}

export const borderRadius = {
  none: '0',
  sm: '0.25rem',     
  md: '0.5rem',      
  lg: '0.75rem',     
  xl: '1rem',        
  xxl: '1.5rem',     
  full: '9999px',    
}

export const transitions = {
  fast: 'all 0.15s ease',
  normal: 'all 0.3s ease',
  slow: 'all 0.5s ease',
  bounce: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
}

export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
}

export const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary[500],
      light: colors.primary[400],
      dark: colors.primary[600],
      contrastText: colors.text.inverse,
    },
    
    secondary: {
      main: colors.accent.indigo,
      light: colors.accent.blueLight,
      dark: colors.primary[700],
      contrastText: colors.text.inverse,
    },
    
    success: {
      main: colors.status.success,
      light: colors.status.successLight,
      dark: colors.status.success,
      contrastText: colors.text.inverse,
    },
    warning: {
      main: colors.status.warning,
      light: colors.status.warningLight,
      dark: colors.status.warning,
      contrastText: colors.text.inverse,
    },
    error: {
      main: colors.status.error,
      light: colors.status.errorLight,
      dark: colors.status.error,
      contrastText: colors.text.inverse,
    },
    info: {
      main: colors.status.info,
      light: colors.status.infoLight,
      dark: colors.status.info,
      contrastText: colors.text.inverse,
    },
    
    background: {
      default: colors.background.primary,
      paper: colors.background.secondary,
    },
    
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.disabled,
    },
    
    divider: colors.surface.divider,
    
    action: {
      active: colors.interactive.active,
      hover: colors.interactive.hover,
      selected: colors.interactive.selected,
      disabled: colors.text.disabled,
      disabledBackground: colors.surface.tertiary,
    },
  },

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

  spacing: 8,

 
  shape: {
    borderRadius: parseInt(borderRadius.md),
  },

  
  shadows: [
    'none',
    colors.shadows.card,
    colors.shadows.elevated,
    colors.shadows.modal,
    colors.shadows.button,
    colors.shadows.buttonHover,
    ...Array(19).fill('none'),
  ] as any,

  
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
          },
        },
        outlined: {
          borderColor: colors.surface.border,
          color: colors.text.primary,
          '&:hover': {
            borderColor: colors.primary[500],
            backgroundColor: colors.interactive.hover,
          },
        },
      },
    },
    
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.secondary,
          borderRadius: borderRadius.lg,
          boxShadow: colors.shadows.card,
          border: `1px solid ${colors.surface.border}`,
        },
      },
    },
    
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.secondary,
          borderRadius: borderRadius.lg,
        },
      },
    },
    
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: colors.background.tertiary,
            borderRadius: borderRadius.md,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary[500],
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary[500],
              borderWidth: '2px',
            },
          },
        },
      },
    },
    
      MuiAppBar: {
        defaultProps: {
          color: 'default',
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundColor: colors.background.secondary,
            boxShadow: colors.shadows.card,
            borderRadius: 0,
          },
          colorDefault: {
            backgroundColor: colors.background.secondary,
          },
        },
      },
    
          MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: colors.background.secondary,
            borderRight: `1px solid ${colors.surface.border}`,
            borderRadius: 0,
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

      // Global table styles for consistent appearance across routes
      MuiTable: {
        defaultProps: {
          stickyHeader: true,
          size: 'medium',
        } as any,
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
          },
        },
      },
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
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${colors.surface.divider}`,
          },
          head: {
            textTransform: 'none',
            letterSpacing: '0.02em',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
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
  },
}

export const theme = createTheme(darkThemeOptions)

export const designTokens = {
  colors,
  brand,
  gradients,
  typography,
  spacing,
  borderRadius,
  transitions,
  breakpoints,
}

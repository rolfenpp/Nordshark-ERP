import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { createAppTheme, type AppThemeMode } from './theme'

interface ThemeContextType {
  mode: AppThemeMode
  toggleTheme: () => void
  setTheme: (mode: AppThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<AppThemeMode>('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as AppThemeMode | null
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setMode(savedTheme)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', mode)
  }, [mode])

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const setTheme = (newMode: AppThemeMode) => {
    setMode(newMode)
  }

  const theme = useMemo(() => createAppTheme(mode), [mode])

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

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

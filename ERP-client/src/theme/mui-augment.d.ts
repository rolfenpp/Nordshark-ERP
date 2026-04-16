import { designTokens } from './theme'

declare module '@mui/material/styles' {
  interface Theme {
    designTokens: typeof designTokens
  }
  interface ThemeOptions {
    designTokens?: typeof designTokens
  }
}


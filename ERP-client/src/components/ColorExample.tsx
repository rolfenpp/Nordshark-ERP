import { Box, Typography, Paper, Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { colors } from '../theme/theme'

export const ColorExample = () => {
  const theme = useTheme()

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Theme Colors Example
      </Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Using Theme Hook
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            sx={{ bgcolor: theme.palette.primary.main }}
          >
            Primary
          </Button>
          <Button 
            variant="contained" 
            sx={{ bgcolor: theme.palette.secondary.main }}
          >
            Secondary
          </Button>
          <Button 
            variant="contained" 
            sx={{ bgcolor: theme.palette.success.main }}
          >
            Success
          </Button>
          <Button 
            variant="contained" 
            sx={{ bgcolor: theme.palette.error.main }}
          >
            Error
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Using Direct Color Import
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            sx={{ bgcolor: colors.primary[500] }}
          >
            Primary
          </Button>
          <Button 
            variant="contained" 
            sx={{ bgcolor: colors.accent.indigo }}
          >
            Secondary
          </Button>
          <Button 
            variant="contained" 
            sx={{ bgcolor: colors.status.success }}
          >
            Success
          </Button>
          <Button 
            variant="contained" 
            sx={{ bgcolor: colors.status.error }}
          >
            Error
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Grey Scale
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
            <Box
              key={shade}
              sx={{
                width: 40,
                height: 40,
                bgcolor: colors.primary[shade as keyof typeof colors.primary],
                border: '1px solid #ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                color: shade > 500 ? 'white' : 'black',
              }}
            >
              {shade}
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  )
}

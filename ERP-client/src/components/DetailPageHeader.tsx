import { ArrowBack } from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'

export interface DetailPageHeaderProps {
  /** When false, the back button is hidden (e.g. create flows). Default true. */
  showBack?: boolean
  backLabel?: string
  onBack?: () => void
  title: React.ReactNode
  children?: React.ReactNode
}

export function DetailPageHeader({
  showBack = true,
  backLabel,
  onBack,
  title,
  children,
}: DetailPageHeaderProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'flex-start' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 1.5, sm: 2 },
            minWidth: 0,
            flex: '1 1 auto',
          }}
        >
          {showBack && backLabel != null && onBack != null && (
            <Button
              startIcon={<ArrowBack />}
              onClick={onBack}
              sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, flexShrink: 0 }}
            >
              {backLabel}
            </Button>
          )}
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: 300,
              fontSize: { xs: '1.35rem', sm: '2rem' },
              lineHeight: 1.25,
              wordBreak: 'break-word',
            }}
          >
            {title}
          </Typography>
        </Box>
        {children != null && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              alignItems: 'center',
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
              flex: { md: '0 0 auto' },
              '& > .MuiButton-root': {
                width: { xs: '100%', sm: 'auto' },
                minWidth: { sm: 'auto' },
                minHeight: { xs: 44, sm: 36 },
              },
              '& > .MuiIconButton-root': {
                flexShrink: 0,
              },
            }}
          >
            {children}
          </Box>
        )}
      </Box>
    </Box>
  )
}

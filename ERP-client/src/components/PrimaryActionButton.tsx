import { Box, Button, Tooltip } from '@mui/material'
import { Add } from '@mui/icons-material'
import { alpha } from '@mui/material/styles'
import { useNavigate } from '@tanstack/react-router'

export type PrimaryActionButtonProps = {
  label: string
  to: string
  disabled?: boolean
  disabledTooltip?: string
}

export function PrimaryActionButton({
  label,
  to,
  disabled = false,
  disabledTooltip,
}: PrimaryActionButtonProps) {
  const navigate = useNavigate()

  const button = (
    <Button
      variant="contained"
      startIcon={<Add />}
      disabled={disabled}
      onClick={() => {
        if (!disabled) navigate({ to })
      }}
      sx={[
        disabled &&
          ((theme) => ({
            '&.Mui-disabled': {
              opacity: 1,
              color: theme.palette.primary.contrastText,
              backgroundColor: alpha(theme.palette.primary.main, 0.92),
              '& .MuiButton-startIcon': { color: 'inherit' },
            },
          })),
      ]}
    >
      {label}
    </Button>
  )

  if (disabled && disabledTooltip) {
    return (
      <Tooltip title={disabledTooltip}>
        <Box component="span" sx={{ display: 'inline-flex' }}>
          {button}
        </Box>
      </Tooltip>
    )
  }

  return button
}

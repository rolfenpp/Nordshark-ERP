import { Box, Tooltip } from '@mui/material'
import { nordsharkLogoUrl } from '@/assets/images'

export function NordsharkSidebarLogo() {
  return (
    <Tooltip title="Nordshark ERP" placement="right">
      <Box
        component="img"
        src={nordsharkLogoUrl}
        alt="Nordshark ERP"
        sx={{
          display: 'block',
          width: 36,
          height: 36,
          objectFit: 'contain',
        }}
      />
    </Tooltip>
  )
}

import { Box, Card, CardContent, Typography } from '@mui/material'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import type { ReactNode } from 'react'

export type ListStatCardProps = {
  icon: React.ComponentType<SvgIconProps>
  iconColor?: SvgIconProps['color']
  value: ReactNode
  label: ReactNode
  sublabel?: ReactNode
}

export function ListStatCard({ icon: Icon, iconColor = 'primary', value, label, sublabel }: ListStatCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Icon color={iconColor} sx={{ mr: 2 }} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 300 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
              {label}
            </Typography>
            {sublabel != null && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {sublabel}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

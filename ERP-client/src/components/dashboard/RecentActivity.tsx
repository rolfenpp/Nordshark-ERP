import { Avatar, Box, Card, CardContent, Divider, IconButton, List, ListItem, ListItemIcon, Typography } from '@mui/material'
import { CheckCircle, Error, MoreVert, Schedule, Warning } from '@mui/icons-material'

export type ActivityStatus = 'success' | 'warning' | 'error' | 'info'

export type ActivityItem = {
  id: string
  type: string
  action: string
  user: string
  time: string
  status: ActivityStatus
}

function StatusIcon({ status }: { status: ActivityStatus }) {
  switch (status) {
    case 'success':
      return <CheckCircle color="success" />
    case 'warning':
      return <Warning color="warning" />
    case 'error':
      return <Error color="error" />
    case 'info':
    default:
      return <Schedule color="info" />
  }
}

export type RecentActivityProps = {
  items: ActivityItem[]
}

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 300 }}>
            Recent Activity
          </Typography>
          <IconButton size="small" aria-label="recent activity options">
            <MoreVert />
          </IconButton>
        </Box>

        {items.length === 0 ? (
          <Typography color="text.secondary" sx={{ fontWeight: 300, py: 2 }}>
            No recent activity
          </Typography>
        ) : (
          <List>
            {items.map((activity, index) => (
              <Box key={activity.id}>
                <ListItem
                  sx={{
                    px: 0,
                    py: 1.5,
                    minHeight: 54,
                    alignItems: 'flex-start',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.25 }}>
                    <StatusIcon status={activity.status} />
                  </ListItemIcon>
                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      justifyContent: 'space-between',
                      gap: { xs: 1, sm: 0 },
                      minWidth: 0,
                      width: '100%',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, flex: 1, mr: { xs: 0, sm: 2 }, wordBreak: 'break-word' }}
                    >
                      {activity.action}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: { xs: 0, sm: 0 },
                        alignSelf: { xs: 'flex-start', sm: 'center' },
                      }}
                    >
                      <Avatar sx={{ width: 20, height: 20, mr: 1, fontSize: '0.75rem' }}>
                        {activity.user.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ whiteSpace: { xs: 'normal', sm: 'nowrap' } }}
                      >
                        {activity.user} • {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
                {index < items.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  )
}

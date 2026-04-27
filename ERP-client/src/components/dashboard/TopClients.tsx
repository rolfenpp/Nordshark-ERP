import { Box, Card, CardContent, Chip, Divider, Typography } from '@mui/material'

export type TopClientRow = {
  name: string
  value: number
  invoices: number
  avg: number
}

export type TopClientsProps = {
  clients: TopClientRow[]
}

export function TopClients({ clients }: TopClientsProps) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 300, mb: 3 }}>
          Top clients (by revenue)
        </Typography>

        {clients.length === 0 ? (
          <Typography color="text.secondary" sx={{ fontWeight: 300 }}>
            No client data yet
          </Typography>
        ) : (
          clients.map((client, index) => (
            <Box key={client.name} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {client.name}
                </Typography>
                <Chip
                  label={`$${client.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {client.invoices} invoice{client.invoices === 1 ? '' : 's'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Avg. ${client.avg.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </Typography>
              </Box>
              {index < clients.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))
        )}
      </CardContent>
    </Card>
  )
}

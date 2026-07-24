import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { AutoAwesome } from '@mui/icons-material'
import { useAiBrief } from '@/api/ai'

export function OpsBriefPanel() {
  const { data, isLoading, isError, error, isFetching } = useAiBrief()

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome color="primary" fontSize="small" />
            <Typography variant="h6" sx={{ fontWeight: 300 }}>
              Operations brief
            </Typography>
            {isFetching && !isLoading && <CircularProgress size={16} />}
          </Box>
          {data && (
            <Chip
              size="small"
              label={data.configured ? 'AI narrative' : 'Rule-based'}
              variant="outlined"
            />
          )}
        </Box>

        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }}>
            <CircularProgress size={22} />
            <Typography color="text.secondary">Summarizing invoices, inventory, and projects…</Typography>
          </Box>
        )}

        {isError && (
          <Alert severity="warning">
            {(error as Error)?.message || 'Could not load operations brief.'}
          </Alert>
        )}

        {data && !isLoading && (
          <Stack spacing={2}>
            <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {data.narrative}
            </Typography>

            {data.facts.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {data.facts.map((f) => (
                  <Chip
                    key={`${f.entityType}-${f.label}`}
                    label={`${f.label}: ${f.value}`}
                    size="small"
                    color={f.entityType === 'invoice' ? 'warning' : f.entityType === 'inventory' ? 'error' : 'info'}
                    variant="outlined"
                  />
                ))}
              </Box>
            )}

            {(data.invoices?.overdueExamples?.length ||
              data.inventory?.exceptions?.length ||
              data.projects?.examples?.length) && (
              <>
                <Divider />
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                    gap: 2,
                  }}
                >
                  {data.invoices?.overdueExamples && data.invoices.overdueExamples.length > 0 && (
                    <ExampleList title="Overdue invoices" items={data.invoices.overdueExamples} />
                  )}
                  {data.inventory?.exceptions && data.inventory.exceptions.length > 0 && (
                    <ExampleList title="Stock exceptions" items={data.inventory.exceptions} />
                  )}
                  {data.projects?.examples && data.projects.examples.length > 0 && (
                    <ExampleList title="Slipping projects" items={data.projects.examples} />
                  )}
                </Box>
              </>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

function ExampleList({ title, items }: { title: string; items: string[] }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.75 }}>
        {title}
      </Typography>
      <Stack spacing={0.5}>
        {items.slice(0, 4).map((item) => (
          <Typography key={item} variant="body2" sx={{ wordBreak: 'break-word' }}>
            {item}
          </Typography>
        ))}
      </Stack>
    </Box>
  )
}

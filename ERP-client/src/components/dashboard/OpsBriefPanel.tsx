import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import { AutoAwesome } from '@mui/icons-material'
import { useAiBriefOnDemand } from '@/api/ai'
import { plainAiText } from '@/lib/plainAiText'

export function OpsBriefPanel() {
  const theme = useTheme()
  const { data, isPending, isError, error, mutate, reset } = useAiBriefOnDemand()
  const showPanel = isPending || isError || Boolean(data)

  const aiButtonSx = {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
    },
    '&:disabled': {
      background: theme.palette.action.disabledBackground,
      color: theme.palette.action.disabled,
    },
  }

  if (!showPanel) {
    return (
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<AutoAwesome />}
          onClick={() => mutate()}
          sx={aiButtonSx}
        >
          Generate brief
        </Button>
      </Box>
    )
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome color="primary" fontSize="small" />
            <Typography variant="h6" sx={{ fontWeight: 300 }}>
              Operations brief
            </Typography>
            {data && (
              <Chip
                size="small"
                label={data.configured ? 'AI narrative' : 'Rule-based'}
                variant="outlined"
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isPending && (data || isError) && (
              <Button
                variant="contained"
                size="small"
                onClick={() => mutate()}
                startIcon={<AutoAwesome fontSize="small" />}
                sx={aiButtonSx}
              >
                Refresh
              </Button>
            )}
            {!isPending && (
              <Button size="small" color="inherit" onClick={() => reset()}>
                Close
              </Button>
            )}
          </Box>
        </Box>

        {isPending && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }}>
            <CircularProgress size={22} />
            <Typography color="text.secondary">Summarizing invoices, inventory, and projects…</Typography>
          </Box>
        )}

        {isError && !isPending && (
          <Alert severity="warning">
            {(error as Error)?.message || 'Could not load operations brief.'}
          </Alert>
        )}

        {data && !isPending && (
          <Stack spacing={2}>
            <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {plainAiText(data.narrative)}
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

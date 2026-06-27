import { Box, Card, CardContent, Chip, Tooltip, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import { format } from 'date-fns'
import { useMemo } from 'react'
import type { ProjectDto } from '@/api/projects'
import { appDateLocale, parseApiDate } from '@/lib/dates'
import type { NormalizedProjectStatus } from '@/lib/statusNormalize'
import { normalizeProjectStatus } from '@/lib/statusNormalize'

const MAX_ROWS = 14
const DOMAIN_PAD_DAYS = 4
const DAY_MS = 86400000

function resolveTimelineDates(p: ProjectDto): { start: Date; end: Date } {
  const start =
    parseApiDate(p.startDate) ??
    parseApiDate(p.createdUtc) ??
    parseApiDate(p.updatedUtc) ??
    new Date()

  const parsedEnd = parseApiDate(p.endDate)
  if (parsedEnd && parsedEnd.getTime() >= start.getTime()) {
    return { start, end: parsedEnd }
  }

  const st = normalizeProjectStatus(p.status)
  const now = new Date()
  let end: Date

  if (st === 'completed') {
    const u = parseApiDate(p.updatedUtc)
    end = u && u.getTime() >= start.getTime() ? u : new Date(start.getTime() + 7 * DAY_MS)
  } else if (st === 'planning') {
    end = new Date(Math.max(start.getTime() + 30 * DAY_MS, now.getTime(), start.getTime() + 7 * DAY_MS))
  } else {
    end = now.getTime() >= start.getTime() ? now : new Date(start.getTime() + 45 * DAY_MS)
  }

  if (end.getTime() < start.getTime()) {
    end = new Date(start.getTime() + DAY_MS)
  }
  return { start, end }
}

function barColorForStatus(status: NormalizedProjectStatus, palette: Theme['palette']) {
  switch (status) {
    case 'active':
      return palette.success.main
    case 'planning':
      return palette.info.main
    case 'completed':
      return palette.text.secondary
    case 'on-hold':
      return palette.warning.main
    default:
      return palette.primary.main
  }
}

function statusLabel(status: NormalizedProjectStatus) {
  switch (status) {
    case 'active':
      return 'Active'
    case 'planning':
      return 'Planning'
    case 'completed':
      return 'Completed'
    case 'on-hold':
      return 'On hold'
    default:
      return 'Other'
  }
}

export type ProjectsListTimelinePanelProps = {
  projects: ProjectDto[]
  compact?: boolean
  onProjectClick?: (id: number) => void
}

export function ProjectsListTimelinePanel({
  projects,
  compact = false,
  onProjectClick,
}: ProjectsListTimelinePanelProps) {
  const theme = useTheme()

  const { domainStart, domainEnd, rows, restCount, summary } = useMemo(() => {
    if (projects.length === 0) {
      const now = new Date()
      return {
        domainStart: new Date(now.getTime() - 30 * DAY_MS),
        domainEnd: new Date(now.getTime() + 30 * DAY_MS),
        rows: [] as Array<{
          id: number
          name: string
          status: NormalizedProjectStatus
          start: Date
          end: Date
          leftPct: number
          widthPct: number
        }>,
        restCount: 0,
        summary: { active: 0, planning: 0, completed: 0, onHold: 0, budget: 0 },
      }
    }

    const windows = projects.map((p) => ({ project: p, ...resolveTimelineDates(p) }))
    let minT = Math.min(...windows.map((w) => w.start.getTime()))
    let maxT = Math.max(...windows.map((w) => w.end.getTime()))
    const now = Date.now()
    minT = Math.min(minT, now)
    maxT = Math.max(maxT, now)

    const domainStart = new Date(minT - DOMAIN_PAD_DAYS * DAY_MS)
    const domainEnd = new Date(maxT + DOMAIN_PAD_DAYS * DAY_MS)
    const span = Math.max(domainEnd.getTime() - domainStart.getTime(), DAY_MS)

    const sorted = [...windows].sort((a, b) => a.start.getTime() - b.start.getTime())
    const visible = sorted.slice(0, MAX_ROWS)
    const restCount = Math.max(0, sorted.length - MAX_ROWS)

    const rows = visible.map((w) => {
      const status = normalizeProjectStatus(w.project.status)
      const left = ((w.start.getTime() - domainStart.getTime()) / span) * 100
      const width = ((w.end.getTime() - w.start.getTime()) / span) * 100
      return {
        id: w.project.id,
        name: w.project.name,
        status,
        start: w.start,
        end: w.end,
        leftPct: Math.max(0, Math.min(100, left)),
        widthPct: Math.max(0.35, Math.min(100 - left, width)),
      }
    })

    const summary = projects.reduce(
      (acc, p) => {
        const s = normalizeProjectStatus(p.status)
        if (s === 'active') acc.active += 1
        else if (s === 'planning') acc.planning += 1
        else if (s === 'completed') acc.completed += 1
        else if (s === 'on-hold') acc.onHold += 1
        acc.budget += p.budget ?? 0
        return acc
      },
      { active: 0, planning: 0, completed: 0, onHold: 0, budget: 0 }
    )

    return { domainStart, domainEnd, rows, restCount, summary }
  }, [projects])

  const todayWithinDomain =
    Date.now() >= domainStart.getTime() && Date.now() <= domainEnd.getTime()
  const todayPct = todayWithinDomain
    ? ((Date.now() - domainStart.getTime()) / (domainEnd.getTime() - domainStart.getTime())) * 100
    : null

  const rowH = compact ? 34 : 40
  const nameW = compact ? 120 : 160

  const legendStatuses: NormalizedProjectStatus[] = ['active', 'planning', 'on-hold', 'completed', 'unknown']

  return (
    <Box sx={{ display: { xs: 'none', sm: 'block' }, mb: 4 }}>
      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 300 }}>
              Project timeline
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300, mt: 0.5 }}>
              {projects.length === 0
                ? 'Add projects with dates to see them on a schedule.'
                : `Schedule based on start / end dates (gaps filled from activity dates). ${format(domainStart, 'MMM d, yyyy', { locale: appDateLocale })} — ${format(domainEnd, 'MMM d, yyyy', { locale: appDateLocale })}`}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {legendStatuses.map((st) => (
              <Chip
                key={st}
                size="small"
                label={statusLabel(st)}
                sx={{
                  bgcolor: `${barColorForStatus(st, theme.palette)}22`,
                  color: barColorForStatus(st, theme.palette),
                  border: '1px solid',
                  borderColor: `${barColorForStatus(st, theme.palette)}44`,
                  fontWeight: 300,
                  fontSize: '0.75rem',
                }}
              />
            ))}
          </Box>

          {projects.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography color="text.secondary" sx={{ fontWeight: 300 }}>
                No projects to show yet.
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', mb: 0.75, pl: `${nameW}px` }}>
                <Box sx={{ flex: 1, position: 'relative', height: 20 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', left: 0 }}>
                    {format(domainStart, 'MMM d', { locale: appDateLocale })}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ position: 'absolute', right: 0 }}
                  >
                    {format(domainEnd, 'MMM d', { locale: appDateLocale })}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : 'grey.50',
                  overflow: 'hidden',
                }}
              >
                {todayPct != null && (
                  <Box
                    aria-hidden
                    sx={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: `${todayPct}%`,
                      width: 2,
                      ml: '-1px',
                      bgcolor: 'primary.main',
                      opacity: 0.85,
                      zIndex: 2,
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {rows.map((row) => (
                  <Tooltip
                    key={row.id}
                    title={
                      <Box sx={{ py: 0.5 }}>
                        <Typography variant="subtitle2">{row.name}</Typography>
                        <Typography variant="caption" display="block">
                          {statusLabel(row.status)} · {format(row.start, 'PP', { locale: appDateLocale })} —{' '}
                          {format(row.end, 'PP', { locale: appDateLocale })}
                        </Typography>
                      </Box>
                    }
                  >
                    <Box
                      onClick={onProjectClick ? () => onProjectClick(row.id) : undefined}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        minHeight: rowH,
                        borderBottom: 1,
                        borderColor: 'divider',
                        cursor: onProjectClick ? 'pointer' : 'default',
                        '&:last-of-type': { borderBottom: 0 },
                        '&:hover': onProjectClick ? { bgcolor: 'action.hover' } : undefined,
                      }}
                    >
                      <Box
                        sx={{
                          width: nameW,
                          flexShrink: 0,
                          px: 1.5,
                          borderRight: 1,
                          borderColor: 'divider',
                          overflow: 'hidden',
                        }}
                      >
                        <Typography variant="body2" noWrap sx={{ fontWeight: 400 }}>
                          {row.name}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, px: 1, py: 0.75, position: 'relative', minHeight: rowH - 8 }}>
                        <Box
                          sx={{
                            position: 'absolute',
                            left: `${row.leftPct}%`,
                            width: `${row.widthPct}%`,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            height: compact ? 10 : 12,
                            borderRadius: 1,
                            bgcolor: barColorForStatus(row.status, theme.palette),
                            opacity: 0.92,
                            boxShadow: 1,
                          }}
                        />
                      </Box>
                    </Box>
                  </Tooltip>
                ))}
              </Box>

              {todayPct != null && (
                <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1, fontWeight: 300 }}>
                  Blue line = today
                </Typography>
              )}

              {restCount > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  +{restCount} more projects in the list below (showing earliest {MAX_ROWS} on the timeline).
                </Typography>
              )}

              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                  <Box component="span" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    {projects.length}
                  </Box>{' '}
                  projects
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                  Active {summary.active} · Planning {summary.planning} · On hold {summary.onHold} · Completed{' '}
                  {summary.completed}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                  Combined budget:{' '}
                  <Box component="span" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    ${summary.budget.toLocaleString()}
                  </Box>
                </Typography>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

import { Box, Card, CardContent, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { UserDto } from '@/api/users'

const DOMAIN_TOP_N = 8

function emailDomain(email: string): string {
  const i = email.indexOf('@')
  if (i < 0) return '(no domain)'
  const d = email.slice(i + 1).trim().toLowerCase()
  return d || '(no domain)'
}

type NormalizedRole = 'admin' | 'user' | 'other'

function normalizedRole(user: UserDto): NormalizedRole {
  const r = (user.roles[0] ?? 'user').toLowerCase()
  if (r === 'admin') return 'admin'
  if (r === 'user') return 'user'
  return 'other'
}

function roleLabel(r: NormalizedRole) {
  switch (r) {
    case 'admin':
      return 'Admin'
    case 'user':
      return 'Standard'
    case 'other':
      return 'Other role'
    default:
      return r
  }
}

function roleColor(r: NormalizedRole, palette: Theme['palette']) {
  if (r === 'admin') return palette.error.main
  if (r === 'user') return palette.primary.main
  return palette.secondary.main
}

function domainBarColor(i: number, palette: Theme['palette']) {
  const seq = [
    palette.primary.main,
    palette.secondary.main,
    palette.info.main,
    palette.success.main,
    palette.warning.main,
    palette.error.main,
  ]
  return seq[i % seq.length]
}

export type UsersListOverviewPanelProps = {
  users: UserDto[]
  compact?: boolean
}

export function UsersListOverviewPanel({ users, compact = false }: UsersListOverviewPanelProps) {
  const theme = useTheme()
  const donutHeight = compact ? 140 : 168
  const domainChartH = compact ? 220 : 260

  const {
    domainRows,
    rolePieSlices,
    roleRowsLegend,
    verifyPieSlices,
    verifyLegend,
    total,
    distinctDomains,
    hasMoreDomains,
  } = useMemo(() => {
    const total = users.length
    const domainFreq = new Map<string, number>()
    const roleCounts: Record<NormalizedRole, number> = { admin: 0, user: 0, other: 0 }
    let confirmed = 0
    let pending = 0

    for (const u of users) {
      domainFreq.set(emailDomain(u.email), (domainFreq.get(emailDomain(u.email)) ?? 0) + 1)
      roleCounts[normalizedRole(u)] += 1
      if (u.emailConfirmed) confirmed += 1
      else pending += 1
    }

    const sortedDomains = [...domainFreq.entries()].sort((a, b) => b[1] - a[1])
    const top = sortedDomains.slice(0, DOMAIN_TOP_N)
    const restSum = sortedDomains.slice(DOMAIN_TOP_N).reduce((s, [, n]) => s + n, 0)
    const domainRows = [
      ...top.map(([name, value], i) => ({
        name: name.length > 22 ? `${name.slice(0, 20)}…` : name,
        fullName: name,
        value,
        fill: domainBarColor(i, theme.palette),
      })),
      ...(restSum > 0
        ? [
            {
              name: 'Other domains',
              fullName: 'Other domains (combined)',
              value: restSum,
              fill: theme.palette.text.disabled,
            },
          ]
        : []),
    ]

    const roles: NormalizedRole[] = ['admin', 'user', 'other']
    const rolePieSlices = roles
      .map((r) => ({
        name: roleLabel(r),
        value: roleCounts[r],
        color: roleColor(r, theme.palette),
        key: r,
      }))
      .filter((s) => s.value > 0)

    const roleRowsLegend = roles.map((r) => ({
      key: r,
      label: roleLabel(r),
      value: roleCounts[r],
      color: roleColor(r, theme.palette),
    }))

    const verifyPieSlices = [
      { name: 'Verified', value: confirmed, color: theme.palette.success.main, key: 'verified' as const },
      { name: 'Pending', value: pending, color: theme.palette.warning.main, key: 'pending' as const },
    ].filter((s) => s.value > 0)

    const verifyLegend = [
      { key: 'verified' as const, label: 'Verified', value: confirmed, color: theme.palette.success.main },
      { key: 'pending' as const, label: 'Pending', value: pending, color: theme.palette.warning.main },
    ]

    const hasMoreDomains = sortedDomains.length > DOMAIN_TOP_N

    return {
      domainRows,
      rolePieSlices,
      roleRowsLegend,
      verifyPieSlices,
      verifyLegend,
      total,
      distinctDomains: domainFreq.size,
      hasMoreDomains,
    }
  }, [users, theme.palette])

  const strokePaper = theme.palette.mode === 'dark' ? 'transparent' : theme.palette.background.paper

  const emptyBody = (
    <Box
      sx={{
        py: 4,
        textAlign: 'center',
        minHeight: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography color="text.secondary" sx={{ fontWeight: 300 }}>
        No users loaded yet.
      </Typography>
    </Box>
  )

  const donutInner = compact ? 30 : 36
  const donutOuter = compact ? 52 : 62

  return (
    <Box
      sx={{
        display: { xs: 'none', sm: 'grid' },
        gridTemplateColumns: {
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(4, minmax(0, 1fr))',
        },
        gap: 3,
        mb: 4,
      }}
    >
      <Card sx={{ gridColumn: { sm: '1 / -1', md: 'span 2' }, height: '100%' }}>
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" sx={{ fontWeight: 300, mb: 0.5 }}>
            Users by email domain
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300, mb: 2 }}>
            Where accounts are hosted — useful for spotting mixed personal and company emails.
          </Typography>
          {total === 0 ? (
            emptyBody
          ) : (
            <>
              <Box sx={{ height: domainChartH, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={domainRows} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.divider} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={compact ? 100 : 120}
                      tick={{ fontSize: 11, fill: theme.palette.text.primary, fontWeight: 300 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: theme.palette.action.hover }}
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        boxShadow: theme.shadows[2],
                        color: theme.palette.text.primary,
                      }}
                      formatter={(value: number) => [value, 'Users']}
                      labelFormatter={(_, payload) =>
                        String((payload?.[0]?.payload as { fullName?: string })?.fullName ?? '')
                      }
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
                      {domainRows.map((row, i) => (
                        <Cell key={`${row.fullName}-${i}`} fill={row.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, fontWeight: 300 }}>
                {total.toLocaleString()} user{total !== 1 ? 's' : ''} across {distinctDomains} distinct domain
                {distinctDomains !== 1 ? 's' : ''}
                {hasMoreDomains ? ` · Top ${DOMAIN_TOP_N} domains + other bucket` : ''}.
              </Typography>
            </>
          )}
        </CardContent>
      </Card>

      <Card sx={{ height: '100%', gridColumn: { sm: 'span 1', md: 'span 1' } }}>
        <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 400, mb: 0.5 }}>
            Roles
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontWeight: 300 }}>
            Primary role from the API
          </Typography>
          {total === 0 ? (
            emptyBody
          ) : (
            <>
              <Box sx={{ height: donutHeight, width: '100%', position: 'relative', flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rolePieSlices}
                      cx="50%"
                      cy="50%"
                      innerRadius={donutInner}
                      outerRadius={donutOuter}
                      paddingAngle={2}
                      dataKey="value"
                      stroke={strokePaper}
                      strokeWidth={theme.palette.mode === 'dark' ? 0 : 2}
                    >
                      {rolePieSlices.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={entry.color}
                          stroke={theme.palette.mode === 'dark' ? 'transparent' : strokePaper}
                          strokeWidth={theme.palette.mode === 'dark' ? 0 : 2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        boxShadow: theme.shadows[2],
                        color: theme.palette.text.primary,
                      }}
                      formatter={(value: number) => [value, 'Users']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <Typography
                    variant={compact ? 'h5' : 'h4'}
                    sx={{ fontWeight: 300, color: 'text.primary', lineHeight: 1.1 }}
                  >
                    {total}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 300, fontSize: '0.7rem' }}>
                    users
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 1.5 }}>
                {roleRowsLegend.map((row) => {
                  const pct = total > 0 ? (row.value / total) * 100 : 0
                  return (
                    <Box key={row.key} sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 0.5 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: row.color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="caption" sx={{ flex: 1, fontWeight: 300, lineHeight: 1.2 }}>
                        {row.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 300 }}>
                        {row.value}
                        {row.value > 0 ? ` · ${pct.toFixed(0)}%` : ''}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      <Card sx={{ height: '100%', gridColumn: { sm: 'span 1', md: 'span 1' } }}>
        <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 400, mb: 0.5 }}>
            Verification
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontWeight: 300 }}>
            Email confirmed flag from directory
          </Typography>
          {total === 0 ? (
            emptyBody
          ) : (
            <>
              <Box sx={{ height: donutHeight, width: '100%', position: 'relative', flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={verifyPieSlices}
                      cx="50%"
                      cy="50%"
                      innerRadius={donutInner}
                      outerRadius={donutOuter}
                      paddingAngle={2}
                      dataKey="value"
                      stroke={strokePaper}
                      strokeWidth={theme.palette.mode === 'dark' ? 0 : 2}
                    >
                      {verifyPieSlices.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={entry.color}
                          stroke={theme.palette.mode === 'dark' ? 'transparent' : strokePaper}
                          strokeWidth={theme.palette.mode === 'dark' ? 0 : 2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        boxShadow: theme.shadows[2],
                        color: theme.palette.text.primary,
                      }}
                      formatter={(value: number) => [value, 'Users']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <Typography
                    variant={compact ? 'h5' : 'h4'}
                    sx={{ fontWeight: 300, color: 'text.primary', lineHeight: 1.1 }}
                  >
                    {total}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 300, fontSize: '0.7rem' }}>
                    accounts
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 1.5 }}>
                {verifyLegend.map((row) => {
                  const pct = total > 0 ? (row.value / total) * 100 : 0
                  return (
                    <Box key={row.key} sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 0.5 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: row.color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="caption" sx={{ flex: 1, fontWeight: 300, lineHeight: 1.2 }}>
                        {row.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 300 }}>
                        {row.value}
                        {row.value > 0 ? ` · ${pct.toFixed(0)}%` : ''}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

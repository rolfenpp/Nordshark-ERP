import { createFileRoute } from '@tanstack/react-router'
import {
  Alert,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { Edit, Delete, Visibility, Search, Person, AdminPanelSettings, SupervisorAccount, PersonAdd } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useMemo, useState } from 'react'
import { ResourceListPage } from '@/components/ResourceListPage'
import { ListPageToolbar } from '@/components/ListPageToolbar'
import { PrimaryActionButton } from '@/components/PrimaryActionButton'
import { ListStatsGrid } from '@/components/ListStatsGrid'
import { ListStatCard } from '@/components/ListStatCard'
import { ListSummaryFooter } from '@/components/ListSummaryFooter'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useCompactListLayout } from '@/hooks/useCompactListLayout'
import { LIST_SEARCH_DEBOUNCE_MS } from '@/lib/listBreakpoints'
import { formatDisplayDate } from '@/lib/dates'
import { useUsers } from '@/api/users'

export const Route = createFileRoute('/_app/users/')({
  component: UsersComponent,
})

type UserRow = {
  id: string
  name: string
  email: string
  role: string
  status: string
  lastLogin: string
}

function displayNameFromEmail(email: string) {
  const local = email.split('@')[0] || email
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(' ')
}

function getRoleColor(role: string) {
  switch (role) {
    case 'admin':
      return 'error'
    case 'user':
      return 'default'
    default:
      return 'info'
  }
}

function getStatusColor(status: string) {
  return status === 'active' ? 'success' : 'warning'
}

function formatLastLogin(value: string) {
  if (value === '—') return '—'
  return formatDisplayDate(value)
}

const USER_ACTIONS_UNAVAILABLE = 'Not available in this app version.'

function UsersComponent() {
  const theme = useTheme()
  const smUp = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true })
  const compactList = useCompactListLayout()

  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebouncedValue(searchTerm, LIST_SEARCH_DEBOUNCE_MS)
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all')
  const { data: apiUsers = [], isLoading, isError, error } = useUsers()

  const users: UserRow[] = useMemo(
    () =>
      apiUsers.map((u) => ({
        id: u.id,
        name: displayNameFromEmail(u.email),
        email: u.email,
        role: (u.roles[0] ?? 'user').toLowerCase(),
        status: u.emailConfirmed ? 'active' : 'pending',
        lastLogin: '—',
      })),
    [apiUsers]
  )

  const filteredUsers = useMemo(() => {
    let list = users
    if (filterRole !== 'all') {
      list = list.filter((u) => u.role === filterRole)
    }
    if (!debouncedSearchTerm.trim()) return list
    const q = debouncedSearchTerm.toLowerCase()
    return list.filter(
      (user) =>
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q)
    )
  }, [users, debouncedSearchTerm, filterRole])

  const columns: DataTableColumn<UserRow>[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Name',
        sortable: true,
        sortAccessor: (u) => u.name.toLowerCase(),
        render: (u) => (
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {u.name}
            </Typography>
            {compactList && (
              <Typography variant="caption" color="text.secondary">
                {u.email}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        id: 'email',
        label: 'Email',
        hideOnCompact: true,
        sortable: true,
        sortAccessor: (u) => u.email.toLowerCase(),
        render: (u) => u.email,
      },
      {
        id: 'role',
        label: 'Role',
        sortable: true,
        sortAccessor: (u) => u.role,
        render: (u) => <Chip label={u.role} color={getRoleColor(u.role) as 'error' | 'default' | 'info'} size="small" />,
      },
      {
        id: 'status',
        label: 'Status',
        sortable: true,
        sortAccessor: (u) => u.status,
        render: (u) => <Chip label={u.status} color={getStatusColor(u.status)} size="small" />,
      },
      {
        id: 'lastLogin',
        label: 'Last Login',
        hideOnCompact: true,
        sortable: true,
        sortAccessor: (u) => u.lastLogin,
        render: (u) => formatLastLogin(u.lastLogin),
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'center',
        render: () => (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Tooltip title={USER_ACTIONS_UNAVAILABLE}>
              <span>
                <IconButton size="small" color="primary" disabled>
                  <Visibility />
                </IconButton>
              </span>
            </Tooltip>
            <Box sx={{ display: compactList ? 'none' : 'inline-flex' }}>
              <Tooltip title={USER_ACTIONS_UNAVAILABLE}>
                <span>
                  <IconButton size="small" color="warning" disabled>
                    <Edit />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={USER_ACTIONS_UNAVAILABLE}>
                <span>
                  <IconButton size="small" color="error" disabled>
                    <Delete />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
        ),
      },
    ],
    [compactList]
  )

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.status === 'active').length
  const adminUsers = users.filter((u) => u.role === 'admin').length
  const standardUsers = users.filter((u) => u.role === 'user').length

  if (isLoading) {
    return null
  }

  return (
    <ResourceListPage>
      <ListStatsGrid compact={compactList}>
        <ListStatCard icon={Person} iconColor="primary" value={totalUsers.toLocaleString()} label="Total Users" />
        <ListStatCard icon={PersonAdd} iconColor="success" value={activeUsers.toLocaleString()} label="Active Users" />
        <ListStatCard icon={AdminPanelSettings} iconColor="error" value={adminUsers.toLocaleString()} label="Admins" />
        <ListStatCard
          icon={SupervisorAccount}
          iconColor="warning"
          value={standardUsers.toLocaleString()}
          label="Standard users"
        />
      </ListStatsGrid>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(error as Error)?.message || 'Failed to load users (admin access required).'}
        </Alert>
      )}

      <ListPageToolbar
        search={
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        }
        filters={
          <FormControl fullWidth size="small">
            <InputLabel id="users-role-filter-label">Role</InputLabel>
            <Select
              labelId="users-role-filter-label"
              label="Role"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as 'all' | 'admin' | 'user')}
            >
              <MenuItem value="all">All roles</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </Select>
          </FormControl>
        }
        actions={
          <PrimaryActionButton
            label="Add New User"
            to="/users/"
            disabled
            disabledTooltip={USER_ACTIONS_UNAVAILABLE}
          />
        }
      />

      <DataTable<UserRow>
          columns={columns}
          rows={filteredUsers}
          getRowId={(r) => r.id}
          compact={compactList}
          isDesktop={smUp}
          emptyMessage="No users match your search."
          defaultRowsPerPage={10}
          renderMobileRow={(u) => (
            <Card variant="outlined">
              <CardContent sx={{ display: 'grid', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">{u.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={u.role} color={getRoleColor(u.role) as 'error' | 'default' | 'info'} size="small" />
                    <Chip label={u.status} color={getStatusColor(u.status)} size="small" />
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {u.email}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last login: {formatLastLogin(u.lastLogin)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Tooltip title={USER_ACTIONS_UNAVAILABLE}>
                    <span>
                      <Button size="small" startIcon={<Visibility />} disabled>
                        View
                      </Button>
                    </span>
                  </Tooltip>
                  <Tooltip title={USER_ACTIONS_UNAVAILABLE}>
                    <span>
                      <Button size="small" startIcon={<Edit />} disabled>
                        Edit
                      </Button>
                    </span>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          )}
        />

      <ListSummaryFooter
        primary={
          <Typography variant="body2" color="text.secondary">
            Showing {filteredUsers.length.toLocaleString()} of {users.length.toLocaleString()} users
          </Typography>
        }
      >
        <Typography variant="body2" color="text.secondary">
          Active: <strong>{activeUsers.toLocaleString()}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Admins: <strong>{adminUsers.toLocaleString()}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Standard: <strong>{standardUsers.toLocaleString()}</strong>
        </Typography>
      </ListSummaryFooter>
    </ResourceListPage>
  )
}

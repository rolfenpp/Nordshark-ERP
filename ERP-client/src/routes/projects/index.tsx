import { createFileRoute } from '@tanstack/react-router'
import { ResourceListPage } from '../../components/ResourceListPage'
import { ListStatsGrid } from '../../components/ListStatsGrid'
import { ListSummaryFooter } from '../../components/ListSummaryFooter'
import { DataTable, type DataTableColumn } from '../../components/DataTable'
import { TableSkeleton } from '../../components/Skeletons'
import {
  Alert,
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material'
import { Add, Search, Edit, Delete, Visibility, Assignment, TrendingUp, Schedule, AttachMoney } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useCompactListLayout } from '../../hooks/useCompactListLayout'
import { LIST_SEARCH_DEBOUNCE_MS } from '../../lib/listBreakpoints'
import { useProjects, useDeleteProject, type ProjectDto } from '../../api/projects'
import { normalizeProjectStatus } from '../../lib/statusNormalize'

export const Route = createFileRoute('/projects/')({
  component: ProjectsIndexComponent,
})

function getStatusColor(status: string) {
  const s = normalizeProjectStatus(status)
  switch (s) {
    case 'active':
      return 'success'
    case 'planning':
      return 'info'
    case 'completed':
      return 'default'
    case 'on-hold':
      return 'warning'
    default:
      return 'default'
  }
}

function getStatusLabel(status: string) {
  const s = normalizeProjectStatus(status)
  switch (s) {
    case 'active':
      return 'Active'
    case 'planning':
      return 'Planning'
    case 'completed':
      return 'Completed'
    case 'on-hold':
      return 'On Hold'
    default:
      return status || '—'
  }
}

function ProjectsIndexComponent() {
  const navigate = useNavigate()
  const theme = useTheme()
  const smUp = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true })
  const compactList = useCompactListLayout()

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebouncedValue(searchQuery, LIST_SEARCH_DEBOUNCE_MS)
  const [filterStatus, setFilterStatus] = useState('all')

  const { data: projectData = [], isLoading, isError, error } = useProjects()
  const deleteProject = useDeleteProject()
  const projects = projectData

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const client = (project.client ?? '').toLowerCase()
        const matchesSearch =
          project.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          client.includes(debouncedSearchQuery.toLowerCase())
        const st = normalizeProjectStatus(project.status)
        const matchesStatus = filterStatus === 'all' || st === filterStatus
        return matchesSearch && matchesStatus
      }),
    [projects, debouncedSearchQuery, filterStatus]
  )

  const toProject = useCallback(
    (id: number) => navigate({ to: '/projects/$projectId', params: { projectId: String(id) } }),
    [navigate]
  )
  const toEdit = useCallback(
    (id: number) => navigate({ to: '/projects/edit/$projectId', params: { projectId: String(id) } }),
    [navigate]
  )

  const confirmDeleteProject = useCallback(
    (id: number, name: string) => {
      if (window.confirm(`Delete project "${name}"? This cannot be undone.`)) {
        void deleteProject.mutate(id)
      }
    },
    [deleteProject]
  )

  const columns: DataTableColumn<ProjectDto>[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Project Name',
        sortable: true,
        sortAccessor: (p) => p.name.toLowerCase(),
        render: (project) => (
          <Box>
            <Typography variant="subtitle2" sx={{ cursor: 'pointer' }} onClick={() => toProject(project.id)}>
              {project.name}
            </Typography>
            {compactList && (
              <Box sx={{ mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {project.client ?? '—'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Manager: {project.manager ?? '—'}
                </Typography>
              </Box>
            )}
          </Box>
        ),
      },
      {
        id: 'client',
        label: 'Client',
        hideOnCompact: true,
        sortable: true,
        sortAccessor: (p) => (p.client ?? '').toLowerCase(),
        render: (p) => p.client ?? '—',
      },
      {
        id: 'manager',
        label: 'Manager',
        hideOnCompact: true,
        sortable: true,
        sortAccessor: (p) => (p.manager ?? '').toLowerCase(),
        render: (p) => p.manager ?? '—',
      },
      {
        id: 'status',
        label: 'Status',
        sortable: true,
        sortAccessor: (p) => normalizeProjectStatus(p.status),
        render: (p) => (
          <Chip
            label={getStatusLabel(p.status ?? '')}
            color={getStatusColor(p.status ?? '') as 'success' | 'default' | 'info' | 'warning'}
            size="small"
          />
        ),
      },
      {
        id: 'progress',
        label: 'Progress',
        sortable: true,
        sortAccessor: (p) => p.progress ?? 0,
        render: (project) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress variant="determinate" value={project.progress ?? 0} sx={{ height: 8, borderRadius: 4 }} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="text.secondary">{project.progress ?? 0}%</Typography>
            </Box>
          </Box>
        ),
      },
      {
        id: 'budget',
        label: 'Budget',
        align: 'right',
        hideOnCompact: true,
        sortable: true,
        sortAccessor: (p) => p.budget ?? 0,
        render: (p) => `$${(p.budget ?? 0).toLocaleString()}`,
      },
      {
        id: 'timeline',
        label: 'Timeline',
        hideOnCompact: true,
        sortable: true,
        sortAccessor: (p) => new Date(p.startDate || 0).getTime(),
        render: (p) => (
          <Typography variant="body2">
            {p.startDate ? new Date(p.startDate).toLocaleDateString() : '—'} -{' '}
            {p.endDate ? new Date(p.endDate).toLocaleDateString() : '—'}
          </Typography>
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'center',
        render: (project) => (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <IconButton size="small" onClick={() => toProject(project.id)} color="primary">
              <Visibility />
            </IconButton>
            <Box sx={{ display: compactList ? 'none' : 'inline-flex' }}>
              <IconButton size="small" onClick={() => toEdit(project.id)} color="warning">
                <Edit />
              </IconButton>
              <Tooltip title="Delete project">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => confirmDeleteProject(project.id, project.name)}
                    color="error"
                    disabled={deleteProject.isPending}
                  >
                    <Delete />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
        ),
      },
    ],
    [compactList, toProject, toEdit, confirmDeleteProject, deleteProject.isPending]
  )

  const totalBudget = projects.reduce((sum, project) => sum + (project.budget ?? 0), 0)
  const activeProjects = projects.filter((p) => normalizeProjectStatus(p.status) === 'active').length
  const completedProjects = projects.filter((p) => normalizeProjectStatus(p.status) === 'completed').length

  return (
    <ResourceListPage
      fadeDelay={200}
      fadeDuration={800}
      title="Projects Management"
      actions={
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate({ to: '/projects/create' })}>
          Create New Project
        </Button>
      }
    >
      <ListStatsGrid compact={compactList}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Assignment color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 300 }}>{projects.length}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>Total Projects</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp color="success" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 300 }}>{activeProjects}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>Active Projects</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Schedule color="info" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 300 }}>{completedProjects}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>Completed</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoney color="warning" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 300 }}>${(totalBudget / 1000).toFixed(0)}k</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>Total Budget</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </ListStatsGrid>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(error as Error)?.message || 'Failed to load projects.'}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl fullWidth>
            <InputLabel id="projects-status-filter-label">Status</InputLabel>
            <Select
              labelId="projects-status-filter-label"
              id="projects-status-filter"
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="planning">Planning</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="on-hold">On Hold</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable<ProjectDto>
          columns={columns}
          rows={filteredProjects}
          getRowId={(r) => r.id}
          compact={compactList}
          isDesktop={smUp}
          emptyMessage="No projects match your filters."
          defaultRowsPerPage={10}
          renderMobileRow={(project) => (
            <Card variant="outlined">
              <CardContent sx={{ display: 'grid', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">{project.name}</Typography>
                  <Chip
                    label={getStatusLabel(project.status ?? '')}
                    color={getStatusColor(project.status ?? '') as 'success' | 'default' | 'info' | 'warning'}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {project.client ?? '—'} • Manager: {project.manager ?? '—'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: '100%' }}>
                    <LinearProgress
                      variant="determinate"
                      value={project.progress ?? 0}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">{project.progress ?? 0}%</Typography>
                </Box>
                <Typography variant="body2">
                  Budget: <strong>${(project.budget ?? 0).toLocaleString()}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'} -{' '}
                  {project.endDate ? new Date(project.endDate).toLocaleDateString() : '—'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button size="small" onClick={() => toProject(project.id)} startIcon={<Visibility />}>
                    View
                  </Button>
                  <Button size="small" onClick={() => toEdit(project.id)} startIcon={<Edit />}>
                    Edit
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        />
      )}

      <ListSummaryFooter
        primary={
          <Typography variant="body2" color="text.secondary">
            Showing {filteredProjects.length} of {projects.length} projects
          </Typography>
        }
      >
        <Typography variant="body2" color="text.secondary">
          Total Budget: <strong>${totalBudget.toLocaleString()}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">Active: <strong>{activeProjects}</strong></Typography>
        <Typography variant="body2" color="text.secondary">Completed: <strong>{completedProjects}</strong></Typography>
      </ListSummaryFooter>
    </ResourceListPage>
  )
}

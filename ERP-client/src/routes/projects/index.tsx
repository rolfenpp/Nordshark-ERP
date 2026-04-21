import { createFileRoute } from '@tanstack/react-router'
import { ResourceListPage } from '../../components/ResourceListPage'
import { ListStatsGrid } from '../../components/ListStatsGrid'
import { ListSummaryFooter } from '../../components/ListSummaryFooter'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  LinearProgress,
  Select,
  MenuItem
} from '@mui/material'
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  Assignment,
  TrendingUp,
  Schedule,
  AttachMoney
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useCompactListLayout } from '../../hooks/useCompactListLayout'
import { LIST_SEARCH_DEBOUNCE_MS } from '../../lib/listBreakpoints'

export const Route = createFileRoute('/projects/')({
  component: ProjectsIndexComponent,
})

const MOCK_PROJECTS = [
  {
    id: 1,
    name: 'Website Redesign',
    client: 'TechCorp Inc.',
    status: 'active',
    progress: 75,
    startDate: '2024-01-15',
    endDate: '2024-04-15',
    budget: 25000,
    manager: 'John Doe'
  },
  {
    id: 2,
    name: 'Mobile App Development',
    client: 'StartupXYZ',
    status: 'planning',
    progress: 20,
    startDate: '2024-02-01',
    endDate: '2024-08-01',
    budget: 50000,
    manager: 'Jane Smith'
  },
  {
    id: 3,
    name: 'E-commerce Platform',
    client: 'Retail Solutions',
    status: 'completed',
    progress: 100,
    startDate: '2023-09-01',
    endDate: '2024-01-31',
    budget: 75000,
    manager: 'Bob Johnson'
  },
  {
    id: 4,
    name: 'Data Migration',
    client: 'Enterprise Corp',
    status: 'on-hold',
    progress: 45,
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    budget: 30000,
    manager: 'Alice Brown'
  }
] as const

function ProjectsIndexComponent() {
  const navigate = useNavigate()
  const theme = useTheme()

  const smUp = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true })
  const compactList = useCompactListLayout()

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebouncedValue(searchQuery, LIST_SEARCH_DEBOUNCE_MS)
  const [filterStatus, setFilterStatus] = useState('all')

  const projects = MOCK_PROJECTS

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'planning': return 'info'
      case 'completed': return 'default'
      case 'on-hold': return 'warning'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active'
      case 'planning': return 'Planning'
      case 'completed': return 'Completed'
      case 'on-hold': return 'On Hold'
      default: return status
    }
  }

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                           project.client.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [projects, debouncedSearchQuery, filterStatus])

  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0)
  const activeProjects = projects.filter(project => project.status === 'active').length
  const completedProjects = projects.filter(project => project.status === 'completed').length

  return (
    <ResourceListPage
      fadeDelay={200}
      fadeDuration={800}
      title="Projects"
      actions={
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate({ to: '/projects/create' })}
        >
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
                <Typography variant="h4">{projects.length}</Typography>
                <Typography variant="body2" color="text.secondary">Total Projects</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp color="success" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">{activeProjects}</Typography>
                <Typography variant="body2" color="text.secondary">Active Projects</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Schedule color="info" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">{completedProjects}</Typography>
                <Typography variant="body2" color="text.secondary">Completed</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoney color="warning" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">${(totalBudget / 1000).toFixed(0)}k</Typography>
                <Typography variant="body2" color="text.secondary">Total Budget</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </ListStatsGrid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 2,
          alignItems: 'center'
        }}>
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
          <Select
            fullWidth
            label="Status Filter"
            id="status-filter-label"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="planning">Planning</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="on-hold">On Hold</MenuItem>
          </Select>
        </Box>
      </Paper>

      {smUp ? (
        <Paper sx={{ width: '100%' }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table stickyHeader size={compactList ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>Project Name</TableCell>

                  <TableCell sx={{ display: compactList ? 'none' : 'table-cell', whiteSpace: 'nowrap' }}>
                    Client
                  </TableCell>
                  <TableCell sx={{ display: compactList ? 'none' : 'table-cell', whiteSpace: 'nowrap' }}>
                    Manager
                  </TableCell>

                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>

                  <TableCell
                    align="right"
                    sx={{ display: compactList ? 'none' : 'table-cell', whiteSpace: 'nowrap' }}
                  >
                    Budget
                  </TableCell>
                  <TableCell sx={{ display: compactList ? 'none' : 'table-cell', whiteSpace: 'nowrap' }}>
                    Timeline
                  </TableCell>

                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ cursor: 'pointer' }}
                          onClick={() => navigate({ to: `/projects/${project.id}` })}
                        >
                          {project.name}
                        </Typography>
                        {compactList && (
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {project.client}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Manager: {project.manager}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell sx={{ display: compactList ? 'none' : 'table-cell' }}>
                      {project.client}
                    </TableCell>
                    <TableCell sx={{ display: compactList ? 'none' : 'table-cell' }}>
                      {project.manager}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getStatusLabel(project.status)}
                        color={getStatusColor(project.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={project.progress}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {project.progress}%
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{ display: compactList ? 'none' : 'table-cell', whiteSpace: 'nowrap' }}
                    >
                      ${project.budget.toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ display: compactList ? 'none' : 'table-cell' }}>
                      <Typography variant="body2">
                        {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => navigate({ to: `/projects/${project.id}` })}
                          color="primary"
                        >
                          <Visibility />
                        </IconButton>

                        <Box sx={{ display: compactList ? 'none' : 'inline-flex' }}>
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate({
                                to: '/projects/edit/$projectId',
                                params: { projectId: String(project.id) },
                              })
                            }
                            color="warning"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => console.log('Delete project:', project.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gap: 2 }}>
          {filteredProjects.map((project) => (
            <Card key={project.id} variant="outlined">
              <CardContent sx={{ display: 'grid', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">{project.name}</Typography>
                  <Chip
                    label={getStatusLabel(project.status)}
                    color={getStatusColor(project.status)}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {project.client} • Manager: {project.manager}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: '100%' }}>
                    <LinearProgress
                      variant="determinate"
                      value={project.progress}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {project.progress}%
                  </Typography>
                </Box>
                <Typography variant="body2">
                  Budget: <strong>${project.budget.toLocaleString()}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button
                    size="small"
                    onClick={() => navigate({ to: `/projects/${project.id}` })}
                    startIcon={<Visibility />}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    onClick={() =>
                      navigate({
                        to: '/projects/edit/$projectId',
                        params: { projectId: String(project.id) },
                      })
                    }
                    startIcon={<Edit />}
                  >
                    Edit
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
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
        <Typography variant="body2" color="text.secondary">
          Active: <strong>{activeProjects}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Completed: <strong>{completedProjects}</strong>
        </Typography>
      </ListSummaryFooter>
    </ResourceListPage>
  )
}

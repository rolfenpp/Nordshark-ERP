import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { FadeInContent } from '@/components/FadeInContent'
import { DetailPageHeader } from '@/components/DetailPageHeader'
import { Box, Typography, Paper, Chip, LinearProgress, List, ListItem, ListItemText, ListItemIcon, IconButton, Tabs, Tab, Alert } from '@mui/material'
import { Edit, Delete, Assignment, Person, AttachMoney, TrendingUp, Share } from '@mui/icons-material'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useProject, useDeleteProject } from '@/api/projects'

export const Route = createFileRoute('/projects/$projectId')({
  component: ProjectDetailComponent,
})

function ProjectDetailComponent() {
  const navigate = useNavigate()
  const { projectId: projectIdParam } = Route.useParams()
  const id = Number(projectIdParam)
  const [activeTab, setActiveTab] = useState(0)
  const { data: p, isLoading, isError, error } = useProject(id)
  const deleteProject = useDeleteProject()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'completed':
        return 'primary'
      case 'planning':
        return 'info'
      case 'on-hold':
        return 'warning'
      case 'pending':
        return 'warning'
      default:
        return 'primary'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'success'
      case 'medium':
        return 'warning'
      case 'high':
        return 'error'
      case 'urgent':
        return 'error'
      default:
        return 'default'
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Box sx={{ p: 3 }}>
            <Typography>Loading project…</Typography>
          </Box>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (isError || !p) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{(error as Error)?.message || 'Project not found.'}</Alert>
          </Box>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <FadeInContent delay={200} duration={800}>
          <Box>
            <DetailPageHeader
              backLabel="Back to Projects"
              onBack={() => navigate({ to: '/projects/' })}
              title={p.name}
            >
              <IconButton
                onClick={() => navigate({ to: '/projects/edit/$projectId', params: { projectId: projectIdParam } })}
                color="primary"
                aria-label="Edit project"
              >
                <Edit />
              </IconButton>
              <IconButton onClick={() => console.log('Share project')} color="info" aria-label="Share project">
                <Share />
              </IconButton>
              <IconButton
                onClick={() => {
                  if (confirm('Delete this project?')) {
                    deleteProject.mutate(p.id, {
                      onSuccess: () => navigate({ to: '/projects/' }),
                    })
                  }
                }}
                color="error"
                aria-label="Delete project"
              >
                <Delete />
              </IconButton>
            </DetailPageHeader>

            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={(_e, v) => setActiveTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
              >
                <Tab label="Overview" />
                <Tab label="Files" />
              </Tabs>
            </Paper>

            {activeTab === 0 && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
                  gap: 3,
                }}
              >
                <Box>
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Project overview
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {p.description || '—'}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Progress
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress variant="determinate" value={p.progress} sx={{ height: 10, borderRadius: 5 }} />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                          {p.progress}%
                        </Typography>
                      </Box>
                    </Box>
                    {p.tags && (
                      <Typography variant="body2" color="text.secondary">
                        Tags: {p.tags}
                      </Typography>
                    )}
                  </Paper>
                </Box>

                <Box>
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Details
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <Assignment color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Client"
                          secondary={p.client || '—'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Assignment color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Status"
                          secondary={
                            <Chip label={p.status || '—'} color={getStatusColor((p.status ?? '').toLowerCase()) as 'success' | 'primary' | 'info' | 'warning'} size="small" />
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <TrendingUp color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Priority"
                          secondary={
                            p.priority ? (
                              <Chip
                                label={p.priority}
                                color={getPriorityColor(p.priority.toLowerCase()) as 'success' | 'warning' | 'error' | 'default'}
                                size="small"
                              />
                            ) : (
                              '—'
                            )
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Person color="info" />
                        </ListItemIcon>
                        <ListItemText primary="Manager" secondary={p.manager || '—'} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <AttachMoney color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Budget" secondary={p.budget != null ? `$${p.budget.toLocaleString()}` : '—'} />
                      </ListItem>
                    </List>
                    <Box sx={{ mt: 2, display: 'grid', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Start: {p.startDate ? new Date(p.startDate).toLocaleDateString() : '—'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        End: {p.endDate ? new Date(p.endDate).toLocaleDateString() : '—'}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Box>
            )}

            {activeTab === 1 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Files
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  File attachments are not stored in the API yet.
                </Typography>
              </Paper>
            )}
          </Box>
        </FadeInContent>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

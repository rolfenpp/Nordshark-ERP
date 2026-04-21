import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../../components/DashboardLayout'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import { FadeInContent } from '../../components/FadeInContent'
import { DetailPageHeader } from '../../components/DetailPageHeader'
import {
  Box,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import {
  Edit,
  Delete,
  Assignment,
  Person,
  Schedule,
  AttachMoney,
  TrendingUp,
  Share
} from '@mui/icons-material'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/projects/$projectId')({
  component: ProjectDetailComponent,
})

function ProjectDetailComponent() {
  const navigate = useNavigate()
  const { projectId } = Route.useParams()
  const [activeTab, setActiveTab] = useState(0)

  // Mock data for demonstration
  const project = {
    id: projectId,
    name: 'Website Redesign',
    description: 'Complete redesign of the company website with modern UI/UX, responsive design, and improved performance. The project includes new branding elements, content management system integration, and SEO optimization.',
    client: 'TechCorp Inc.',
    status: 'active',
    priority: 'high',
    progress: 75,
    startDate: '2024-01-15',
    endDate: '2024-04-15',
    budget: 25000,
    spent: 18750,
    manager: 'John Doe',
    team: [
      { name: 'John Doe', role: 'Project Manager', avatar: 'JD' },
      { name: 'Jane Smith', role: 'UI/UX Designer', avatar: 'JS' },
      { name: 'Bob Johnson', role: 'Frontend Developer', avatar: 'BJ' },
      { name: 'Alice Brown', role: 'Backend Developer', avatar: 'AB' }
    ],
    milestones: [
      { name: 'Design Phase', status: 'completed', date: '2024-02-15' },
      { name: 'Development Phase', status: 'active', date: '2024-03-15' },
      { name: 'Testing Phase', status: 'pending', date: '2024-04-01' },
      { name: 'Launch', status: 'pending', date: '2024-04-15' }
    ],
    tasks: [
      { name: 'Wireframe Design', status: 'completed', assignee: 'Jane Smith', dueDate: '2024-02-01' },
      { name: 'UI Design', status: 'completed', assignee: 'Jane Smith', dueDate: '2024-02-15' },
      { name: 'Frontend Development', status: 'active', assignee: 'Bob Johnson', dueDate: '2024-03-15' },
      { name: 'Backend API', status: 'active', assignee: 'Alice Brown', dueDate: '2024-03-20' },
      { name: 'Testing & QA', status: 'pending', assignee: 'John Doe', dueDate: '2024-04-01' }
    ]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'completed': return 'primary'
      case 'pending': return 'warning'
      default: return 'primary'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'success'
      case 'medium': return 'warning'
      case 'high': return 'error'
      case 'urgent': return 'error'
      default: return 'default'
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const renderTabContent = (tab: number) => {
    switch (tab) {
      case 0:
        return (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, 
            gap: 3 
          }}>
            <Box>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Project Overview
                </Typography>
                <Typography variant="body1" paragraph>
                  {project.description}
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Progress
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={project.progress} 
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {project.progress}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Start Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(project.startDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      End Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(project.endDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Tasks
                </Typography>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Task</TableCell>
                        <TableCell>Assignee</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Due Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {project.tasks.map((task, index) => (
                        <TableRow key={index}>
                          <TableCell>{task.name}</TableCell>
                          <TableCell>{task.assignee}</TableCell>
                          <TableCell>
                            <Chip
                              label={task.status}
                              color={getStatusColor(task.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>

            <Box>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Project Details
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Assignment color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Status"
                      secondary={
                        <Chip
                          label={project.status}
                          color={getStatusColor(project.status)}
                          size="small"
                        />
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
                        <Chip
                          label={project.priority}
                          color={getPriorityColor(project.priority)}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Person color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Manager"
                      secondary={project.manager}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AttachMoney color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Budget"
                      secondary={`$${project.budget.toLocaleString()}`}
                    />
                  </ListItem>
                </List>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Team Members
                </Typography>
                <List>
                  {project.team.map((member, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Avatar>{member.avatar}</Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={member.name}
                        secondary={member.role}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>
          </Box>
        )

      case 1:
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Milestones
            </Typography>
            <List>
              {project.milestones.map((milestone, index) => (
                <Box key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <Schedule color={getStatusColor(milestone.status)} />
                    </ListItemIcon>
                    <ListItemText
                      primary={milestone.name}
                      secondary={new Date(milestone.date).toLocaleDateString()}
                    />
                    <Chip
                      label={milestone.status}
                      color={getStatusColor(milestone.status)}
                      size="small"
                    />
                  </ListItem>
                  {index < project.milestones.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        )

      case 2:
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Project Files & Documents
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No files uploaded yet. Upload project documents, designs, and specifications here.
            </Typography>
          </Paper>
        )

      default:
        return null
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <FadeInContent delay={200} duration={800}>
          <Box>
            <DetailPageHeader
              backLabel="Back to Projects"
              onBack={() => navigate({ to: '/projects/' })}
              title={project.name}
            >
              <IconButton
                onClick={() =>
                  navigate({
                    to: '/projects/edit/$projectId',
                    params: { projectId },
                  })
                }
                color="primary"
                aria-label="Edit project"
              >
                <Edit />
              </IconButton>
              <IconButton onClick={() => console.log('Share project')} color="info" aria-label="Share project">
                <Share />
              </IconButton>
              <IconButton onClick={() => console.log('Delete project')} color="error" aria-label="Delete project">
                <Delete />
              </IconButton>
            </DetailPageHeader>

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
              >
                <Tab label="Overview" />
                <Tab label="Milestones" />
                <Tab label="Files" />
              </Tabs>
            </Paper>

            {/* Tab Content */}
            {renderTabContent(activeTab)}
          </Box>
        </FadeInContent>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../../components/DashboardLayout'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import { FadeInContent } from '../../components/FadeInContent'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider
} from '@mui/material'
import {
  Save,
  Cancel,
  ArrowBack,
  AttachMoney
} from '@mui/icons-material'
import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/projects/edit/$projectId')({
  component: EditProjectComponent,
})

function EditProjectComponent() {
  const navigate = useNavigate()
  const { projectId } = Route.useParams()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    manager: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
    budget: '',
    tags: '',
    isPublic: false,
    allowComments: true
  })
  const [loading, setLoading] = useState(true)

  // Mock data for demonstration
  const mockProject = {
    id: projectId,
    name: 'Website Redesign',
    description: 'Complete redesign of the company website with modern UI/UX, responsive design, and improved performance.',
    client: 'TechCorp Inc.',
    status: 'active',
    priority: 'high',
    startDate: '2024-01-15',
    endDate: '2024-04-15',
    budget: 25000,
    tags: 'web, design, responsive, cms',
    isPublic: false,
    allowComments: true
  }

  useEffect(() => {
    // Set project data immediately
    setFormData({
      name: mockProject.name,
      description: mockProject.description,
      client: mockProject.client,
      manager: 'John Doe', // This would come from the project data
      status: mockProject.status,
      priority: mockProject.priority,
      startDate: mockProject.startDate,
      endDate: mockProject.endDate,
      budget: mockProject.budget.toString(),
      tags: mockProject.tags,
      isPublic: mockProject.isPublic,
      allowComments: mockProject.allowComments
    })
    setLoading(false)
  }, [projectId])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = () => {
    console.log('Updated project data:', formData)
    // Here you would typically update the backend
    navigate({ to: `/projects/${projectId}` })
  }

  const handleCancel = () => {
    navigate({ to: `/projects/${projectId}` })
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <Typography>Loading project data...</Typography>
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
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate({ to: `/projects/${projectId}` })}
                sx={{ mr: 2 }}
              >
                Back to Project
              </Button>
              <Typography variant="h4" component="h1">
                Edit Project
              </Typography>
            </Box>

            {/* Form */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Project Information
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                gap: 3 
              }}>
                <Box>
                  <TextField
                    fullWidth
                    label="Project Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    helperText="Enter a descriptive name for your project"
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Client"
                    value={formData.client}
                    onChange={(e) => handleInputChange('client', e.target.value)}
                    required
                    helperText="Who is this project for?"
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    helperText="Describe the project goals and requirements"
                  />
                </Box>
                <Box>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      label="Status"
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <MenuItem value="planning">Planning</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="on-hold">On Hold</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={formData.priority}
                      label="Priority"
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    type="date"
                    label="Start Date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    type="date"
                    label="End Date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Budget"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    type="number"
                    InputProps={{
                      startAdornment: <AttachMoney />,
                    }}
                    helperText="Enter the total project budget"
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Project Manager"
                    value={formData.manager}
                    onChange={(e) => handleInputChange('manager', e.target.value)}
                    required
                    helperText="Who will manage this project?"
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                  <TextField
                    fullWidth
                    label="Tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    helperText="Separate tags with commas (e.g., web, mobile, design)"
                  />
                </Box>
              </Box>
            </Paper>

            {/* Settings */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Project Settings
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                gap: 3 
              }}>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isPublic}
                        onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                      />
                    }
                    label="Make project public"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    Public projects can be viewed by all team members
                  </Typography>
                </Box>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.allowComments}
                        onChange={(e) => handleInputChange('allowComments', e.target.checked)}
                      />
                    }
                    label="Allow comments and discussions"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    Team members can comment on project updates
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Summary Card */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Project Summary
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip label={formData.name || 'Project Name'} color="primary" />
                    <Chip label={formData.client || 'Client'} color="secondary" />
                    <Chip label={formData.status || 'Status'} color="info" />
                    <Chip label={formData.priority || 'Priority'} color="warning" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {formData.description || 'No description provided'}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: 2 
                  }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Start Date: {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'Not set'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        End Date: {formData.endDate ? new Date(formData.endDate).toLocaleDateString() : 'Not set'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Budget: {formData.budget ? `$${parseInt(formData.budget).toLocaleString()}` : 'Not set'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Manager: {formData.manager || 'Not assigned'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Paper>

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<Cancel />}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={<Save />}
              >
                Save Changes
              </Button>
            </Box>

            {/* Info Alert */}
            <Alert severity="info" sx={{ mt: 3 }}>
              Changes will be applied immediately. You can always revert changes from the project history.
            </Alert>
          </Box>
        </FadeInContent>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

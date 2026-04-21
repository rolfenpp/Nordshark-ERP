import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../../components/DashboardLayout'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import { FadeInContent } from '../../components/FadeInContent'
import { DetailPageHeader } from '../../components/DetailPageHeader'
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
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip
} from '@mui/material'
import {
  Save,
  Cancel,
  AttachMoney
} from '@mui/icons-material'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/projects/create')({
  component: CreateProjectComponent,
})

function CreateProjectComponent() {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
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

  const steps = ['Basic Information', 'Timeline & Budget', 'Team & Settings']

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleSubmit = () => {
    console.log('Project data:', formData)
    navigate({ to: '/projects/' })
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Project Details
              </Typography>
            </Box>
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
            </Box>
            <Box>
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
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
              gap: 3 
            }}>
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
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Tags"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                helperText="Separate tags with commas (e.g., web, mobile, design)"
              />
            </Box>
          </Box>
        )

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Timeline & Budget
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
              gap: 3 
            }}>
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
            </Box>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
              gap: 3 
            }}>
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
            </Box>
          </Box>
        )

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Team & Settings
              </Typography>
            </Box>
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
            <Box>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Project Summary
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip label={formData.name || 'Project Name'} color="primary" />
                    <Chip label={formData.client || 'Client'} color="secondary" />
                    <Chip label={formData.status || 'Status'} color="info" />
                    <Chip label={formData.priority || 'Priority'} color="warning" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {formData.description || 'No description provided'}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
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
            <DetailPageHeader showBack={false} title="Create New Project" />

            <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, overflowX: 'auto' }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              {renderStepContent(activeStep)}
            </Paper>

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 2,
              }}
            >
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ width: { xs: '100%', sm: 'auto' }, minHeight: { xs: 44, sm: 36 } }}
              >
                Back
              </Button>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1,
                  width: { xs: '100%', sm: 'auto' },
                  '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' }, minHeight: { xs: 44, sm: 36 } },
                }}
              >
                <Button variant="outlined" onClick={() => navigate({ to: '/projects/' })} startIcon={<Cancel />}>
                  Cancel
                </Button>
                {activeStep === steps.length - 1 ? (
                  <Button variant="contained" onClick={handleSubmit} startIcon={<Save />}>
                    Create Project
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext}>
                    Next
                  </Button>
                )}
              </Box>
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              You can always edit these details later from the project settings.
            </Alert>
          </Box>
        </FadeInContent>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

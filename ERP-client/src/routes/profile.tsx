import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../components/DashboardLayout'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { Box, Typography, Paper, Avatar, TextField, Button, Divider } from '@mui/material'
import { AccountCircle, Email, Business, Phone } from '@mui/icons-material'

export const Route = createFileRoute('/profile')({
  component: ProfileComponent,
})

function ProfileComponent() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Box>
          <Typography variant="h4" gutterBottom>
            Profile
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}>
                <AccountCircle sx={{ fontSize: 100 }} />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                John Doe
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Administrator
              </Typography>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  defaultValue="John"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  defaultValue="Doe"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Email"
                  defaultValue="guest@nordshark.com"
                  margin="normal"
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}
                />
                <TextField
                  fullWidth
                  label="Company"
                  defaultValue="Guest Corp"
                  margin="normal"
                  InputProps={{
                    startAdornment: <Business sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <TextField
                  fullWidth
                  label="Phone"
                  defaultValue="+1 (555) 123-4567"
                  margin="normal"
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Box>

              <Box sx={{ mt: 3 }}>
                <Button variant="contained" sx={{ mr: 2 }}>
                  Save Changes
                </Button>
                <Button variant="outlined">
                  Cancel
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

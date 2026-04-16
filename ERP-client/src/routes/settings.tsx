import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../components/DashboardLayout'
import { ProtectedRoute } from '../components/ProtectedRoute'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material'
import { Save, Notifications, Security, Palette } from '@mui/icons-material'
import { useState } from 'react'

export const Route = createFileRoute('/settings')({
  component: SettingsComponent,
})

function SettingsComponent() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false
  })
  
  const [theme, setTheme] = useState('light')
  const [language, setLanguage] = useState('en')
  const [autoSave, setAutoSave] = useState(true)

  const handleSave = () => {
    console.log('Settings saved:', { notifications, theme, language, autoSave })
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Settings
            </Typography>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </Box>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
            gap: 3 
          }}>
            <Box>
              <Card>
                <CardHeader
                  avatar={<Notifications />}
                  title="Notifications"
                  subheader="Configure how you receive notifications"
                />
                <CardContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.email}
                        onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                      />
                    }
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.push}
                        onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                      />
                    }
                    label="Push Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.sms}
                        onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                      />
                    }
                    label="SMS Notifications"
                  />
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Card>
                <CardHeader
                  avatar={<Palette />}
                  title="Appearance"
                  subheader="Customize the look and feel"
                />
                <CardContent>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Theme</InputLabel>
                    <Select
                      value={theme}
                      label="Theme"
                      onChange={(e) => setTheme(e.target.value)}
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="auto">Auto</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={language}
                      label="Language"
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="es">Spanish</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                      <MenuItem value="de">German</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Card>
                <CardHeader
                  avatar={<Security />}
                  title="General"
                  subheader="General application settings"
                />
                <CardContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoSave}
                        onChange={(e) => setAutoSave(e.target.checked)}
                      />
                    }
                    label="Auto-save changes"
                  />
                  <TextField
                    fullWidth
                    label="Session Timeout (minutes)"
                    type="number"
                    defaultValue={30}
                    sx={{ mt: 2 }}
                  />
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Card>
                <CardHeader
                  title="System Information"
                  subheader="Current system details"
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Version:</strong> 1.0.0
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Database:</strong> PostgreSQL 14.0
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Environment:</strong> Development
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mt: 3 }}>
            Changes will take effect after saving. Some settings may require a page refresh.
          </Alert>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

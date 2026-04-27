import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  TextField,
  Card,
  CardContent,
  Chip
} from '@mui/material'
import {
  ExpandMore,
  Book,
  VideoLibrary,
  ContactSupport,
  Search,
  Article,
  Troubleshoot
} from '@mui/icons-material'
import { useState } from 'react'

export const Route = createFileRoute('/help')({
  component: HelpComponent,
})

function HelpComponent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expanded, setExpanded] = useState<string | false>('panel1')

  const handleAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }

  const faqData = [
    {
      question: 'How do I create a new invoice?',
      answer: 'Navigate to the Invoices section and click the "Create Invoice" button. Fill in the required fields including client information, items, and payment terms.'
    },
    {
      question: 'How can I manage user permissions?',
      answer: 'Go to the Users section and click on the user you want to modify. You can change their role and permissions from the user details page.'
    },
    {
      question: 'How do I export data?',
      answer: 'Most data tables have an export button in the top right corner. You can export to CSV, Excel, or PDF format depending on the data type.'
    },
    {
      question: 'What should I do if I forget my password?',
      answer: 'Click on the "Forgot Password" link on the login page. You will receive a password reset link via email.'
    }
  ]

  const quickActions = [
    { title: 'User Guide', icon: <Book />, description: 'Complete user manual', color: 'primary' },
    { title: 'Video Tutorials', icon: <VideoLibrary />, description: 'Step-by-step video guides', color: 'secondary' },
    { title: 'Contact Support', icon: <ContactSupport />, description: 'Get help from our team', color: 'success' },
    { title: 'Troubleshooting', icon: <Troubleshoot />, description: 'Common issues and solutions', color: 'warning' }
  ]

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Box>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 300 }}>
              Help & Support
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Find answers to common questions and get help when you need it
            </Typography>
          </Box>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Search color="action" />
              <TextField
                fullWidth
                placeholder="Search for help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                size="small"
              />
            </Box>
          </Paper>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
            gap: 3, 
            mb: 4 
          }}>
            {quickActions.map((action, index) => (
              <Box key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    cursor: 'pointer',
                    '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ color: `${action.color}.main`, mb: 1 }}>
                      {action.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>

          <Paper sx={{ mb: 4 }}>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h5" component="h2">
                Frequently Asked Questions
              </Typography>
            </Box>
            
            {faqData.map((faq, index) => (
              <Accordion
                key={index}
                expanded={expanded === `panel${index + 1}`}
                onChange={handleAccordionChange(`panel${index + 1}`)}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1">{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>

          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Getting Started
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Article color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Complete your profile setup"
                  secondary="Add your company information and preferences"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Article color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Create your first project"
                  secondary="Set up a project to start tracking work and invoices"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Article color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Add team members"
                  secondary="Invite colleagues to collaborate on projects"
                />
              </ListItem>
            </List>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Still Need Help?
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
              gap: 3 
            }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Contact Support
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Our support team is available Monday through Friday, 9 AM - 6 PM EST.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="Email: support@nordshark.com" variant="outlined" />
                  <Chip label="Phone: +46 8 123 456 78" variant="outlined" />
                  <Chip label="Live Chat Available" color="success" />
                </Box>
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Submit a Ticket
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Can't find what you're looking for? Submit a support ticket and we'll get back to you within 24 hours.
                </Typography>
                <Button variant="contained" startIcon={<ContactSupport />}>
                  Submit Support Ticket
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

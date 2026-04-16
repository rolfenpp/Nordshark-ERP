import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../components/DashboardLayout'
import { ProtectedRoute } from '../components/ProtectedRoute'
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
  Tooltip
} from '@mui/material'
import { Add, Edit, Delete, Visibility, Search, Person, AdminPanelSettings, SupervisorAccount, PersonAdd } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useState, useEffect, useMemo } from 'react'
import { FadeInContent } from '../components/FadeInContent'

export const Route = createFileRoute('/users')({
  component: UsersComponent,
})

function UsersComponent() {
  const theme = useTheme()
  
  const smUp = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true })
  const compact1410 = useMediaQuery('(max-width:1410px)', { noSsr: true })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', lastLogin: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'manager', status: 'active', lastLogin: '2024-01-14' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', status: 'inactive', lastLogin: '2024-01-10' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'user', status: 'active', lastLogin: '2024-01-15' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'manager', status: 'active', lastLogin: '2024-01-13' },
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 200)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const filteredUsers = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return users
    
    return users.filter(user =>
      user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  }, [users, debouncedSearchTerm])

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error'
      case 'manager': return 'warning'
      case 'user': return 'default'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'default'
  }

  const totalUsers = users.length
  const activeUsers = users.filter(user => user.status === 'active').length
  const adminUsers = users.filter(user => user.role === 'admin').length
  const managerUsers = users.filter(user => user.role === 'manager').length

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <FadeInContent delay={100} duration={600}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" component="h1">
                Users Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => console.log('Add user clicked')}
              >
                Add User
              </Button>
            </Box>

            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                md: compact1410 ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)' 
              }, 
              gap: 3, 
              mb: 4 
            }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4">{totalUsers}</Typography>
                      <Typography variant="body2" color="text.secondary">Total Users</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonAdd color="success" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4">{activeUsers}</Typography>
                      <Typography variant="body2" color="text.secondary">Active Users</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AdminPanelSettings color="error" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4">{adminUsers}</Typography>
                      <Typography variant="body2" color="text.secondary">Admins</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SupervisorAccount color="warning" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4">{managerUsers}</Typography>
                      <Typography variant="body2" color="text.secondary">Managers</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
              <TextField
                fullWidth
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
            </Paper>

            {smUp ? (
              <Paper sx={{ width: '100%' }}>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table stickyHeader size={compact1410 ? 'small' : 'medium'}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>Name</TableCell>
                        
                        <TableCell sx={{ display: compact1410 ? 'none' : 'table-cell', whiteSpace: 'nowrap' }}>
                          Email
                        </TableCell>

                        <TableCell>Role</TableCell>
                        <TableCell>Status</TableCell>
                        
                        <TableCell sx={{ display: compact1410 ? 'none' : 'table-cell', whiteSpace: 'nowrap' }}>
                          Last Login
                        </TableCell>
                        
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} hover>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {user.name}
                              </Typography>
                              {compact1410 && (
                                <Typography variant="caption" color="text.secondary">
                                  {user.email}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          <TableCell sx={{ display: compact1410 ? 'none' : 'table-cell' }}>
                            {user.email}
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={user.role}
                              color={getRoleColor(user.role)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.status}
                              color={getStatusColor(user.status)}
                              size="small"
                            />
                          </TableCell>

                          <TableCell sx={{ display: compact1410 ? 'none' : 'table-cell' }}>
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </TableCell>

                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Tooltip title="View User">
                                <IconButton
                                  size="small"
                                  onClick={() => console.log('View user:', user.id)}
                                  color="primary"
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>

                              <Box sx={{ display: compact1410 ? 'none' : 'inline-flex' }}>
                                <Tooltip title="Edit User">
                                  <IconButton
                                    size="small"
                                    onClick={() => console.log('Edit user:', user.id)}
                                    color="warning"
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete User">
                                  <IconButton
                                    size="small"
                                    onClick={() => console.log('Delete user:', user.id)}
                                    color="error"
                                  >
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
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
                {filteredUsers.map((user) => (
                  <Card key={user.id} variant="outlined">
                    <CardContent sx={{ display: 'grid', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1">{user.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip
                            label={user.role}
                            color={getRoleColor(user.role)}
                            size="small"
                          />
                          <Chip
                            label={user.status}
                            color={getStatusColor(user.status)}
                            size="small"
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Last login: {new Date(user.lastLogin).toLocaleDateString()}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button
                          size="small"
                          onClick={() => console.log('View user:', user.id)}
                          startIcon={<Visibility />}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          onClick={() => console.log('Edit user:', user.id)}
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

            <Paper sx={{ p: 2, mt: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredUsers.length} of {users.length} users
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="body2" color="text.secondary">
                    Active: <strong>{activeUsers}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Admins: <strong>{adminUsers}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Managers: <strong>{managerUsers}</strong>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </FadeInContent>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

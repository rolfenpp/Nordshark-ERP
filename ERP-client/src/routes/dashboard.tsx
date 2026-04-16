import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../components/DashboardLayout'
import { ProtectedRoute } from '../components/ProtectedRoute'

import { FadeInContent } from '../components/FadeInContent'
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemIcon,
  Chip,
  Avatar,
  Divider,
  IconButton
} from '@mui/material'
import {
  AttachMoney,
  Receipt,
  People,
  Schedule,
  CheckCircle,
  Warning,
  Error,
  MoreVert,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material'
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useTheme } from '@mui/material'

export const Route = createFileRoute('/dashboard')({
  component: DashboardComponent,
})

function DashboardComponent() {
  const theme = useTheme()
  const stats = {
    totalInvoices: 1234,
    totalValue: 45678,
    activeUsers: 89,
    pendingAmount: 12345,
    monthlyGrowth: 12.5,
    overdueInvoices: 23,
    completedProjects: 45,
    activeProjects: 12
  }

  const revenueData = [
    { month: 'Jan', revenue: 6000 },
    { month: 'Feb', revenue: 6500 },
    { month: 'Mar', revenue: 8500 },
    { month: 'Apr', revenue: 10000 },
    { month: 'May', revenue: 9500 },
    { month: 'Jun', revenue: 11500 },
    { month: 'Jul', revenue: 13500 },
    { month: 'Aug', revenue: 12450 }
  ]

  const invoiceStatusData = [
    { name: 'Paid', value: 45, color: theme.palette.success.main },
    { name: 'Pending', value: 30, color: theme.palette.warning.main },
    { name: 'Overdue', value: 15, color: theme.palette.error.main },
    { name: 'Draft', value: 10, color: theme.palette.info.main }
  ]

  const recentActivities = [
    { id: 1, type: 'invoice', action: 'Invoice #INV-001 created', user: 'John Doe', time: '2 hours ago', status: 'success' },
    { id: 2, type: 'payment', action: 'Payment received for INV-002', user: 'Jane Smith', time: '4 hours ago', status: 'success' },
    { id: 3, type: 'project', action: 'Project "Website Redesign" updated', user: 'Bob Johnson', time: '6 hours ago', status: 'warning' },
    { id: 4, type: 'user', action: 'New user account created', user: 'Alice Brown', time: '8 hours ago', status: 'info' },
    { id: 5, type: 'invoice', action: 'Invoice #INV-003 overdue', user: 'Charlie Wilson', time: '1 day ago', status: 'error' }
  ]

  const topClients = [
    { name: 'TechCorp Inc.', value: 12500, growth: 8.5, invoices: 23 },
    { name: 'StartupXYZ', value: 8900, growth: 15.2, invoices: 18 },
    { name: 'Enterprise Corp', value: 6700, growth: -2.1, invoices: 15 },
    { name: 'Retail Solutions', value: 5400, growth: 12.8, invoices: 12 }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle color="success" />
      case 'warning': return <Warning color="warning" />
      case 'error': return <Error color="error" />
      case 'info': return <Schedule color="info" />
      default: return <Schedule color="info" />
    }
  }



  return (
    <ProtectedRoute>
      <DashboardLayout>
        <FadeInContent delay={200} duration={800}>
          <Box>
            <style>
              {`
                @keyframes shimmer {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(100%); }
                }
              `}
            </style>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
              gap: 3, 
              mb: 4 
            }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Receipt color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4">{stats.totalInvoices.toLocaleString()}</Typography>
                      <Typography variant="body2" color="text.secondary">Total Invoices</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoney color="success" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4">${stats.totalValue.toLocaleString()}</Typography>
                      <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <People color="info" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4">{stats.activeUsers}</Typography>
                      <Typography variant="body2" color="text.secondary">Active Users</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Schedule color="warning" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4">${stats.pendingAmount.toLocaleString()}</Typography>
                      <Typography variant="body2" color="text.secondary">Pending Amount</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, 
              gap: 3, 
              mb: 4 
            }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Revenue Overview
                    </Typography>
                    <IconButton size="small">
                      <MoreVert />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ height: 200, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.designTokens?.brand?.primary || '#667eea'} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={theme.designTokens?.brand?.secondary || '#764ba2'} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.3} />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: '8px',
                            boxShadow: theme.shadows[4],
                            color: theme.palette.text.primary
                          }}
                          formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                          labelStyle={{ fontWeight: 'bold' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke={theme.designTokens?.brand?.primary || '#667eea'} 
                          strokeWidth={3}
                          fill="url(#revenueGradient)"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">This Month</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>$12,450</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Last Month</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>$11,200</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Growth</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>+11.2%</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Invoice Status
                    </Typography>
                    <IconButton size="small">
                      <MoreVert />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ height: 200, width: '100%', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={invoiceStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          stroke={theme.palette.mode === 'dark' ? 'transparent' : theme.palette.background.paper}
                          strokeWidth={theme.palette.mode === 'dark' ? 0 : 2}
                        >
                          {invoiceStatusData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color} 
                              stroke={theme.palette.mode === 'dark' ? 'transparent' : theme.palette.background.paper}
                              strokeWidth={theme.palette.mode === 'dark' ? 0 : 2}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                          formatter={(value: any, name: any) => [value, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <Box sx={{ 
                      position: 'absolute', 
                      top: '50%', 
                      left: '50%', 
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      pointerEvents: 'none'
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {invoiceStatusData.reduce((sum, item) => sum + item.value, 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    {invoiceStatusData.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            backgroundColor: item.color, 
                            mr: 1 
                          }} 
                        />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.value}%
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>



            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, 
              gap: 3 
            }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Recent Activity
                    </Typography>
                    <IconButton size="small">
                      <MoreVert />
                    </IconButton>
                  </Box>
                  
                  <List>
                    {recentActivities.map((activity, index) => (
                      <Box key={activity.id}>
                        <ListItem sx={{ px: 0, py: 1.5, minHeight: 54 }}> 
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            {getStatusIcon(activity.status)}
                          </ListItemIcon>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, flex: 1, mr: 2 }}>
                              {activity.action}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                              <Avatar sx={{ width: 20, height: 20, mr: 1, fontSize: '0.75rem' }}>
                                {activity.user.charAt(0)}
                              </Avatar>
                              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                                {activity.user} • {activity.time}
                              </Typography>
                            </Box>
                          </Box>
                        </ListItem>
                        {index < recentActivities.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Top Clients
                  </Typography>
                  
                  {topClients.map((client, index) => (
                    <Box key={client.name} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {client.name}
                        </Typography>
                        <Chip 
                          label={`$${client.value.toLocaleString()}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {client.invoices} invoices
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {client.growth > 0 ? (
                            <ArrowUpward sx={{ fontSize: 14, color: 'success.main', mr: 0.5 }} />
                          ) : (
                            <ArrowDownward sx={{ fontSize: 14, color: 'error.main', mr: 0.5 }} />
                          )}
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: client.growth > 0 ? 'success.main' : 'error.main',
                              fontWeight: 500
                            }}
                          >
                            {Math.abs(client.growth)}%
                          </Typography>
                        </Box>
                      </Box>
                      {index < topClients.length - 1 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Box>
          </Box>
        </FadeInContent>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

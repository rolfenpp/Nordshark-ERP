import React, { useState } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  Receipt,
  People,
  Settings,
  AccountCircle,
  Logout,
  Inventory as InventoryIcon,
  Assignment as ProjectIcon,
  Help,
  LightMode,
  DarkMode,
  InfoOutlined,
} from '@mui/icons-material'
import { useAuth } from '../auth/AuthProvider'
import { NordsharkBrand } from './NordsharkBrand'
import { UpgradeButton } from './UpgradeButton'
import { AppToolbarBreadcrumbs } from './AppToolbarBreadcrumbs'
import { useTheme as useAppTheme } from '../theme/ThemeProvider'
import { colors } from '../theme/theme'

const DRAWER_WIDTH = 240

const DEMONSTRATION_DISCLAIMER =
  'Demonstration only. Not a commercial product or live service.'

const getMenuItems = (userRole: string) => {
  const categories = [
    {
      title: 'Overview',
      items: [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['admin', 'user', 'manager'] },
      ]
    },
    {
      title: 'Business',
      items: [
        { text: 'Invoices', icon: <Receipt />, path: '/invoices', roles: ['admin', 'user', 'manager'] },
        { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory', roles: ['admin', 'user', 'manager'] },
        { text: 'Projects', icon: <ProjectIcon />, path: '/projects', roles: ['admin', 'user', 'manager'] },
      ]
    },
    {
      title: 'Management',
      items: [
        { text: 'Users', icon: <People />, path: '/users', roles: ['admin'] },
        { text: 'Settings', icon: <Settings />, path: '/settings', roles: ['admin', 'manager'] },
        { text: 'Help', icon: <Help />, path: '/help', roles: ['admin', 'user', 'manager'] },
      ]
    }
  ]

  return categories.map(category => ({
    ...category,
    items: category.items.filter(item => item.roles.includes(userRole))
  })).filter(category => category.items.length > 0)
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { logout } = useAuth()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const theme = useTheme()
  const { mode, toggleTheme } = useAppTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()

  const lightIconColor = theme.designTokens?.brand?.primary || theme.palette.primary.main

  const userRole = 'admin'
  const menuCategories = getMenuItems(userRole)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    navigate({ to: '/login' })
    handleProfileMenuClose()
  }

  const handleMenuClick = (path: string) => {
    navigate({ to: path })
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <NordsharkBrand size="medium" showSubtitle={true} themeToggle />
      </Box>
      
      <Box sx={{ flexGrow: 1, pt: 4 }}>
        {menuCategories.map((category) => (
          <Box key={category.title} sx={{ mb: 3 }}>
            <Typography
              variant="overline"
              sx={{
                px: 3,
                py: 1,
                fontSize: '0.75rem',
                fontWeight: 300,
                color: 'text.secondary',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}
            >
              {category.title}
            </Typography>
            <List sx={{ px: 1 }}>
              {category.items.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <ListItem key={item.text} disablePadding sx={{ mb: 2 }}>
                    <ListItemButton 
                      onClick={() => handleMenuClick(item.path)}
                      sx={{
                        mx: 1,
                        mb: 1,
                        minHeight: 32,
                        py: 1,
                        borderRadius: '6px',
                        backgroundColor: isActive ? 'primary.main' : 'transparent',
                        color: isActive ? 'primary.contrastText' : 'text.primary',
                        overflow: 'hidden',
                        '&.MuiListItemButton-root': {
                          borderRadius: '6px',
                        },
                        '&:hover': {
                          backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <ListItemIcon sx={{ 
                        color: isActive ? 'primary.contrastText' : (mode === 'light' ? lightIconColor : 'text.primary'),
                        minWidth: 40,
                        transition: 'color 0.2s ease-in-out'
                      }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text} 
                        sx={{ 
                          color: 'inherit',
                          '& .MuiTypography-root': {
                            fontWeight: 300,
                          }
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>
          </Box>
        ))}
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.secondary',
        }}
      >
        <Toolbar
          sx={{
            alignItems: 'center',
            gap: 1,
            minHeight: { xs: 72, sm: 76 },
            py: { xs: 1, sm: 1.25 },
            pr: 1,
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 1,
              display: { md: 'none' },
              color: mode === 'light' ? lightIconColor : 'text.primary',
              alignSelf: 'center',
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box
            sx={{
              flexGrow: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                width: '100%',
                minWidth: 0,
              }}
            >
              <AppToolbarBreadcrumbs pathname={location.pathname} />
              <Tooltip
                title={DEMONSTRATION_DISCLAIMER}
                placement="bottom"
                enterTouchDelay={0}
                leaveTouchDelay={4000}
                describeChild
              >
                <IconButton
                  size="small"
                  aria-label="Show demonstration disclaimer"
                  sx={{
                    display: { xs: 'inline-flex', sm: 'none' },
                    flexShrink: 0,
                    color: 'text.secondary',
                    p: 0.4,
                    border: '1px solid transparent',
                    borderRadius: '50%',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <InfoOutlined sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography
              variant="caption"
              component="div"
              sx={{
                color: 'text.secondary',
                fontSize: '0.65rem',
                lineHeight: 1.3,
                mt: 0.25,
                display: { xs: 'none', sm: 'block' },
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {DEMONSTRATION_DISCLAIMER}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: 0.5 }}>
            <UpgradeButton onClick={() => {}} />

            <IconButton
              onClick={toggleTheme}
              color="inherit"
              sx={{
                mr: 0.5,
                color: mode === 'light' ? lightIconColor : 'text.primary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
              title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
            >
              {mode === 'light' ? <DarkMode /> : <LightMode />}
            </IconButton>

            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              sx={{
                color: mode === 'light' ? lightIconColor : 'text.primary',
              }}
            >
              <AccountCircle />
            </IconButton>
          </Box>

          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            sx={{
              '& .MuiPaper-root': {
                minWidth: 200,
                mt: 1,
              },
              '& .MuiMenuItem-root': {
                px: 3,
                py: 1.5,
                minHeight: 48,
              }
            }}
          >
            <MenuItem onClick={() => handleMenuClick('/profile')}>
              <ListItemIcon>
                <AccountCircle 
                  fontSize="small" 
                  sx={{ 
                    color: mode === 'light' ? colors.primary[600] : colors.text.primary 
                  }} 
                />
              </ListItemIcon>
              Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout 
                  fontSize="small" 
                  sx={{ 
                    color: colors.status.error 
                  }} 
                />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, bgcolor: 'background.secondary' },
          }}
        >
          {drawer}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, bgcolor: 'background.secondary' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          maxWidth: '100%',
          p: { xs: 2, sm: 3 },
          mt: { xs: '80px', sm: '84px' },
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

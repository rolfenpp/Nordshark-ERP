import React, { useCallback, useState, type SetStateAction } from 'react'
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
  ChevronLeft,
  ChevronRight,
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
import { useAuth } from '@/auth/AuthProvider'
import { NordsharkBrand } from './NordsharkBrand'
import { UpgradeButton } from './UpgradeButton'
import { AppToolbarBreadcrumbs } from './AppToolbarBreadcrumbs'
import { useTheme as useAppTheme } from '@/theme/ThemeProvider'
import { colors, navChrome } from '@/theme/theme'
const DRAWER_COLLAPSED_STORAGE_KEY = 'erp-dashboard-drawer-collapsed'

function readStoredDrawerCollapsed(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = localStorage.getItem(DRAWER_COLLAPSED_STORAGE_KEY)
    if (raw === 'true') return true
    if (raw === 'false') return false
  } catch {
    /* private mode / quota */
  }
  return false
}

function writeStoredDrawerCollapsed(value: boolean) {
  try {
    localStorage.setItem(DRAWER_COLLAPSED_STORAGE_KEY, String(value))
  } catch {
    /* skippa */
  }
}

const DRAWER_WIDTH = 240
const DRAWER_WIDTH_MINI = 72

function drawerItemActive(pathname: string, itemPath: string): boolean {
  const p = pathname.replace(/\/+$/, '') || '/'
  const m = itemPath.replace(/\/+$/, '') || '/'
  if (m === '/dashboard') return p === m
  return p === m || p.startsWith(`${m}/`)
}

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
  const [desktopDrawerCollapsed, setDesktopDrawerCollapsedState] = useState(() =>
    readStoredDrawerCollapsed()
  )
  const setDesktopDrawerCollapsed = useCallback((action: SetStateAction<boolean>) => {
    setDesktopDrawerCollapsedState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action
      writeStoredDrawerCollapsed(next)
      return next
    })
  }, [])
  const theme = useTheme()
  const { mode, toggleTheme } = useAppTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()

  const drawerLabelInactive = colors.text.primary
  const drawerIconInactive = colors.text.primary
  const drawerItemActiveBg = colors.primary[500]
  const drawerItemActiveHoverBg = colors.primary[600]

  const lightIconColor = theme.designTokens?.brand?.primary ?? theme.palette.primary.main

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

  const desktopMini = !isMobile && desktopDrawerCollapsed
  const permanentDrawerWidth = desktopMini ? DRAWER_WIDTH_MINI : DRAWER_WIDTH
  const drawerTransition = theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  })

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: desktopMini ? 'center' : 'flex-start',
          p: desktopMini ? 1 : 2,
          borderBottom: `1px solid ${navChrome.divider}`,
          minHeight: desktopMini ? 56 : undefined,
        }}
      >
        {!desktopMini ? (
          <Box sx={{ minWidth: 0, width: '100%' }}>
            <NordsharkBrand size="medium" themeToggle />
          </Box>
        ) : (
          <Box sx={{ width: 40, height: 8 }} aria-hidden />
        )}
      </Box>

      <Box sx={{ flexGrow: 1, pt: desktopMini ? 2 : 4 }}>
        {menuCategories.map((category) => (
          <Box key={category.title} sx={{ mb: desktopMini ? 1 : 3 }}>
            {!desktopMini && (
              <Typography
                variant="overline"
                sx={{
                  px: 3,
                  py: 1,
                  fontSize: '0.75rem',
                  fontWeight: 300,
                  color: navChrome.textMuted,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                {category.title}
              </Typography>
            )}
            <List sx={{ px: 1 }}>
              {category.items.map((item) => {
                const isActive = drawerItemActive(location.pathname, item.path)
                const navButton = (
                  <ListItemButton
                    onClick={() => handleMenuClick(item.path)}
                    sx={{
                      mx: 1,
                      mb: 1,
                      minHeight: 40,
                      py: 1,
                      borderRadius: '6px',
                      justifyContent: desktopMini ? 'center' : 'flex-start',
                      px: desktopMini ? 1 : 2,
                      backgroundColor: isActive ? drawerItemActiveBg : 'transparent',
                      color: drawerLabelInactive,
                      overflow: 'hidden',
                      '&.MuiListItemButton-root': {
                        borderRadius: '6px',
                      },
                      '&:hover': {
                        backgroundColor: isActive ? drawerItemActiveHoverBg : 'rgba(255, 255, 255, 0.06)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: drawerIconInactive,
                        minWidth: desktopMini ? 0 : 40,
                        mr: desktopMini ? 0 : undefined,
                        justifyContent: 'center',
                        transition: 'color 0.2s ease-in-out',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        sx: {
                          fontWeight: 300,
                          color: drawerLabelInactive,
                        },
                      }}
                      sx={{
                        display: desktopMini ? 'none' : 'block',
                      }}
                    />
                  </ListItemButton>
                )
                return (
                  <ListItem key={item.text} disablePadding sx={{ mb: desktopMini ? 0.5 : 2 }}>
                    {desktopMini ? (
                      <Tooltip title={item.text} placement="right">
                        {navButton}
                      </Tooltip>
                    ) : (
                      navButton
                    )}
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
          width: { md: `calc(100% - ${permanentDrawerWidth}px)` },
          ml: { md: `${permanentDrawerWidth}px` },
          bgcolor: 'background.paper',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
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

          <Tooltip title={desktopDrawerCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <IconButton
              color="inherit"
              aria-label={desktopDrawerCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              edge="start"
              onClick={() => setDesktopDrawerCollapsed((c) => !c)}
              sx={{
                mr: 1,
                display: { xs: 'none', md: 'inline-flex' },
                color: mode === 'light' ? lightIconColor : 'text.primary',
                alignSelf: 'center',
              }}
            >
              {desktopDrawerCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </Tooltip>

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
        sx={{
          width: { md: permanentDrawerWidth },
          flexShrink: { md: 0 },
          transition: { md: drawerTransition },
        }}
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
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              bgcolor: navChrome.background,
              color: navChrome.text,
              borderRight: 'none',
              boxShadow: '4px 0 24px rgba(0, 0, 0, 0.35)',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: permanentDrawerWidth,
              bgcolor: navChrome.background,
              color: navChrome.text,
              overflowX: 'hidden',
              transition: drawerTransition,
              borderRight: 'none',
              boxShadow: '4px 0 24px rgba(0, 0, 0, 0.35)',
            },
          }}
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

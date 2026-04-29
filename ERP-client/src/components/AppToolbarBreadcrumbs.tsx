import { Breadcrumbs, Link, Typography } from '@mui/material'
import { Link as RouterLink } from '@tanstack/react-router'
import { NavigateNext } from '@mui/icons-material'
import { getAppBreadcrumbs, type AppBreadcrumbItem } from '@/lib/appBreadcrumbs'
import { navChrome } from '@/theme/theme'

type AppToolbarBreadcrumbsProps = {
  pathname: string
  toolbarSurface?: 'default' | 'darkShell'
}

const crumbTextSx = {
  fontWeight: 300,
  fontSize: { xs: '0.9rem', sm: '1.125rem' },
  lineHeight: 1.25,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: { xs: 200, sm: 360 },
} as const

export function AppToolbarBreadcrumbs({
  pathname,
  toolbarSurface = 'default',
}: AppToolbarBreadcrumbsProps) {
  const items = getAppBreadcrumbs(pathname)
  const chrome = toolbarSurface === 'darkShell'

  const sepColor = chrome ? navChrome.textMuted : 'text.secondary'

  return (
    <Breadcrumbs
      aria-label="Breadcrumb"
      separator={<NavigateNext sx={{ fontSize: 18, color: sepColor }} />}
      sx={{
        flex: 1,
        minWidth: 0,
        color: chrome ? navChrome.text : 'text.primary',
        '& ol': { flexWrap: 'nowrap', overflow: 'hidden' },
        '& .MuiBreadcrumbs-li': { maxWidth: '100%' },
      }}
      maxItems={4}
      itemsBeforeCollapse={1}
    >
      {items.map((item: AppBreadcrumbItem, index: number, arr: AppBreadcrumbItem[]) => {
        const last = index === arr.length - 1

        if (last || !item.to) {
          return (
            <Typography
              key={`${item.label}-${index}`}
              component="span"
              variant="inherit"
              {...(chrome ? { sx: crumbTextSx } : { color: 'text.primary', sx: crumbTextSx })}
              noWrap
            >
              {item.label}
            </Typography>
          )
        }

        return (
          <Link
            key={`${item.label}-${index}`}
            component={RouterLink}
            to={item.to}
            underline="hover"
            color="inherit"
            sx={crumbTextSx}
          >
            {item.label}
          </Link>
        )
      })}
    </Breadcrumbs>
  )
}

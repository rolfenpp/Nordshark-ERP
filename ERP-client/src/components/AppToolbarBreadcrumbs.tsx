import { Breadcrumbs, Link, Typography } from '@mui/material'
import { Link as RouterLink } from '@tanstack/react-router'
import { NavigateNext } from '@mui/icons-material'
import { getAppBreadcrumbs, type AppBreadcrumbItem } from '../lib/appBreadcrumbs'

type AppToolbarBreadcrumbsProps = {
  pathname: string
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

/**
 * MUI breadcrumbs for the app bar (Material UI `Breadcrumbs`).
 * Trails come from `getAppBreadcrumbs` (section-first).
 */
export function AppToolbarBreadcrumbs({ pathname }: AppToolbarBreadcrumbsProps) {
  const items = getAppBreadcrumbs(pathname)

  return (
    <Breadcrumbs
      aria-label="Breadcrumb"
      separator={<NavigateNext sx={{ fontSize: 18, color: 'text.secondary' }} />}
      sx={{
        flex: 1,
        minWidth: 0,
        color: 'text.primary',
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
              color="text.primary"
              noWrap
              sx={crumbTextSx}
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

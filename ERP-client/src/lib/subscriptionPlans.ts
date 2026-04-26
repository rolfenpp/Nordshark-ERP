export type OrganizationPlanId = 'starter' | 'business'

export type OrganizationPlan = {
  id: OrganizationPlanId
  displayName: string
  shortLabel: string
  pricePrimary: string
  priceSecondary: string | null
  sortOrder: number
  recommended: boolean
}

export const ORGANIZATION_PLANS: Record<OrganizationPlanId, OrganizationPlan> = {
  starter: {
    id: 'starter',
    displayName: 'Starter',
    shortLabel: 'Starter',
    pricePrimary: 'Free',
    priceSecondary: 'For small teams getting started',
    sortOrder: 0,
    recommended: false,
  },
  business: {
    id: 'business',
    displayName: 'Business',
    shortLabel: 'Business',
    pricePrimary: '$49',
    priceSecondary: 'per company, billed monthly',
    sortOrder: 1,
    recommended: true,
  },
}

export const PLANS_FOR_COMPARISON: OrganizationPlanId[] = (
  Object.values(ORGANIZATION_PLANS) as OrganizationPlan[]
)
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .map((p) => p.id)

export type PlanFeatureRow = {
  id: string
  label: string
} & Record<OrganizationPlanId, string>

export const PLAN_FEATURE_ROWS: PlanFeatureRow[] = [
  {
    id: 'users',
    label: 'Team seats (users)',
    starter: 'Up to 5',
    business: 'Up to 25',
  },
  {
    id: 'inventory',
    label: 'Inventory SKUs',
    starter: '500',
    business: 'Unlimited',
  },
  {
    id: 'invoices',
    label: 'Invoices per month',
    starter: '50',
    business: 'Unlimited',
  },
  {
    id: 'projects',
    label: 'Active projects',
    starter: '10',
    business: 'Unlimited',
  },
  {
    id: 'export',
    label: 'Excel export',
    starter: '✓',
    business: '✓',
  },
  {
    id: 'reporting',
    label: 'Dashboard & analytics',
    starter: 'Standard',
    business: 'Advanced filters & scheduled reports',
  },
  {
    id: 'support',
    label: 'Support',
    starter: 'Community & docs',
    business: 'Email with next business day SLA',
  },
]

export const DEFAULT_UPGRADE_TARGET_ID: OrganizationPlanId = 'business'

export function getOrganizationPlan(id: OrganizationPlanId): OrganizationPlan {
  return ORGANIZATION_PLANS[id]
}

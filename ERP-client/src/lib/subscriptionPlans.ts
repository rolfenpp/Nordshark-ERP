/**
 * Organization (company) subscription tiers for the multi-tenant ERP.
 *
 * Aligns with the product surface area: per-company users, inventory, invoices,
 * projects, and exports. When backend billing exists, these ids and limits
 * should match API-enforced entitlements (JWT `companyId` / tenant scope).
 *
 * @see ERP-api onboarding: companies register → admin adds users scoped to company.
 */

export type OrganizationPlanId = 'starter' | 'business'

export type OrganizationPlan = {
  id: OrganizationPlanId
  /** Full name in marketing / comparison UI */
  displayName: string
  /** Short column header label */
  shortLabel: string
  /** Primary price line, e.g. "Free" or "$49" */
  pricePrimary: string
  /** Secondary line under price in compact UIs, or null */
  priceSecondary: string | null
  /** Sort order for comparison columns (lower = left) */
  sortOrder: number
  /** Highlight column (e.g. gradient pill on recommended tier) */
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

/** Plans shown side-by-side in upgrade UI (left → right). */
export const PLANS_FOR_COMPARISON: OrganizationPlanId[] = (
  Object.values(ORGANIZATION_PLANS) as OrganizationPlan[]
)
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .map((p) => p.id)

/** One row in the matrix; keys match {@link OrganizationPlanId} for cell copy. */
export type PlanFeatureRow = {
  id: string
  label: string
} & Record<OrganizationPlanId, string>

/**
 * Feature matrix: limits and capabilities per tier.
 * Wording mirrors modules in the app (Users, Inventory, Invoices, Projects).
 */
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

/** Plan selected from primary CTA until checkout is wired. */
export const DEFAULT_UPGRADE_TARGET_ID: OrganizationPlanId = 'business'

export function getOrganizationPlan(id: OrganizationPlanId): OrganizationPlan {
  return ORGANIZATION_PLANS[id]
}

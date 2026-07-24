namespace ErpApi.Services.Ai;

public static class AiHelpKnowledge
{
    public const string ProductTruth = """
Nordshark ERP — implemented features only:

Navigation (sidebar):
- Dashboard (/dashboard) — revenue, invoice status, low stock, recent activity
- Inventory (/inventory) — list, search/filter, create (/inventory/create), edit, detail
- Invoices (/invoices) — list, Excel export, create (/invoices/create), edit, detail
- Projects (/projects) — list, create wizard (/projects/create), edit, detail
- Users (/users) — list company users (admin / manage_users)
- Profile (/profile), Settings (/settings), Help (/help)

Inventory fields: name, SKU, description, category, location, supplier, tags, quantity on hand, unit price, reorder level.
There is NO CSV import, bulk import UI, stock reports page, or expiry tracking in the API.

Invoices: draft/pending/paid/overdue status (user-set), line items, tax %, terms, currency, notes.
There is NO email send, PDF download, or reminder workflow in the API. List page can export Excel.

Projects: name, description, client, manager, status, priority, progress (0–100), budget, dates, tags.
There are NO tasks, time tracking, comments, or file attachments in the API.

Auth: company registration, login, JWT + refresh cookie, optional Google sign-in for existing users.
Roles seeded: Admin, User. Permissions are granular perm claims (view/create/edit/delete per domain).

When unsure, say the feature is not implemented yet and point to the closest real screen.
""";
}

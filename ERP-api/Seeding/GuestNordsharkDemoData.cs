using System.Security.Claims;
using ErpApi;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ErpApi.Seeding;

public static class GuestNordsharkDemoData
{
    private const string DemoPassword = "Password123!";

    public static readonly string[] DemoTeamEmails =
    {
        "morgan.lee@nordshark.com",
        "sam.river@nordshark.com",
        "casey.fox@nordshark.com"
    };

    public static async Task SeedIfEmptyAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationDbContext db,
        string tenantAdminEmail,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByEmailAsync(tenantAdminEmail).ConfigureAwait(false);
        if (user is null || user.CompanyId < 1)
            return;

        var companyId = user.CompanyId;
        var now = DateTime.UtcNow;

        await SeedInventoryAsync(db, companyId, now, cancellationToken).ConfigureAwait(false);
        await SeedProjectsAsync(db, companyId, now, cancellationToken).ConfigureAwait(false);
        await SeedInvoicesAsync(db, companyId, now, cancellationToken).ConfigureAwait(false);
        await SeedDemoTeamUsersAsync(userManager, companyId, cancellationToken).ConfigureAwait(false);
    }

    private static async Task SeedInventoryAsync(
        ApplicationDbContext db, int companyId, DateTime now, CancellationToken ct)
    {
        if (await db.InventoryItems.AsNoTracking().AnyAsync(i => i.CompanyId == companyId, ct))
            return;

        db.InventoryItems.AddRange(
            new InventoryItem
            {
                Sku = "NS-DEMO-LAPTOP-001",
                Name = "Laptop Dell XPS 13",
                Description = "High-performance laptop, 16GB RAM, 512GB SSD.",
                Category = "Electronics",
                Location = "Warehouse A, Shelf B-3",
                Supplier = "Dell Technologies",
                Tags = "laptop, dell, xps",
                QuantityOnHand = 25,
                UnitPrice = 1299.99m,
                ReorderLevel = 5,
                CompanyId = companyId,
                CreatedUtc = now
            },
            new InventoryItem
            {
                Sku = "NS-DEMO-OC-HDMI",
                Name = "HDMI Cable 2m",
                Description = "High-speed 4K HDMI cable.",
                Category = "Cables",
                Location = "Warehouse B, Bin 12",
                Supplier = "CableCo",
                Tags = "hdmi, display",
                QuantityOnHand = 120,
                UnitPrice = 18.5m,
                ReorderLevel = 20,
                CompanyId = companyId,
                CreatedUtc = now
            },
            new InventoryItem
            {
                Sku = "NS-DEMO-DESK-01",
                Name = "Standing desk frame",
                Description = "Electric height-adjustable frame (black).",
                Category = "Office",
                Location = "Warehouse A, Assembly",
                Supplier = "OfficeFit",
                Tags = "desk, ergonomic",
                QuantityOnHand = 8,
                UnitPrice = 449m,
                ReorderLevel = 2,
                CompanyId = companyId,
                CreatedUtc = now
            },
            new InventoryItem
            {
                Sku = "NS-DEMO-KB-MECH",
                Name = "Mechanical keyboard",
                Description = "Tenkeyless, hot-swap switches.",
                Category = "Electronics",
                Location = "Warehouse A, Shelf C-1",
                Supplier = "KeyMax",
                Tags = "keyboard, peripherals",
                QuantityOnHand = 42,
                UnitPrice = 129m,
                ReorderLevel = 10,
                CompanyId = companyId,
                CreatedUtc = now
            },
            new InventoryItem
            {
                Sku = "NS-DEMO-PAPER-A4",
                Name = "Printer paper A4 (ream)",
                Description = "500 sheets, 80gsm.",
                Category = "Office",
                Location = "Supplies closet",
                Supplier = "PaperMill",
                Tags = "paper, office",
                QuantityOnHand = 200,
                UnitPrice = 6.25m,
                ReorderLevel = 40,
                CompanyId = companyId,
                CreatedUtc = now
            }
        );

        await db.SaveChangesAsync(ct).ConfigureAwait(false);
    }

    private static async Task SeedProjectsAsync(
        ApplicationDbContext db, int companyId, DateTime now, CancellationToken ct)
    {
        if (await db.Projects.AsNoTracking().AnyAsync(p => p.CompanyId == companyId, ct))
            return;

        db.Projects.AddRange(
            new Project
            {
                Name = "Website Redesign",
                Description = "Complete redesign with modern UI/UX, responsive layout, and SEO.",
                Client = "TechCorp Inc.",
                Manager = "John Doe",
                Status = "active",
                Priority = "high",
                Progress = 75,
                Budget = 25000m,
                Tags = "web, branding, seo",
                StartDate = new DateTime(2024, 1, 15, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2024, 4, 15, 0, 0, 0, DateTimeKind.Utc),
                CompanyId = companyId,
                CreatedUtc = now
            },
            new Project
            {
                Name = "Mobile App Development",
                Description = "iOS and Android MVP: auth, catalog, and checkout.",
                Client = "StartupXYZ",
                Manager = "Jane Smith",
                Status = "planning",
                Priority = "medium",
                Progress = 20,
                Budget = 50000m,
                Tags = "mobile, ios, android",
                StartDate = new DateTime(2024, 2, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2024, 8, 1, 0, 0, 0, DateTimeKind.Utc),
                CompanyId = companyId,
                CreatedUtc = now
            },
            new Project
            {
                Name = "E-commerce Platform",
                Description = "Headless storefront with payment integration.",
                Client = "Retail Solutions",
                Manager = "Bob Johnson",
                Status = "completed",
                Priority = "high",
                Progress = 100,
                Budget = 75000m,
                Tags = "ecommerce, payments",
                StartDate = new DateTime(2023, 9, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2024, 1, 31, 0, 0, 0, DateTimeKind.Utc),
                CompanyId = companyId,
                CreatedUtc = now
            },
            new Project
            {
                Name = "Data Migration",
                Description = "Legacy ERP to PostgreSQL cutover and validation.",
                Client = "Enterprise Corp",
                Manager = "Alice Brown",
                Status = "on-hold",
                Priority = "medium",
                Progress = 45,
                Budget = 30000m,
                Tags = "migration, data",
                StartDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2024, 6, 30, 0, 0, 0, DateTimeKind.Utc),
                CompanyId = companyId,
                CreatedUtc = now
            }
        );

        await db.SaveChangesAsync(ct).ConfigureAwait(false);
    }

    private static async Task SeedInvoicesAsync(
        ApplicationDbContext db, int companyId, DateTime now, CancellationToken ct)
    {
        if (await db.Invoices.AsNoTracking().AnyAsync(i => i.CompanyId == companyId, ct))
            return;

        void AddInvoice(
            string number,
            DateTime issue,
            DateTime due,
            string client,
            string? email,
            string? address,
            string status,
            decimal subtotal,
            decimal taxRate,
            string? notes,
            string? payment,
            DateTime? paid,
            params (string desc, int qty, decimal rate)[] lines)
        {
            var tax = Math.Round(subtotal * (taxRate / 100m), 2, MidpointRounding.AwayFromZero);
            var total = subtotal + tax;
            var inv = new Invoice
            {
                CompanyId = companyId,
                InvoiceNumber = number,
                IssueDate = issue,
                DueDate = due,
                ClientName = client,
                ClientEmail = email,
                ClientAddress = address,
                Status = status,
                Subtotal = subtotal,
                TaxAmount = tax,
                Total = total,
                TaxRatePercent = taxRate,
                Terms = "Net 30",
                Currency = "USD",
                Notes = notes,
                PaymentMethod = payment,
                PaidDate = paid,
                CreatedUtc = now
            };

            var n = 0;
            foreach (var (desc, qty, rate) in lines)
            {
                n++;
                var amt = qty * rate;
                inv.Lines.Add(new InvoiceLine
                {
                    CompanyId = companyId,
                    LineNumber = n,
                    Description = desc,
                    Quantity = qty,
                    UnitPrice = rate,
                    Amount = amt
                });
            }

            db.Invoices.Add(inv);
        }

        AddInvoice(
            "INV-2024-001",
            D(2024, 1, 15), D(2024, 2, 15),
            "Acme Corporation", "accounts@acme.com", "123 Business St, New York, NY",
            "paid", 1250m, 10m,
            "Website development services",
            "Bank Transfer", D(2024, 1, 20),
            ("Website Design & UX", 1, 800m),
            ("Development Hours", 10, 45m));

        AddInvoice(
            "INV-2024-002",
            D(2024, 1, 16), D(2024, 2, 16),
            "Tech Solutions Inc.", "finance@techsolutions.com", null,
            "pending", 3450m, 10m,
            "Software licensing and support",
            null, null,
            ("Enterprise License", 5, 600m),
            ("Support Package", 1, 450m));

        AddInvoice(
            "INV-2024-003",
            D(2024, 1, 10), D(2024, 2, 10),
            "Global Industries", "ap@globalindustries.com", null,
            "overdue", 8900m, 10m,
            "Consulting services for Q1",
            null, null,
            ("Strategic Consulting", 40, 200m),
            ("Report Generation", 1, 900m));

        AddInvoice(
            "INV-2024-004",
            D(2024, 1, 20), D(2024, 2, 20),
            "StartupXYZ", "hello@startupxyz.com", null,
            "draft", 2200m, 10m,
            "Mobile app development",
            null, null,
            ("App Design", 1, 1200m),
            ("Development", 20, 50m));

        await db.SaveChangesAsync(ct).ConfigureAwait(false);
    }

    private static DateTime D(int y, int m, int d) =>
        new DateTime(y, m, d, 0, 0, 0, DateTimeKind.Utc);

    private static async Task SeedDemoTeamUsersAsync(
        UserManager<ApplicationUser> userManager, int companyId, CancellationToken ct)
    {
        var claimPerms = Permissions.All
            .Where(p => p != Permissions.ManageUsers && p != Permissions.AssignPermissions)
            .ToArray();

        foreach (var email in DemoTeamEmails)
        {
            if (await userManager.FindByEmailAsync(email).ConfigureAwait(false) is not null)
                continue;

            var u = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                CompanyId = companyId
            };

            var create = await userManager.CreateAsync(u, DemoPassword).ConfigureAwait(false);
            if (!create.Succeeded)
                continue;

            await userManager.AddToRoleAsync(u, "User").ConfigureAwait(false);

            foreach (var p in claimPerms)
            {
                await userManager.AddClaimAsync(u, new Claim("perm", p)).ConfigureAwait(false);
            }
        }
    }
}

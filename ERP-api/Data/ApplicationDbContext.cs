using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ErpApi;

namespace ErpApi;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    private readonly ITenantProvider _tenantProvider;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ITenantProvider tenantProvider)
        : base(options)
    {
        _tenantProvider = tenantProvider;
    }

    private int CurrentCompanyId => _tenantProvider.CompanyId;

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceLine> InvoiceLines => Set<InvoiceLine>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>()
            .HasIndex(u => u.CompanyId);

        builder.Entity<Company>()
            .HasIndex(c => c.Name)
            .IsUnique(false);

        builder.Entity<Project>()
            .HasIndex(p => p.CompanyId);

        builder.Entity<InventoryItem>()
            .HasIndex(i => i.CompanyId);

        builder.Entity<Invoice>()
            .HasIndex(i => i.CompanyId);

        builder.Entity<Invoice>()
            .HasIndex(i => new { i.CompanyId, i.InvoiceNumber })
            .IsUnique();

        builder.Entity<InvoiceLine>()
            .HasIndex(l => l.CompanyId);

        builder.Entity<InvoiceLine>()
            .HasOne(l => l.Invoice)
            .WithMany(i => i.Lines)
            .HasForeignKey(l => l.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Project>().HasQueryFilter(e => e.CompanyId == CurrentCompanyId);
        builder.Entity<InventoryItem>().HasQueryFilter(e => e.CompanyId == CurrentCompanyId);
        builder.Entity<Invoice>().HasQueryFilter(e => e.CompanyId == CurrentCompanyId);
        builder.Entity<InvoiceLine>().HasQueryFilter(e => e.CompanyId == CurrentCompanyId);
    }
}

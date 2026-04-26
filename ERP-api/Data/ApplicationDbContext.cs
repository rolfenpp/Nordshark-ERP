using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ErpApi;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    private readonly ITenantProvider? _tenantProvider;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ITenantProvider? tenantProvider = null)
        : base(options)
    {
        _tenantProvider = tenantProvider;
    }

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

        var companyId = _tenantProvider?.CompanyId ?? 0;

        builder.Entity<Project>().HasQueryFilter(p => companyId == 0 || p.CompanyId == companyId);
        builder.Entity<InventoryItem>().HasQueryFilter(i => companyId == 0 || i.CompanyId == companyId);
        builder.Entity<Invoice>().HasQueryFilter(i => companyId == 0 || i.CompanyId == companyId);
        builder.Entity<InvoiceLine>().HasQueryFilter(l => companyId == 0 || l.CompanyId == companyId);
    }
}
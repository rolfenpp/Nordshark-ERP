using ErpApi.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ErpApi.Seeding;

// Shared: register Nordshark + guest admin when missing, then seed demo rows (dev or opt-in production).
public static class GuestNordsharkTenantSeeder
{
    public static async Task EnsureCompanyAndDemoDataAsync(
        IConfiguration config,
        IServiceProvider services,
        CancellationToken cancellationToken = default)
    {
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var db = services.GetRequiredService<ApplicationDbContext>();
        var log = services.GetRequiredService<ILoggerFactory>().CreateLogger("Seeding.GuestNordsharkTenant");

        var companyName = config["Seeding:DemoCompanyName"] ?? "Nordshark";
        var email = (config["Seeding:DemoAdminEmail"] ?? "guest@nordshark.com").Trim();
        var password = config["Seeding:DemoAdminPassword"] ?? "Password123!";

        if (string.IsNullOrEmpty(email))
        {
            log.LogWarning("Seeding:DemoAdminEmail is empty; guest demo seed will not run.");
            return;
        }

        var existing = await userManager.FindByEmailAsync(email).ConfigureAwait(false);
        if (existing is not null)
        {
            log.LogInformation("Demo admin user exists: {Email}, CompanyId={CompanyId}.", email, existing.CompanyId);
            if (config.GetValue("Seeding:LoadDemoDataWhenTenantExists", true))
            {
                await GuestNordsharkDemoData.SeedIfEmptyAsync(userManager, db, email, cancellationToken, log)
                    .ConfigureAwait(false);
            }
            return;
        }

        log.LogInformation("Demo admin {Email} not found; registering company {CompanyName}.", email, companyName);
        var req = new RegisterCompanyRequest
        {
            Name = companyName,
            AdminEmail = email,
            AdminPassword = password
        };

        var (ok, failure, message, company, admin) = await CompanyRegistration.TryRegisterCompanyAsync(
                db, userManager, req, cancellationToken)
            .ConfigureAwait(false);

        if (!ok)
        {
            log.LogError(
                "Could not create demo company/user for {Email}: {Failure} {Message}",
                email, failure, message ?? string.Empty);
            return;
        }

        log.LogInformation("Registered company Id={CompanyId} admin {Email}.", company?.Id, email);

        if (ok && admin is not null && config.GetValue("Seeding:LoadDemoDataWhenTenantExists", true))
        {
            await GuestNordsharkDemoData.SeedIfEmptyAsync(userManager, db, email, cancellationToken, log)
                .ConfigureAwait(false);
        }
    }
}

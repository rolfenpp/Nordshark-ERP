using ErpApi.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace ErpApi.Seeding;

public static class DevelopmentTenantSeeder
{
    public static async Task EnsureLocalDemoFromConfigAsync(
        IConfiguration config,
        IHostEnvironment env,
        IServiceProvider services,
        CancellationToken cancellationToken = default)
    {
        if (!env.IsDevelopment()) return;
        if (!config.GetValue("Seeding:EnsureLocalDemoTenant", false)) return;

        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var db = services.GetRequiredService<ApplicationDbContext>();

        var companyName = config["Seeding:DemoCompanyName"] ?? "Nordshark";
        var email = (config["Seeding:DemoAdminEmail"] ?? "guest@nordshark.com").Trim();
        var password = config["Seeding:DemoAdminPassword"] ?? "Password123!";

        if (await userManager.FindByEmailAsync(email).ConfigureAwait(false) is not null)
        {
            if (config.GetValue("Seeding:LoadDemoDataWhenTenantExists", true))
                await GuestNordsharkDemoData.SeedIfEmptyAsync(userManager, db, email, cancellationToken).ConfigureAwait(false);
            return;
        }

        var req = new RegisterCompanyRequest
        {
            Name = companyName,
            AdminEmail = email,
            AdminPassword = password
        };

        var (ok, _, _, _, admin) = await CompanyRegistration.TryRegisterCompanyAsync(
            db, userManager, req, cancellationToken).ConfigureAwait(false);

        if (ok && admin is not null && config.GetValue("Seeding:LoadDemoDataWhenTenantExists", true))
            await GuestNordsharkDemoData.SeedIfEmptyAsync(userManager, db, email, cancellationToken).ConfigureAwait(false);
    }
}

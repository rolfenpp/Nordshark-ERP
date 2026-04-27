using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace ErpApi.Seeding;

// Opt-in: same as local demo (guest user + Nordshark + tables). Set Seeding:RunGuestNordsharkDemoInProduction, deploy, then set false.
public static class ProductionGuestDemoSeeder
{
    public static async Task RunIfEnabledAsync(
        IConfiguration config,
        IHostEnvironment env,
        IServiceProvider services,
        CancellationToken cancellationToken = default)
    {
        if (env.IsDevelopment())
            return;

        if (!config.GetValue("Seeding:RunGuestNordsharkDemoInProduction", false))
            return;

        await GuestNordsharkTenantSeeder.EnsureCompanyAndDemoDataAsync(config, services, cancellationToken)
            .ConfigureAwait(false);
    }
}

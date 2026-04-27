using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

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
        var log = services.GetRequiredService<ILoggerFactory>().CreateLogger("Seeding.Production");
        log.LogInformation("Seeding check: Environment={EnvironmentName}.", env.EnvironmentName);

        if (env.IsDevelopment())
        {
            log.LogInformation(
                "Production guest seed skipped: current environment is Development. " +
                "The dev seeder (EnsureLocalDemoTenant) runs instead if enabled; " +
                "or set ASPNETCORE_ENVIRONMENT=Production to use Seeding:RunGuestNordsharkDemoInProduction.");
            return;
        }

        if (!config.GetValue("Seeding:RunGuestNordsharkDemoInProduction", false))
        {
            log.LogInformation(
                "Guest Nordshark seed skipped: Seeding:RunGuestNordsharkDemoInProduction is not true. " +
                "Set env Seeding__RunGuestNordsharkDemoInProduction=true to enable.");
            return;
        }

        log.LogInformation("Guest Nordshark production seed: starting.");
        await GuestNordsharkTenantSeeder.EnsureCompanyAndDemoDataAsync(config, services, cancellationToken)
            .ConfigureAwait(false);
        log.LogInformation("Guest Nordshark production seed: finished.");
    }
}

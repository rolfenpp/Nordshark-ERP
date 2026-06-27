using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ErpApi;
using Xunit;

namespace ErpApi.Tests;

public static class TestAuthHelper
{
    public static async Task<(HttpClient Client, string Token, int CompanyId)> RegisterCompanyAsync(
        ErpWebApplicationFactory factory,
        string suffix)
    {
        var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/companies/register", new
        {
            Name = $"Company-{suffix}",
            AdminEmail = $"admin-{suffix}@test.com",
            AdminPassword = "Password1!"
        });

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        var token = json.GetProperty("token").GetString()!;
        var companyId = json.GetProperty("companyId").GetInt32();
        return (client, token, companyId);
    }

    public static void SetBearer(HttpClient client, string token)
    {
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }

    public static async Task<string> LoginAsync(HttpClient client, string email, string password)
    {
        var response = await client.PostAsJsonAsync("/api/Account/login", new { Email = email, Password = password });
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        return json.GetProperty("token").GetString()!;
    }

    public static async Task<string> CreateUserAndLoginAsync(
        ErpWebApplicationFactory factory,
        HttpClient adminClient,
        string email,
        string password)
    {
        var createResponse = await adminClient.PostAsJsonAsync("/api/Account/users", new
        {
            Email = email,
            Password = password,
            Roles = new[] { "User" }
        });
        createResponse.EnsureSuccessStatusCode();

        using var scope = factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var user = await userManager.FindByEmailAsync(email);
        user!.EmailConfirmed = true;
        await userManager.UpdateAsync(user);

        return await LoginAsync(adminClient, email, password);
    }

    public static async Task<int> SeedInventoryItemAsync(
        ErpWebApplicationFactory factory,
        int companyId,
        string sku)
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var item = new InventoryItem
        {
            CompanyId = companyId,
            Sku = sku,
            Name = $"Item-{sku}",
            QuantityOnHand = 10,
            UnitPrice = 9.99m,
            CreatedUtc = DateTime.UtcNow
        };
        db.InventoryItems.Add(item);
        await db.SaveChangesAsync();
        return item.Id;
    }
}

public class TenantIsolationTests : IClassFixture<ErpWebApplicationFactory>
{
    private readonly ErpWebApplicationFactory _factory;

    public TenantIsolationTests(ErpWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetInventoryById_FromOtherTenant_ReturnsNotFound()
    {
        var (clientA, tokenA, _) = await TestAuthHelper.RegisterCompanyAsync(_factory, Guid.NewGuid().ToString("N"));
        var (_, _, companyBId) = await TestAuthHelper.RegisterCompanyAsync(_factory, Guid.NewGuid().ToString("N"));

        var itemBId = await TestAuthHelper.SeedInventoryItemAsync(_factory, companyBId, "SKU-B");

        TestAuthHelper.SetBearer(clientA, tokenA);
        var response = await clientA.GetAsync($"/api/inventory/{itemBId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}

public class PermissionTests : IClassFixture<ErpWebApplicationFactory>
{
    private readonly ErpWebApplicationFactory _factory;

    public PermissionTests(ErpWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetInventory_WithoutViewInventoryPermission_ReturnsForbidden()
    {
        var suffix = Guid.NewGuid().ToString("N");
        var (adminClient, adminToken, _) = await TestAuthHelper.RegisterCompanyAsync(_factory, suffix);
        TestAuthHelper.SetBearer(adminClient, adminToken);

        var userEmail = $"user-{suffix}@test.com";
        var userToken = await TestAuthHelper.CreateUserAndLoginAsync(_factory, adminClient, userEmail, "Password1!");

        var userClient = _factory.CreateClient();
        TestAuthHelper.SetBearer(userClient, userToken);

        var response = await userClient.GetAsync("/api/inventory");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetUsers_WithoutManageUsersPermission_ReturnsForbidden()
    {
        var suffix = Guid.NewGuid().ToString("N");
        var (adminClient, adminToken, _) = await TestAuthHelper.RegisterCompanyAsync(_factory, suffix);
        TestAuthHelper.SetBearer(adminClient, adminToken);

        var userEmail = $"user-{suffix}@test.com";
        var userToken = await TestAuthHelper.CreateUserAndLoginAsync(_factory, adminClient, userEmail, "Password1!");

        var userClient = _factory.CreateClient();
        TestAuthHelper.SetBearer(userClient, userToken);

        var response = await userClient.GetAsync("/api/users");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetUsers_WithManageUsersClaim_ReturnsOk()
    {
        var suffix = Guid.NewGuid().ToString("N");
        var (adminClient, adminToken, _) = await TestAuthHelper.RegisterCompanyAsync(_factory, suffix);
        TestAuthHelper.SetBearer(adminClient, adminToken);

        var userEmail = $"manager-{suffix}@test.com";
        var createResponse = await adminClient.PostAsJsonAsync("/api/Account/users", new
        {
            Email = userEmail,
            Password = "Password1!",
            Roles = new[] { "User" }
        });
        createResponse.EnsureSuccessStatusCode();
        var created = await createResponse.Content.ReadFromJsonAsync<JsonElement>();
        var userId = created.GetProperty("id").GetString()!;

        var permResponse = await adminClient.PutAsJsonAsync($"/api/Account/users/{userId}/permissions", new
        {
            Permissions = new[] { Permissions.ManageUsers }
        });
        permResponse.EnsureSuccessStatusCode();

        using (var scope = _factory.Services.CreateScope())
        {
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var user = await userManager.FindByIdAsync(userId);
            user!.EmailConfirmed = true;
            await userManager.UpdateAsync(user);
        }

        var userToken = await TestAuthHelper.LoginAsync(adminClient, userEmail, "Password1!");
        var userClient = _factory.CreateClient();
        TestAuthHelper.SetBearer(userClient, userToken);

        var response = await userClient.GetAsync("/api/users");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}

public class CompanyRegistrationTests : IClassFixture<ErpWebApplicationFactory>
{
    private readonly ErpWebApplicationFactory _factory;

    public CompanyRegistrationTests(ErpWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task RegisterCompany_WithInvalidPassword_DoesNotLeaveOrphanCompany()
    {
        var companyName = $"Orphan-{Guid.NewGuid():N}";
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/companies/register", new
        {
            Name = companyName,
            AdminEmail = $"orphan-{Guid.NewGuid():N}@test.com",
            AdminPassword = "x"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var exists = await db.Companies.AnyAsync(c => c.Name == companyName);
        Assert.False(exists);
    }

    [Fact]
    public async Task RegisterCompany_SetsRefreshCookie()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/companies/register", new
        {
            Name = $"CookieCo-{Guid.NewGuid():N}",
            AdminEmail = $"cookie-{Guid.NewGuid():N}@test.com",
            AdminPassword = "Password1!"
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.True(response.Headers.TryGetValues("Set-Cookie", out var cookies));
        Assert.Contains(cookies, c => c.StartsWith("rt=", StringComparison.OrdinalIgnoreCase));
    }
}

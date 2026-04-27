using System.Security.Claims;
using Microsoft.AspNetCore.Http;

public interface ITenantProvider
{
    int CompanyId { get; }
}

public class HttpContextTenantProvider : ITenantProvider
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public HttpContextTenantProvider(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public int CompanyId
    {
        get
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user is null) return 0;

            var claimValue = user.FindFirst("tenantId")?.Value
                ?? user.FindFirst("companyId")?.Value
                ?? user.Claims.FirstOrDefault(c =>
                    string.Equals(c.Type, "companyId", StringComparison.OrdinalIgnoreCase)
                    || c.Type.EndsWith("/companyId", StringComparison.OrdinalIgnoreCase))?.Value;
            return int.TryParse(claimValue, out var id) ? id : 0;
        }
    }
}


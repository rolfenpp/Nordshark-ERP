using Microsoft.AspNetCore.Mvc;

namespace ErpApi;

public abstract class TenantApiController : ControllerBase
{
    private readonly ITenantProvider _tenantProvider;

    protected TenantApiController(ITenantProvider tenantProvider)
    {
        _tenantProvider = tenantProvider;
    }

    protected int CompanyId => _tenantProvider.CompanyId;
}

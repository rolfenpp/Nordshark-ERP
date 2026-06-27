using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace ErpApi;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class RequireTenantAttribute : Attribute, IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var tenantProvider = context.HttpContext.RequestServices.GetRequiredService<ITenantProvider>();
        if (tenantProvider.CompanyId <= 0)
        {
            context.Result = new ForbidResult();
            return;
        }

        await next();
    }
}

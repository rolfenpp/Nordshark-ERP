using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITenantProvider _tenantProvider;

    public UsersController(UserManager<ApplicationUser> userManager, ITenantProvider tenantProvider)
    {
        _userManager = userManager;
        _tenantProvider = tenantProvider;
    }

    private int GetCompanyId() => _tenantProvider.CompanyId;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        var companyId = GetCompanyId();

        var baseUsers = await _userManager.Users
            .Where(u => u.CompanyId == companyId)
            .OrderBy(u => u.Email)
            .Select(u => new { u.Id, u.Email, u.EmailConfirmed })
            .ToListAsync();

        var list = new List<UserDto>(baseUsers.Count);
        foreach (var u in baseUsers)
        {
            var appUser = await _userManager.FindByIdAsync(u.Id);
            if (appUser is null) continue;
            var roles = await _userManager.GetRolesAsync(appUser);
            list.Add(new UserDto
            {
                Id = u.Id,
                Email = u.Email ?? string.Empty,
                EmailConfirmed = u.EmailConfirmed,
                Roles = roles.ToArray()
            });
        }

        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetById(string id)
    {
        var companyId = GetCompanyId();

        var u = await _userManager.FindByIdAsync(id);
        if (u is null || u.CompanyId != companyId) return NotFound();

        var roles = await _userManager.GetRolesAsync(u);
        return Ok(new UserDto
        {
            Id = u.Id,
            Email = u.Email ?? string.Empty,
            EmailConfirmed = u.EmailConfirmed,
            Roles = roles.ToArray()
        });
    }
}

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool EmailConfirmed { get; set; }
    public IReadOnlyList<string> Roles { get; set; } = Array.Empty<string>();
}
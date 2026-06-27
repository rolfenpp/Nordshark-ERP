using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using ErpApi.Services;

namespace ErpApi;

[ApiController]
[Route("api/companies")]
public class CompaniesController : TenantApiController
{
    private readonly ApplicationDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly JwtTokenHelper _jwtTokenHelper;

    public CompaniesController(
        ApplicationDbContext db,
        UserManager<ApplicationUser> userManager,
        JwtTokenHelper jwtTokenHelper,
        ITenantProvider tenantProvider)
        : base(tenantProvider)
    {
        _db = db;
        _userManager = userManager;
        _jwtTokenHelper = jwtTokenHelper;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> RegisterCompany([FromBody] RegisterCompanyRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var (ok, failure, message, company, admin) = await CompanyRegistration.TryRegisterCompanyAsync(
            _db, _userManager, req, HttpContext.RequestAborted);
        if (!ok || company is null || admin is null)
        {
            return failure switch
            {
                CompanyRegistrationFailure.CompanyNameTaken or CompanyRegistrationFailure.EmailTaken => Conflict(message),
                _ => BadRequest(message ?? "Registration failed."),
            };
        }

        var roles = await _userManager.GetRolesAsync(admin);
        var claims = await _userManager.GetClaimsAsync(admin);
        var token = _jwtTokenHelper.GenerateToken(admin, roles, claims);
        RefreshTokenCookies.Set(Response, _jwtTokenHelper, admin);

        return Created(string.Empty, new
        {
            companyId = company.Id,
            companyName = company.Name,
            adminUserId = admin.Id,
            adminEmail = admin.Email,
            token
        });
    }

    [Authorize]
    [RequireTenant]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyCompany()
    {
        var company = await _db.Companies.FirstOrDefaultAsync(c => c.Id == CompanyId);
        if (company == null) return NotFound("Company not found.");

        return Ok(new
        {
            id = company.Id,
            name = company.Name,
            createdUtc = company.CreatedUtc
        });
    }
}

public class RegisterCompanyRequest
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string AdminEmail { get; set; } = string.Empty;

    [Required]
    public string AdminPassword { get; set; } = string.Empty;
}

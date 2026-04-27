using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ErpApi.Services;

public enum CompanyRegistrationFailure
{
    None,
    CompanyNameTaken,
    EmailTaken,
    IdentityError
}

public static class CompanyRegistration
{
    public static async Task<(bool ok, CompanyRegistrationFailure failure, string? message, Company? company, ApplicationUser? admin)> TryRegisterCompanyAsync(
        ApplicationDbContext db,
        UserManager<ApplicationUser> userManager,
        RegisterCompanyRequest req,
        CancellationToken cancellationToken = default)
    {
        var email = req.AdminEmail.Trim();
        if (await userManager.FindByEmailAsync(email) is not null)
            return (false, CompanyRegistrationFailure.EmailTaken, "A user with this email already exists.", null, null);

        var name = req.Name.Trim();
        if (await db.Companies.AnyAsync(c => c.Name == name, cancellationToken))
            return (false, CompanyRegistrationFailure.CompanyNameTaken, "A company with this name already exists.", null, null);

        var company = new Company { Name = name };
        db.Companies.Add(company);
        await db.SaveChangesAsync(cancellationToken);

        var admin = new ApplicationUser
        {
            UserName = email,
            Email = email,
            CompanyId = company.Id,
            EmailConfirmed = true
        };

        var createResult = await userManager.CreateAsync(admin, req.AdminPassword);
        if (!createResult.Succeeded)
        {
            var msg = string.Join("; ", createResult.Errors.Select(e => e.Description));
            return (false, CompanyRegistrationFailure.IdentityError, msg, null, null);
        }

        var roleResult = await userManager.AddToRoleAsync(admin, "Admin");
        if (!roleResult.Succeeded)
        {
            var msg = string.Join("; ", roleResult.Errors.Select(e => e.Description));
            return (false, CompanyRegistrationFailure.IdentityError, msg, null, null);
        }

        return (true, CompanyRegistrationFailure.None, null, company, admin);
    }
}

using Microsoft.AspNetCore.Http;

namespace ErpApi;

public static class RefreshTokenCookies
{
    public static void Set(HttpResponse response, JwtTokenHelper jwtTokenHelper, ApplicationUser user)
    {
        var refresh = jwtTokenHelper.GenerateRefreshToken(user);
        response.Cookies.Append("rt", refresh, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/"
        });
    }
}

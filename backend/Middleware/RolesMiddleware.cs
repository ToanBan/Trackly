using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using MyApi.Services;

namespace MyApi.Middleware;

/// <summary>
/// Gắn lên controller/action để khai báo role được phép truy cập.
/// Vd: [Roles("admin")] hoặc [Roles("admin", "staff")].
/// Endpoint KHÔNG có attribute này thì middleware cho đi qua bình thường.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class RolesAttribute : Attribute
{
    public List<string> AllowedRoles { get; }

    public RolesAttribute(params string[] roles)
    {
        AllowedRoles = (roles ?? new string[] { })
            .Select(r => r.Trim().ToLowerInvariant())
            .Where(r => r.Length > 0)
            .Distinct()
            .ToList();
    }
}

/// <summary>
/// Kiểm tra role của user hiện tại cho các endpoint có [Roles(...)].
/// Role được đọc từ DB (không chỉ tin claim trong token) nên thu hồi quyền
/// có hiệu lực ngay cả khi access token còn hạn.
/// Pipeline: thiếu/sai token -> 401, sai role -> 403.
/// </summary>
public class RolesMiddleware
{
    private readonly RequestDelegate _next;

    public RolesMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, UserService userService)
    {
        var endpoint = context.GetEndpoint();
        var rolesAttribute = endpoint?.Metadata.GetMetadata<RolesAttribute>();

        // Endpoint không khai báo role -> không kiểm tra.
        if (rolesAttribute == null || rolesAttribute.AllowedRoles.Count == 0)
        {
            await _next(context);
            return;
        }

        var claim = context.User.FindFirst(ClaimTypes.NameIdentifier)
            ?? context.User.FindFirst(JwtRegisteredClaimNames.Sub);

        if (claim == null || !int.TryParse(claim.Value, out var userId))
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsJsonAsync(new { message = "Authentication required" });
            return;
        }

        var user = await userService.GetUserByIdAsync(userId);
        var userRoles = user?.Roles ?? new List<string>();

        var allowed = rolesAttribute.AllowedRoles.Any(role => userRoles.Contains(role));

        if (!allowed)
        {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsJsonAsync(new { message = "You do not have permission to access this resource" });
            return;
        }

        await _next(context);
    }
}

using BuildingBlocks.Common.Security;

namespace ErpSystem.Api.Middlewares;

public class CurrentUserMiddleware
{
    private readonly RequestDelegate _next;

    public CurrentUserMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ICurrentUserContext currentUserContext)
    {
        if (currentUserContext is CurrentUserContext userCtx)
        {
            // Trích xuất từ Request Headers hoặc Claims (dùng cho dev/test)
            var userIdHeader = context.Request.Headers["X-User-Id"].FirstOrDefault();
            var tenantIdHeader = context.Request.Headers["X-Tenant-Id"].FirstOrDefault();
            var isSuperAdminHeader = context.Request.Headers["X-Is-SuperAdmin"].FirstOrDefault();

            userCtx.UserId = Guid.TryParse(userIdHeader, out var uid) ? uid : Guid.Parse("11111111-1111-1111-1111-111111111111");
            userCtx.TenantId = Guid.TryParse(tenantIdHeader, out var tid) ? tid : Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
            userCtx.Username = context.Request.Headers["X-Username"].FirstOrDefault() ?? "techlead@erp.local";
            userCtx.IsAuthenticated = true;
            userCtx.IsSuperAdmin = bool.TryParse(isSuperAdminHeader, out var isSa) && isSa;

            // Gán Data Scope giả lập cho Chỉ huy trưởng (Chỉ được truy cập Dự án 1)
            var allowedProjects = context.Request.Headers["X-Allowed-Projects"].FirstOrDefault();
            if (!string.IsNullOrEmpty(allowedProjects))
            {
                userCtx.AllowedProjectIdsList = allowedProjects
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(Guid.Parse)
                    .ToList();
            }
            else
            {
                // Mặc định cho phép dự án mẫu 1
                userCtx.AllowedProjectIdsList = [Guid.Parse("d1111111-1111-1111-1111-111111111111")];
            }
        }

        await _next(context);
    }
}

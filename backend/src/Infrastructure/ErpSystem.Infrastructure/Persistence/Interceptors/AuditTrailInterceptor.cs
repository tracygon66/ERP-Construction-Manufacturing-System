using BuildingBlocks.Common.Primitives;
using BuildingBlocks.Common.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace ErpSystem.Infrastructure.Persistence.Interceptors;

/// <summary>
/// Interceptor tự động điền CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
/// và chặn xóa cứng (chuyển sang Soft Delete IsDeleted = true).
/// </summary>
public class AuditTrailInterceptor : SaveChangesInterceptor
{
    private readonly ICurrentUserContext _currentUserContext;

    public AuditTrailInterceptor(ICurrentUserContext currentUserContext)
    {
        _currentUserContext = currentUserContext;
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        ApplyAuditInfo(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        ApplyAuditInfo(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void ApplyAuditInfo(DbContext? context)
    {
        if (context == null) return;

        var now = DateTime.UtcNow;
        var currentUserId = _currentUserContext.UserId;
        var currentTenantId = _currentUserContext.TenantId;

        foreach (var entry in context.ChangeTracker.Entries())
        {
            // Tự động gán TenantId cho các thực thể mới tạo
            if (entry.State == EntityState.Added && entry.Entity is ITenantScoped tenantScoped && tenantScoped.TenantId == Guid.Empty)
            {
                tenantScoped.TenantId = currentTenantId;
            }

            // Xử lý BaseEntity
            if (entry.Entity is BaseEntity<Guid> baseEntity)
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        baseEntity.CreatedAt = now;
                        baseEntity.CreatedBy = currentUserId;
                        baseEntity.IsDeleted = false;
                        break;

                    case EntityState.Modified:
                        baseEntity.UpdatedAt = now;
                        baseEntity.UpdatedBy = currentUserId;
                        break;

                    case EntityState.Deleted:
                        // Chuyển từ Hard Delete sang Soft Delete
                        entry.State = EntityState.Modified;
                        baseEntity.IsDeleted = true;
                        baseEntity.UpdatedAt = now;
                        baseEntity.UpdatedBy = currentUserId;
                        break;
                }
            }
        }
    }
}

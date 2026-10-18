using BuildingBlocks.Common.Security;

namespace ErpSystem.Infrastructure.Persistence.Extensions;

/// <summary>
/// Cung cấp các LINQ Extensions áp dụng Row-Level Security (RLS) cho truy vấn dữ liệu.
/// </summary>
public static class DataScopeQueryExtensions
{
    /// <summary>
    /// Giới hạn truy vấn chỉ trả về các bản ghi thuộc các dự án/công trường mà người dùng được cấp phép.
    /// Nếu là SuperAdmin, tự động bypass kiểm tra.
    /// </summary>
    public static IQueryable<T> ApplyProjectScope<T>(this IQueryable<T> query, ICurrentUserContext userContext)
        where T : class, IProjectScopedEntity
    {
        if (userContext.IsSuperAdmin)
        {
            return query;
        }

        var allowedIds = userContext.AllowedProjectIds;
        return query.Where(entity => allowedIds.Contains(entity.ProjectId));
    }

    /// <summary>
    /// Giới hạn truy vấn theo Kho vật tư được cấp phép.
    /// </summary>
    public static IQueryable<T> ApplyWarehouseScope<T>(this IQueryable<T> query, ICurrentUserContext userContext)
        where T : class, IWarehouseScopedEntity
    {
        if (userContext.IsSuperAdmin)
        {
            return query;
        }

        var allowedIds = userContext.AllowedWarehouseIds;
        return query.Where(entity => allowedIds.Contains(entity.WarehouseId));
    }

    /// <summary>
    /// Giới hạn truy vấn theo Nhà máy / Phân xưởng được cấp phép.
    /// </summary>
    public static IQueryable<T> ApplyFactoryScope<T>(this IQueryable<T> query, ICurrentUserContext userContext)
        where T : class, IFactoryScopedEntity
    {
        if (userContext.IsSuperAdmin)
        {
            return query;
        }

        var allowedIds = userContext.AllowedFactoryIds;
        return query.Where(entity => allowedIds.Contains(entity.FactoryId));
    }
}

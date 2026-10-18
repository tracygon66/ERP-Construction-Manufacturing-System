namespace BuildingBlocks.Common.Security;

/// <summary>
/// Cung cấp thông tin danh tính, vai trò và phạm vi dữ liệu (Data Scope) của người dùng hiện tại trong request pipeline.
/// </summary>
public interface ICurrentUserContext
{
    Guid UserId { get; }
    string Username { get; }
    string Email { get; }
    Guid TenantId { get; }
    bool IsAuthenticated { get; }
    bool IsSuperAdmin { get; }

    IReadOnlyList<string> Roles { get; }
    IReadOnlyList<string> Permissions { get; }

    // Data Scopes (Row-Level Security)
    IReadOnlyList<Guid> AllowedProjectIds { get; }
    IReadOnlyList<Guid> AllowedWarehouseIds { get; }
    IReadOnlyList<Guid> AllowedFactoryIds { get; }

    bool HasPermission(string permission);
    bool CanAccessProject(Guid projectId);
    bool CanAccessWarehouse(Guid warehouseId);
    bool CanAccessFactory(Guid factoryId);
}

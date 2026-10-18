namespace BuildingBlocks.Common.Security;

public class CurrentUserContext : ICurrentUserContext
{
    public Guid UserId { get; set; } = Guid.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public Guid TenantId { get; set; } = Guid.Empty;
    public bool IsAuthenticated { get; set; } = false;
    public bool IsSuperAdmin { get; set; } = false;

    public List<string> RolesList { get; set; } = [];
    public IReadOnlyList<string> Roles => RolesList.AsReadOnly();

    public List<string> PermissionsList { get; set; } = [];
    public IReadOnlyList<string> Permissions => PermissionsList.AsReadOnly();

    public List<Guid> AllowedProjectIdsList { get; set; } = [];
    public IReadOnlyList<Guid> AllowedProjectIds => AllowedProjectIdsList.AsReadOnly();

    public List<Guid> AllowedWarehouseIdsList { get; set; } = [];
    public IReadOnlyList<Guid> AllowedWarehouseIds => AllowedWarehouseIdsList.AsReadOnly();

    public List<Guid> AllowedFactoryIdsList { get; set; } = [];
    public IReadOnlyList<Guid> AllowedFactoryIds => AllowedFactoryIdsList.AsReadOnly();

    public bool HasPermission(string permission) =>
        IsSuperAdmin || PermissionsList.Contains(permission, StringComparer.OrdinalIgnoreCase);

    public bool CanAccessProject(Guid projectId) =>
        IsSuperAdmin || AllowedProjectIdsList.Contains(projectId);

    public bool CanAccessWarehouse(Guid warehouseId) =>
        IsSuperAdmin || AllowedWarehouseIdsList.Contains(warehouseId);

    public bool CanAccessFactory(Guid factoryId) =>
        IsSuperAdmin || AllowedFactoryIdsList.Contains(factoryId);
}

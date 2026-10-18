namespace BuildingBlocks.Common.Security;

/// <summary>
/// Thực thể bị giới hạn dữ liệu theo Công trình / Dự án xây dựng cụ thể.
/// </summary>
public interface IProjectScopedEntity
{
    Guid ProjectId { get; }
}

/// <summary>
/// Thực thể bị giới hạn dữ liệu theo Kho vật tư cụ thể.
/// </summary>
public interface IWarehouseScopedEntity
{
    Guid WarehouseId { get; }
}

/// <summary>
/// Thực thể bị giới hạn dữ liệu theo Nhà máy / Phân xưởng sản xuất cụ thể.
/// </summary>
public interface IFactoryScopedEntity
{
    Guid FactoryId { get; }
}

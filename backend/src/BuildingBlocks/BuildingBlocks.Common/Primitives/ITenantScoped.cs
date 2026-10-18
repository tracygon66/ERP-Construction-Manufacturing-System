namespace BuildingBlocks.Common.Primitives;

/// <summary>
/// Đánh dấu thực thể thuộc về một Tenant (Công ty con / Đơn vị thành viên) cụ thể.
/// EF Core Global Query Filter sẽ tự động cô lập dữ liệu theo TenantId của CurrentUser.
/// </summary>
public interface ITenantScoped
{
    Guid TenantId { get; set; }
}

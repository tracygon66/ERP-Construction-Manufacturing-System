using BuildingBlocks.Common.Primitives;
using BuildingBlocks.Common.Security;

namespace ErpSystem.Modules.Projects.Domain;

/// <summary>
/// Chi tiết hạng mục dự toán công trình (BOQ Item - Cây phân cấp WBS)
/// </summary>
public class ProjectBOQItem : BaseEntity<Guid>, ITenantScoped, IProjectScopedEntity
{
    public Guid TenantId { get; set; }
    public Guid ProjectId { get; set; }

    public Guid ProjectBOQId { get; set; }
    public ProjectBOQ ProjectBOQ { get; set; } = null!;

    // Tự liên kết cha - con để tạo cây phân cấp WBS (Cấp 1 -> Cấp 2 -> Cấp 3)
    public Guid? ParentId { get; set; }
    public ProjectBOQItem? Parent { get; set; }
    public ICollection<ProjectBOQItem> Children { get; set; } = new List<ProjectBOQItem>();

    public string ItemCode { get; set; } = string.Empty;     // Ví dụ: 1.1, AF.1111
    public string Description { get; set; } = string.Empty;  // Ví dụ: Đào đất hố móng
    public string Unit { get; set; } = string.Empty;         // m3, tấn, kg
    public decimal Quantity { get; set; }                   // Khối lượng
    public decimal UnitPrice { get; set; }                  // Đơn giá
    public decimal TotalAmount { get; set; }                // Thành tiền
    public int Level { get; set; } = 1;                     // Cấp WBS (1, 2, 3...)
    public int SortOrder { get; set; }                      // Thứ tự hiển thị
}

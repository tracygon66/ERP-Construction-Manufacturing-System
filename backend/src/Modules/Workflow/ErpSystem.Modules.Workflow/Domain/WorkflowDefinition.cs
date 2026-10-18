using BuildingBlocks.Common.Primitives;

namespace ErpSystem.Modules.Workflow.Domain;

/// <summary>
/// Định nghĩa cấu hình quy trình phê duyệt (Ví dụ: Quy trình duyệt dự toán BOQ > 5 tỷ).
/// </summary>
public class WorkflowDefinition : BaseEntity<Guid>, ITenantScoped
{
    public Guid TenantId { get; set; }

    /// <summary>
    /// Mã module áp dụng (ví dụ: "BOQ", "MATERIAL_REQUEST", "WORK_ORDER").
    /// </summary>
    public string ModuleCode { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    /// <summary>
    /// Độ ưu tiên khi có nhiều quy trình cùng khớp module (số càng lớn ưu tiên càng cao).
    /// </summary>
    public int Priority { get; set; } = 1;

    /// <summary>
    /// Hạn mức số tiền tối thiểu để kích hoạt quy trình này.
    /// </summary>
    public decimal? MinAmount { get; set; }

    /// <summary>
    /// Hạn mức số tiền tối đa để kích hoạt quy trình này.
    /// </summary>
    public decimal? MaxAmount { get; set; }

    public bool IsActive { get; set; } = true;

    public List<WorkflowStep> Steps { get; set; } = [];

    public bool Matches(string moduleCode, decimal amount)
    {
        if (!IsActive) return false;
        if (!string.Equals(ModuleCode, moduleCode, StringComparison.OrdinalIgnoreCase)) return false;

        if (MinAmount.HasValue && amount < MinAmount.Value) return false;
        if (MaxAmount.HasValue && amount > MaxAmount.Value) return false;

        return true;
    }
}

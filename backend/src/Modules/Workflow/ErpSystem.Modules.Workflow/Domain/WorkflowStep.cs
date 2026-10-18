using BuildingBlocks.Common.Primitives;

namespace ErpSystem.Modules.Workflow.Domain;

/// <summary>
/// Từng bước trong quy trình phê duyệt (Cấp 1, Cấp 2, Cấp 3).
/// </summary>
public class WorkflowStep : BaseEntity<Guid>
{
    public Guid WorkflowDefinitionId { get; set; }
    public WorkflowDefinition WorkflowDefinition { get; set; } = null!;

    public int StepOrder { get; set; }
    public string StepName { get; set; } = string.Empty;

    public ExecutionType ExecutionType { get; set; } = ExecutionType.Sequential;
    public AssigneeType AssigneeType { get; set; } = AssigneeType.ByRole;

    /// <summary>
    /// Giá trị phân giải người duyệt:
    /// - Nếu ByRole: RoleName (ví dụ: "CFO", "GENERAL_DIRECTOR").
    /// - Nếu DynamicProjectRole: ProjectRole (ví dụ: "SITE_MANAGER", "CHIEF_ENGINEER").
    /// - Nếu DirectUser: UserId dạng string.
    /// </summary>
    public string AssigneeValue { get; set; } = string.Empty;

    /// <summary>
    /// Thời hạn phê duyệt tối đa cho bước này (tính theo giờ). Quá hạn hệ thống sẽ cảnh báo / leo thang.
    /// </summary>
    public int? DueDurationHours { get; set; } = 48;
}

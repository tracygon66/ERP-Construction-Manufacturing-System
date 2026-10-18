using BuildingBlocks.Common.Primitives;

namespace ErpSystem.Modules.Workflow.Domain;

/// <summary>
/// Lưu vết bất biến (Audit Trail) của toàn bộ lịch sử phê duyệt, từ chối, ủy quyền.
/// </summary>
public class WorkflowInstanceLog : BaseEntity<Guid>
{
    public Guid WorkflowInstanceId { get; set; }
    public WorkflowInstance WorkflowInstance { get; set; } = null!;

    public int StepOrder { get; set; }
    public string StepName { get; set; } = string.Empty;

    public Guid ActionByUserId { get; set; }
    public string ActionByUsername { get; set; } = string.Empty;

    public WorkflowActionType Action { get; set; }
    public string? Comment { get; set; }

    public DateTime ActionAt { get; set; } = DateTime.UtcNow;
}

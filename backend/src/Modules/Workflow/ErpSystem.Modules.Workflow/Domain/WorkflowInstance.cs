using BuildingBlocks.Common.Primitives;

namespace ErpSystem.Modules.Workflow.Domain;

/// <summary>
/// Phiên bản thực thi quy trình cho một phiếu nghiệp vụ cụ thể.
/// </summary>
public class WorkflowInstance : BaseEntity<Guid>, ITenantScoped
{
    public Guid TenantId { get; set; }

    public Guid WorkflowDefinitionId { get; set; }
    public WorkflowDefinition WorkflowDefinition { get; set; } = null!;

    public string TargetEntityType { get; set; } = string.Empty;
    public Guid TargetEntityId { get; set; }

    public WorkflowStatus CurrentStatus { get; set; } = WorkflowStatus.Draft;
    public int CurrentStepOrder { get; set; } = 1;

    public List<WorkflowInstanceLog> Logs { get; set; } = [];

    /// <summary>
    /// Danh sách UserId của những người đang có quyền bấm Duyệt ở bước hiện tại.
    /// </summary>
    public List<Guid> CurrentPendingApproverIds { get; set; } = [];

    public DateTime? CompletedAt { get; set; }
}

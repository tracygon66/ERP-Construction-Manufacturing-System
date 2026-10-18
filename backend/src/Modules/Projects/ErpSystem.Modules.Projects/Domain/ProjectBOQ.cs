using BuildingBlocks.Common.Primitives;
using BuildingBlocks.Common.Security;
using ErpSystem.Modules.Workflow.Domain;

namespace ErpSystem.Modules.Projects.Domain;

/// <summary>
/// Bảng Dự toán công trình (BOQ - Bill of Quantities).
/// Minh chứng cho kiến trúc tích hợp: ITenantScoped + IProjectScopedEntity (RLS) + IApprovableEntity (Workflow).
/// </summary>
public class ProjectBOQ : BaseEntity<Guid>, ITenantScoped, IProjectScopedEntity, IApprovableEntity
{
    public Guid TenantId { get; set; }

    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public string BOQCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int RevisionNumber { get; set; } = 1;

    public decimal TotalEstimatedAmount { get; set; }

    // --- Triển khai IApprovableEntity cho Dynamic Workflow Engine ---
    public string EntityType => "BOQ";
    public WorkflowStatus WorkflowStatus { get; set; } = WorkflowStatus.Draft;
    public Guid? CurrentWorkflowInstanceId { get; set; }

    public decimal GetApprovalAmount() => TotalEstimatedAmount;
}

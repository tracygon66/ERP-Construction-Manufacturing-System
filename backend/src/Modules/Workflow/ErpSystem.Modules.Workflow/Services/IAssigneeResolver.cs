using ErpSystem.Modules.Workflow.Domain;

namespace ErpSystem.Modules.Workflow.Services;

/// <summary>
/// Interface phân giải danh sách người phê duyệt động dựa vào cấu hình bước và thực thể nghiệp vụ.
/// </summary>
public interface IAssigneeResolver
{
    AssigneeType SupportedType { get; }

    Task<List<Guid>> ResolveApproversAsync(
        WorkflowStep step,
        IApprovableEntity entity,
        CancellationToken cancellationToken = default);
}

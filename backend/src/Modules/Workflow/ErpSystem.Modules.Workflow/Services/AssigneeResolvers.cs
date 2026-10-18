using BuildingBlocks.Common.Security;
using ErpSystem.Modules.Workflow.Domain;

namespace ErpSystem.Modules.Workflow.Services;

/// <summary>
/// Phân giải trực tiếp đích danh UserId.
/// </summary>
public class DirectUserAssigneeResolver : IAssigneeResolver
{
    public AssigneeType SupportedType => AssigneeType.DirectUser;

    public Task<List<Guid>> ResolveApproversAsync(WorkflowStep step, IApprovableEntity entity, CancellationToken cancellationToken = default)
    {
        if (Guid.TryParse(step.AssigneeValue, out var userId))
        {
            return Task.FromResult(new List<Guid> { userId });
        }
        return Task.FromResult(new List<Guid>());
    }
}

/// <summary>
/// Phân giải theo Role hệ thống (ví dụ: CFO, GENERAL_DIRECTOR).
/// </summary>
public class ByRoleAssigneeResolver : IAssigneeResolver
{
    public AssigneeType SupportedType => AssigneeType.ByRole;

    public Task<List<Guid>> ResolveApproversAsync(WorkflowStep step, IApprovableEntity entity, CancellationToken cancellationToken = default)
    {
        // Trong hệ thống thực tế: Query từ Identity DbContext lấy danh sách UserId có Role tương ứng.
        // Demo implementation: trả về danh sách giả lập.
        return Task.FromResult(new List<Guid> { Guid.NewGuid() });
    }
}

/// <summary>
/// Phân giải theo vai trò dự án động (ví dụ: Tìm Chỉ huy trưởng của công trình cụ thể này).
/// </summary>
public class DynamicProjectRoleAssigneeResolver : IAssigneeResolver
{
    public AssigneeType SupportedType => AssigneeType.DynamicProjectRole;

    public Task<List<Guid>> ResolveApproversAsync(WorkflowStep step, IApprovableEntity entity, CancellationToken cancellationToken = default)
    {
        if (entity is IProjectScopedEntity projectScopedEntity)
        {
            // Truy vấn từ bảng ProjectMembers: Lấy UserId có vai trò step.AssigneeValue (ví dụ: "SITE_MANAGER") thuộc ProjectId này
            return Task.FromResult(new List<Guid> { Guid.NewGuid() });
        }

        return Task.FromResult(new List<Guid>());
    }
}

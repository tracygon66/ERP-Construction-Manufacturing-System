using BuildingBlocks.Common.Primitives;

namespace ErpSystem.Modules.Projects.Domain;

/// <summary>
/// Thành viên ban chỉ huy hoặc đội ngũ kỹ sư được phân công tại công trình.
/// Dùng để phân giải quyền truy cập (RLS) và người duyệt động (Dynamic Assignee).
/// </summary>
public class ProjectMember : BaseEntity<Guid>
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public Guid UserId { get; set; }
    public string MemberName { get; set; } = string.Empty;

    /// <summary>
    /// Vai trò trong dự án (ví dụ: "SITE_MANAGER", "CHIEF_ENGINEER", "QS_ENGINEER", "SAFETY_OFFICER").
    /// </summary>
    public string ProjectRole { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}

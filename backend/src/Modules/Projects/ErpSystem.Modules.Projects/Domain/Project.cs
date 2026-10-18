using BuildingBlocks.Common.Primitives;

namespace ErpSystem.Modules.Projects.Domain;

/// <summary>
/// Thực thể Công trình / Dự án Xây dựng.
/// </summary>
public class Project : BaseEntity<Guid>, ITenantScoped
{
    public Guid TenantId { get; set; }

    public string ProjectCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Location { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime? ExpectedEndDate { get; set; }

    public decimal TotalBudget { get; set; }
    public decimal TotalSpent { get; set; }

    public string Status { get; set; } = "InPlanning"; // InPlanning, InProgress, Suspended, Completed

    public List<ProjectMember> Members { get; set; } = [];
    public List<ProjectBOQ> BOQs { get; set; } = [];
}

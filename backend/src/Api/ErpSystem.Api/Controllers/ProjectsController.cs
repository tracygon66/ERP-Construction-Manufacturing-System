using BuildingBlocks.Common.Security;
using ErpSystem.Infrastructure.Persistence;
using ErpSystem.Infrastructure.Persistence.Extensions;
using ErpSystem.Modules.Projects.Domain;
using ErpSystem.Modules.Workflow.Domain;
using ErpSystem.Modules.Workflow.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly ICurrentUserContext _currentUserContext;
    private readonly IWorkflowEngine _workflowEngine;

    public ProjectsController(
        AppDbContext dbContext,
        ICurrentUserContext currentUserContext,
        IWorkflowEngine workflowEngine)
    {
        _dbContext = dbContext;
        _currentUserContext = currentUserContext;
        _workflowEngine = workflowEngine;
    }

    /// <summary>
    /// Lấy danh sách dự án. Áp dụng Row-Level Security: Chỉ trả về các dự án thuộc phạm vi cho phép của User.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetProjects(CancellationToken ct)
    {
        var query = _dbContext.Projects.AsNoTracking();

        // Nếu không phải SuperAdmin, chỉ lấy các dự án nằm trong AllowedProjectIds
        if (!_currentUserContext.IsSuperAdmin)
        {
            var allowedIds = _currentUserContext.AllowedProjectIds;
            query = query.Where(p => allowedIds.Contains(p.Id));
        }

        var projects = await query.ToListAsync(ct);
        return Ok(new
        {
            CurrentUser = _currentUserContext.Username,
            IsSuperAdmin = _currentUserContext.IsSuperAdmin,
            AllowedProjectIds = _currentUserContext.AllowedProjectIds,
            Data = projects
        });
    }

    /// <summary>
    /// Lấy danh sách Dự toán BOQ của dự án. Minh chứng sử dụng LINQ Extension: ApplyProjectScope!
    /// </summary>
    [HttpGet("{projectId:guid}/boqs")]
    public async Task<IActionResult> GetProjectBOQs(Guid projectId, CancellationToken ct)
    {
        // Kiểm tra quyền truy cập dự án
        if (!_currentUserContext.CanAccessProject(projectId))
        {
            return Forbid("Bạn không có quyền truy cập vào dữ liệu dự án này.");
        }

        var boqs = await _dbContext.ProjectBOQs
            .AsNoTracking()
            .ApplyProjectScope(_currentUserContext) // Tự động chặn rò rỉ dữ liệu qua RLS
            .Where(b => b.ProjectId == projectId)
            .ToListAsync(ct);

        return Ok(boqs);
    }

    /// <summary>
    /// Tạo mới một bảng dự toán BOQ ở trạng thái Draft.
    /// </summary>
    [HttpPost("{projectId:guid}/boqs")]
    public async Task<IActionResult> CreateBOQ(Guid projectId, [FromBody] CreateBOQRequest request, CancellationToken ct)
    {
        if (!_currentUserContext.CanAccessProject(projectId))
        {
            return Forbid("Bạn không có quyền lập dự toán cho công trình này.");
        }

        var boq = new ProjectBOQ
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            BOQCode = request.BOQCode,
            Name = request.Name,
            TotalEstimatedAmount = request.TotalEstimatedAmount,
            WorkflowStatus = WorkflowStatus.Draft
        };

        _dbContext.ProjectBOQs.Add(boq);
        await _dbContext.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetProjectBOQs), new { projectId }, boq);
    }

    /// <summary>
    /// Gửi phê duyệt Dự toán BOQ qua Dynamic Workflow Engine!
    /// </summary>
    [HttpPost("{projectId:guid}/boqs/{boqId:guid}/submit")]
    public async Task<IActionResult> SubmitBOQ(Guid projectId, Guid boqId, CancellationToken ct)
    {
        if (!_currentUserContext.CanAccessProject(projectId))
        {
            return Forbid("Bạn không có quyền thao tác trên dự án này.");
        }

        var boq = await _dbContext.ProjectBOQs.FirstOrDefaultAsync(b => b.Id == boqId && b.ProjectId == projectId, ct);
        if (boq == null) return NotFound("Không tìm thấy bảng dự toán BOQ.");

        var submitResult = await _workflowEngine.SubmitAsync(boq, _currentUserContext, ct);
        if (submitResult.IsFailure)
        {
            return BadRequest(new { Message = submitResult.Error });
        }

        var instance = submitResult.Value;
        _dbContext.WorkflowInstances.Add(instance);
        await _dbContext.SaveChangesAsync(ct);

        return Ok(new
        {
            Message = "Bảng dự toán BOQ đã được gửi phê duyệt thành công.",
            BOQId = boq.Id,
            WorkflowStatus = boq.WorkflowStatus.ToString(),
            WorkflowInstanceId = instance.Id
        });
    }

    /// <summary>
    /// Lấy danh sách các đầu việc bóc tách BOQ WBS [ERP-05]
    /// </summary>
    [HttpGet("{projectId:guid}/boqs/{boqId:guid}/items")]
    public async Task<IActionResult> GetBOQItems(Guid projectId, Guid boqId, CancellationToken ct)
    {
        if (!_currentUserContext.CanAccessProject(projectId))
        {
            return Forbid("Bạn không có quyền truy cập dữ liệu dự án này.");
        }

        var items = await _dbContext.ProjectBOQItems
            .AsNoTracking()
            .Where(x => x.ProjectId == projectId && x.ProjectBOQId == boqId)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);

        return Ok(items);
    }
}

public record CreateBOQRequest(string BOQCode, string Name, decimal TotalEstimatedAmount);

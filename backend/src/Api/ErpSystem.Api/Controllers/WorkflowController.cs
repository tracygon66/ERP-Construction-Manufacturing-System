using BuildingBlocks.Common.Security;
using ErpSystem.Infrastructure.Persistence;
using ErpSystem.Modules.Workflow.Domain;
using ErpSystem.Modules.Workflow.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkflowController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly ICurrentUserContext _currentUserContext;
    private readonly IWorkflowEngine _workflowEngine;

    public WorkflowController(
        AppDbContext dbContext,
        ICurrentUserContext currentUserContext,
        IWorkflowEngine workflowEngine)
    {
        _dbContext = dbContext;
        _currentUserContext = currentUserContext;
        _workflowEngine = workflowEngine;
    }

    /// <summary>
    /// Lấy danh sách các phiếu đang chờ Người dùng hiện tại phê duyệt.
    /// </summary>
    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingApprovals(CancellationToken ct)
    {
        var currentUserId = _currentUserContext.UserId;

        var pendingInstances = await _dbContext.WorkflowInstances
            .AsNoTracking()
            .Include(w => w.WorkflowDefinition)
            .Include(w => w.Logs)
            .Where(w => w.CurrentStatus == WorkflowStatus.PendingApproval)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync(ct);

        return Ok(pendingInstances);
    }

    /// <summary>
    /// Bấm Duyệt (Approve) một phiếu nghiệp vụ.
    /// </summary>
    [HttpPost("{instanceId:guid}/approve")]
    public async Task<IActionResult> Approve(Guid instanceId, [FromBody] ApproveRequest request, CancellationToken ct)
    {
        var instance = await _dbContext.WorkflowInstances
            .Include(w => w.Logs)
            .FirstOrDefaultAsync(w => w.Id == instanceId, ct);

        if (instance == null) return NotFound("Không tìm thấy phiên phê duyệt.");

        var result = await _workflowEngine.ApproveAsync(instanceId, request.Comment, _currentUserContext, ct);
        if (result.IsFailure) return BadRequest(new { Message = result.Error });

        instance.CurrentStatus = WorkflowStatus.Approved;
        instance.Logs.Add(new WorkflowInstanceLog
        {
            StepOrder = instance.CurrentStepOrder,
            StepName = "Phê duyệt cấp 1",
            ActionByUserId = _currentUserContext.UserId,
            ActionByUsername = _currentUserContext.Username,
            Action = WorkflowActionType.Approve,
            Comment = request.Comment ?? "Đồng ý phê duyệt",
            ActionAt = DateTime.UtcNow
        });

        // Cập nhật trạng thái phiếu nghiệp vụ mục tiêu nếu là BOQ
        if (instance.TargetEntityType == "BOQ")
        {
            var boq = await _dbContext.ProjectBOQs.FirstOrDefaultAsync(b => b.Id == instance.TargetEntityId, ct);
            if (boq != null) boq.WorkflowStatus = WorkflowStatus.Approved;
        }

        await _dbContext.SaveChangesAsync(ct);

        return Ok(new { Message = "Đã phê duyệt thành công.", Status = instance.CurrentStatus.ToString() });
    }

    /// <summary>
    /// Bấm Từ Chối (Reject) một phiếu nghiệp vụ kèm lý do.
    /// </summary>
    [HttpPost("{instanceId:guid}/reject")]
    public async Task<IActionResult> Reject(Guid instanceId, [FromBody] RejectRequest request, CancellationToken ct)
    {
        var instance = await _dbContext.WorkflowInstances
            .Include(w => w.Logs)
            .FirstOrDefaultAsync(w => w.Id == instanceId, ct);

        if (instance == null) return NotFound("Không tìm thấy phiên phê duyệt.");

        var result = await _workflowEngine.RejectAsync(instanceId, request.Reason, _currentUserContext, ct);
        if (result.IsFailure) return BadRequest(new { Message = result.Error });

        instance.CurrentStatus = WorkflowStatus.Rejected;
        instance.Logs.Add(new WorkflowInstanceLog
        {
            StepOrder = instance.CurrentStepOrder,
            StepName = "Từ chối",
            ActionByUserId = _currentUserContext.UserId,
            ActionByUsername = _currentUserContext.Username,
            Action = WorkflowActionType.Reject,
            Comment = request.Reason,
            ActionAt = DateTime.UtcNow
        });

        // Cập nhật trạng thái phiếu mục tiêu
        if (instance.TargetEntityType == "BOQ")
        {
            var boq = await _dbContext.ProjectBOQs.FirstOrDefaultAsync(b => b.Id == instance.TargetEntityId, ct);
            if (boq != null) boq.WorkflowStatus = WorkflowStatus.Rejected;
        }

        await _dbContext.SaveChangesAsync(ct);

        return Ok(new { Message = "Đã từ chối phê duyệt.", Status = instance.CurrentStatus.ToString() });
    }

    /// <summary>
    /// Lấy lịch sử dòng thời gian (Timeline & Audit Trail) của quy trình phê duyệt.
    /// </summary>
    [HttpGet("{instanceId:guid}/timeline")]
    public async Task<IActionResult> GetTimeline(Guid instanceId, CancellationToken ct)
    {
        var instance = await _dbContext.WorkflowInstances
            .AsNoTracking()
            .Include(w => w.Logs)
            .FirstOrDefaultAsync(w => w.Id == instanceId, ct);

        if (instance == null) return NotFound();

        return Ok(new
        {
            InstanceId = instance.Id,
            Status = instance.CurrentStatus.ToString(),
            TargetEntityType = instance.TargetEntityType,
            TargetEntityId = instance.TargetEntityId,
            Logs = instance.Logs.OrderBy(l => l.ActionAt).ToList()
        });
    }
}

public record ApproveRequest(string? Comment);
public record RejectRequest(string Reason);

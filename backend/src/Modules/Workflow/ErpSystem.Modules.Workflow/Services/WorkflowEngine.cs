using BuildingBlocks.Common.Primitives;
using BuildingBlocks.Common.Security;
using ErpSystem.Modules.Workflow.Domain;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Workflow.Services;

public class WorkflowEngine : IWorkflowEngine
{
    private readonly IEnumerable<IAssigneeResolver> _assigneeResolvers;

    public WorkflowEngine(IEnumerable<IAssigneeResolver> assigneeResolvers)
    {
        _assigneeResolvers = assigneeResolvers;
    }

    public async Task<Result<WorkflowInstance>> SubmitAsync(
        IApprovableEntity entity,
        ICurrentUserContext userContext,
        CancellationToken cancellationToken = default)
    {
        if (entity.WorkflowStatus == WorkflowStatus.PendingApproval)
        {
            return Result<WorkflowInstance>.Failure("Phiếu này hiện đang trong quá trình phê duyệt.");
        }

        // 1. Tạo Workflow Instance giả lập demo
        var definition = new WorkflowDefinition
        {
            ModuleCode = entity.EntityType,
            Name = $"Quy trình duyệt {entity.EntityType}",
            Priority = 1,
            Steps =
            [
                new WorkflowStep
                {
                    StepOrder = 1,
                    StepName = "Chỉ huy trưởng / Trưởng phòng kỹ thuật duyệt",
                    ExecutionType = ExecutionType.Sequential,
                    AssigneeType = AssigneeType.DynamicProjectRole,
                    AssigneeValue = "SITE_MANAGER"
                },
                new WorkflowStep
                {
                    StepOrder = 2,
                    StepName = "Giám đốc Khối / Ban Giám đốc duyệt",
                    ExecutionType = ExecutionType.Sequential,
                    AssigneeType = AssigneeType.ByRole,
                    AssigneeValue = "GENERAL_DIRECTOR"
                }
            ]
        };

        var instance = new WorkflowInstance
        {
            TenantId = userContext.TenantId,
            WorkflowDefinition = definition,
            WorkflowDefinitionId = definition.Id,
            TargetEntityType = entity.EntityType,
            TargetEntityId = entity.Id,
            CurrentStatus = WorkflowStatus.PendingApproval,
            CurrentStepOrder = 1,
            CurrentPendingApproverIds = [userContext.UserId] // Demo gán quyền duyệt
        };

        instance.Logs.Add(new WorkflowInstanceLog
        {
            StepOrder = 0,
            StepName = "Khởi tạo phiếu",
            ActionByUserId = userContext.UserId,
            ActionByUsername = userContext.Username,
            Action = WorkflowActionType.Submit,
            Comment = "Đã gửi phê duyệt",
            ActionAt = DateTime.UtcNow
        });

        entity.WorkflowStatus = WorkflowStatus.PendingApproval;
        entity.CurrentWorkflowInstanceId = instance.Id;

        return Result<WorkflowInstance>.Success(instance);
    }

    public Task<Result<WorkflowInstance>> ApproveAsync(
        Guid workflowInstanceId,
        string? comment,
        ICurrentUserContext userContext,
        CancellationToken cancellationToken = default)
    {
        // Trong hệ thống đầy đủ: Load từ DB và validate người duyệt
        var instance = new WorkflowInstance
        {
            Id = workflowInstanceId,
            CurrentStatus = WorkflowStatus.Approved,
            CompletedAt = DateTime.UtcNow
        };

        instance.Logs.Add(new WorkflowInstanceLog
        {
            StepOrder = 1,
            StepName = "Cấp 1 phê duyệt",
            ActionByUserId = userContext.UserId,
            ActionByUsername = userContext.Username,
            Action = WorkflowActionType.Approve,
            Comment = comment ?? "Đã đồng ý phê duyệt",
            ActionAt = DateTime.UtcNow
        });

        return Task.FromResult(Result<WorkflowInstance>.Success(instance));
    }

    public Task<Result<WorkflowInstance>> RejectAsync(
        Guid workflowInstanceId,
        string reason,
        ICurrentUserContext userContext,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(reason))
        {
            return Task.FromResult(Result<WorkflowInstance>.Failure("Bắt buộc phải nhập lý do khi từ chối phê duyệt."));
        }

        var instance = new WorkflowInstance
        {
            Id = workflowInstanceId,
            CurrentStatus = WorkflowStatus.Rejected,
            CompletedAt = DateTime.UtcNow
        };

        instance.Logs.Add(new WorkflowInstanceLog
        {
            StepOrder = 1,
            StepName = "Từ chối phê duyệt",
            ActionByUserId = userContext.UserId,
            ActionByUsername = userContext.Username,
            Action = WorkflowActionType.Reject,
            Comment = reason,
            ActionAt = DateTime.UtcNow
        });

        return Task.FromResult(Result<WorkflowInstance>.Success(instance));
    }
}

using BuildingBlocks.Common.Primitives;
using BuildingBlocks.Common.Security;
using ErpSystem.Modules.Workflow.Domain;

namespace ErpSystem.Modules.Workflow.Services;

public interface IWorkflowEngine
{
    Task<Result<WorkflowInstance>> SubmitAsync(
        IApprovableEntity entity,
        ICurrentUserContext userContext,
        CancellationToken cancellationToken = default);

    Task<Result<WorkflowInstance>> ApproveAsync(
        Guid workflowInstanceId,
        string? comment,
        ICurrentUserContext userContext,
        CancellationToken cancellationToken = default);

    Task<Result<WorkflowInstance>> RejectAsync(
        Guid workflowInstanceId,
        string reason,
        ICurrentUserContext userContext,
        CancellationToken cancellationToken = default);
}

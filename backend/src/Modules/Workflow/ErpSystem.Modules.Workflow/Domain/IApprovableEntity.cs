using BuildingBlocks.Common.Primitives;

namespace ErpSystem.Modules.Workflow.Domain;

/// <summary>
/// Interface cốt lõi mà bất kỳ thực thể nghiệp vụ nào (BOQ, MaterialRequest, WorkOrder, PurchaseOrder)
/// cần tham gia vào luồng phê duyệt động đều phải kế thừa.
/// </summary>
public interface IApprovableEntity
{
    Guid Id { get; }
    string EntityType { get; }
    WorkflowStatus WorkflowStatus { get; set; }
    Guid? CurrentWorkflowInstanceId { get; set; }

    /// <summary>
    /// Số tiền hoặc giá trị định lượng dùng để khớp quy tắc hạn mức duyệt (Approval Threshold).
    /// </summary>
    decimal GetApprovalAmount();
}

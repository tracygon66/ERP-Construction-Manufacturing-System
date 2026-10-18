namespace ErpSystem.Modules.Workflow.Domain;

public enum WorkflowStatus
{
    Draft = 0,
    PendingApproval = 1,
    Approved = 2,
    Rejected = 3,
    Cancelled = 4
}

public enum ExecutionType
{
    Sequential = 1, // Duyệt tuần tự qua từng cấp
    ParallelAll = 2, // Duyệt song song, bắt buộc tất cả người duyệt đồng ý
    ParallelAny = 3  // Duyệt song song, chỉ cần 1 người duyệt đồng ý
}

public enum AssigneeType
{
    DirectUser = 1,       // Chỉ định đích danh UserId
    ByRole = 2,           // Theo chức vụ / Role hệ thống (ví dụ: CFO, GeneralDirector)
    DynamicProjectRole = 3, // Người giữ vai trò trong dự án (ví dụ: Chỉ huy trưởng công trình)
    DynamicFactoryRole = 4  // Người giữ vai trò trong nhà máy (ví dụ: Quản đốc phân xưởng)
}

public enum WorkflowActionType
{
    Submit = 1,
    Approve = 2,
    Reject = 3,
    Cancel = 4,
    Delegate = 5
}

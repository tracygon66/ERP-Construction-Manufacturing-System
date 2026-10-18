import React, { useState } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { AppHeader } from './components/Layout/AppHeader';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { WorkflowApprovalsPage } from './pages/WorkflowApprovalsPage';
import { Project, ProjectBOQ, WorkflowInstance, UserContext } from './types/erp';
import { ShieldCheck, Lock, Layers } from 'lucide-react';

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    tenantId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    projectCode: 'PRJ-LANDMARK-01',
    name: 'Tòa Nhà Hỗn Hợp Landmark Tower (Hà Nội)',
    location: 'Cầu Giấy, Hà Nội',
    startDate: '2026-07-01T00:00:00Z',
    expectedEndDate: '2028-01-01T00:00:00Z',
    totalBudget: 150_000_000_000,
    totalSpent: 35_000_000_000,
    status: 'InProgress'
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    tenantId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    projectCode: 'PRJ-GRANDPARK-02',
    name: 'Khu Đô Thị Sinh Thái Grand Park (TP.HCM)',
    location: 'Quận 9, TP.HCM',
    startDate: '2026-02-15T00:00:00Z',
    expectedEndDate: '2028-06-30T00:00:00Z',
    totalBudget: 320_000_000_000,
    totalSpent: 120_000_000_000,
    status: 'InProgress'
  }
];

const INITIAL_BOQS: ProjectBOQ[] = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    tenantId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    projectId: 'd1111111-1111-1111-1111-111111111111',
    boqCode: 'BOQ-LANDMARK-FOUNDATION-01',
    name: 'Dự toán phần móng và hầm cọc cừ B1-B3',
    revisionNumber: 1,
    totalEstimatedAmount: 28_500_000_000,
    workflowStatus: 'PendingApproval',
    currentWorkflowInstanceId: 'w1111111-1111-1111-1111-111111111111',
    createdAt: '2026-10-15T08:30:00Z'
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    tenantId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    projectId: 'd1111111-1111-1111-1111-111111111111',
    boqCode: 'BOQ-LANDMARK-STRUCTURE-02',
    name: 'Dự toán kết cấu bê tông cốt thép thân tháp (Tầng 1-15)',
    revisionNumber: 1,
    totalEstimatedAmount: 45_000_000_000,
    workflowStatus: 'Draft',
    createdAt: '2026-10-18T10:00:00Z'
  }
];

const INITIAL_WORKFLOWS: WorkflowInstance[] = [
  {
    id: 'w1111111-1111-1111-1111-111111111111',
    tenantId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    workflowDefinitionId: 'def-boq-standard',
    targetEntityType: 'BOQ',
    targetEntityId: 'b1111111-1111-1111-1111-111111111111',
    currentStatus: 'PendingApproval',
    currentStepOrder: 1,
    createdAt: '2026-10-15T08:30:00Z',
    logs: [
      {
        id: 'log-1',
        stepOrder: 0,
        stepName: 'Khởi tạo phiếu',
        actionByUsername: 'ky_su_hien_truong@erp.local',
        action: 'submit',
        comment: 'Đã hoàn thiện hồ sơ bóc tách dự toán phần móng, kính gửi Chỉ huy trưởng phê duyệt.',
        actionAt: '2026-10-15T08:30:00Z'
      }
    ]
  }
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeTimelineInstanceId, setActiveTimelineInstanceId] = useState<string | null>(null);

  // User context with RLS toggling
  const [userContext, setUserContext] = useState<UserContext>({
    userId: '11111111-1111-1111-1111-111111111111',
    username: 'techlead@erp.local',
    tenantId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    isSuperAdmin: false, // Default: Non-admin (demonstrates RLS)
    allowedProjectIds: ['d1111111-1111-1111-1111-111111111111'] // Only Landmark Tower
  });

  // State
  const [projects] = useState<Project[]>(INITIAL_PROJECTS);
  const [boqs, setBoqs] = useState<ProjectBOQ[]>(INITIAL_BOQS);
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>(INITIAL_WORKFLOWS);

  // Filter projects based on RLS
  const visibleProjects = userContext.isSuperAdmin
    ? projects
    : projects.filter((p) => userContext.allowedProjectIds.includes(p.id));

  // Pending workflows
  const pendingWorkflows = workflows.filter((w) => w.currentStatus === 'PendingApproval');

  // Handle Create BOQ
  const handleCreateBOQ = (projectId: string, boqCode: string, name: string, amount: number) => {
    const newBOQ: ProjectBOQ = {
      id: 'b-' + Date.now(),
      tenantId: userContext.tenantId,
      projectId,
      boqCode,
      name,
      revisionNumber: 1,
      totalEstimatedAmount: amount,
      workflowStatus: 'Draft',
      createdAt: new Date().toISOString()
    };
    setBoqs((prev) => [newBOQ, ...prev]);
  };

  // Handle Submit BOQ into Workflow Engine
  const handleSubmitBOQ = (_projectId: string, boqId: string) => {
    const newInstanceId = 'w-' + Date.now();
    const newInstance: WorkflowInstance = {
      id: newInstanceId,
      tenantId: userContext.tenantId,
      workflowDefinitionId: 'def-boq-standard',
      targetEntityType: 'BOQ',
      targetEntityId: boqId,
      currentStatus: 'PendingApproval',
      currentStepOrder: 1,
      createdAt: new Date().toISOString(),
      logs: [
        {
          id: 'log-' + Date.now(),
          stepOrder: 0,
          stepName: 'Gửi phê duyệt',
          actionByUsername: userContext.username,
          action: 'submit',
          comment: 'Đã gửi dự toán vào hệ thống phê duyệt động.',
          actionAt: new Date().toISOString()
        }
      ]
    };

    setWorkflows((prev) => [newInstance, ...prev]);
    setBoqs((prev) =>
      prev.map((b) =>
        b.id === boqId
          ? { ...b, workflowStatus: 'PendingApproval', currentWorkflowInstanceId: newInstanceId }
          : b
      )
    );

    setActiveTab('approvals');
    setActiveTimelineInstanceId(newInstanceId);
  };

  // Handle Approve
  const handleApprove = (instanceId: string, comment?: string) => {
    const targetWorkflow = workflows.find((w) => w.id === instanceId);
    if (!targetWorkflow) return;

    const newLog = {
      id: 'log-' + Date.now(),
      stepOrder: targetWorkflow.currentStepOrder,
      stepName: 'Chỉ huy trưởng phê duyệt',
      actionByUsername: userContext.username,
      action: 'approve',
      comment: comment || 'Đã đồng ý phê duyệt dự toán.',
      actionAt: new Date().toISOString()
    };

    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === instanceId
          ? { ...w, currentStatus: 'Approved', completedAt: new Date().toISOString(), logs: [...w.logs, newLog] }
          : w
      )
    );

    // Update BOQ
    setBoqs((prev) =>
      prev.map((b) => (b.id === targetWorkflow.targetEntityId ? { ...b, workflowStatus: 'Approved' } : b))
    );
  };

  // Handle Reject
  const handleReject = (instanceId: string, reason: string) => {
    const targetWorkflow = workflows.find((w) => w.id === instanceId);
    if (!targetWorkflow) return;

    const newLog = {
      id: 'log-' + Date.now(),
      stepOrder: targetWorkflow.currentStepOrder,
      stepName: 'Từ chối phê duyệt',
      actionByUsername: userContext.username,
      action: 'reject',
      comment: reason,
      actionAt: new Date().toISOString()
    };

    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === instanceId
          ? { ...w, currentStatus: 'Rejected', completedAt: new Date().toISOString(), logs: [...w.logs, newLog] }
          : w
      )
    );

    // Update BOQ
    setBoqs((prev) =>
      prev.map((b) => (b.id === targetWorkflow.targetEntityId ? { ...b, workflowStatus: 'Rejected' } : b))
    );
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} pendingCount={pendingWorkflows.length} />

      <div className="main-content">
        <AppHeader userContext={userContext} setUserContext={setUserContext} />

        <main className="page-body">
          {activeTab === 'dashboard' && (
            <DashboardPage
              projects={visibleProjects}
              pendingWorkflows={pendingWorkflows}
              setActiveTab={setActiveTab}
              isSuperAdmin={userContext.isSuperAdmin}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsPage
              projects={visibleProjects}
              boqs={boqs}
              onCreateBOQ={handleCreateBOQ}
              onSubmitBOQ={handleSubmitBOQ}
              onViewTimeline={(instId) => {
                setActiveTab('approvals');
                setActiveTimelineInstanceId(instId);
              }}
              isSuperAdmin={userContext.isSuperAdmin}
            />
          )}

          {activeTab === 'approvals' && (
            <WorkflowApprovalsPage
              pendingWorkflows={pendingWorkflows}
              onApprove={handleApprove}
              onReject={handleReject}
              activeTimelineInstanceId={activeTimelineInstanceId}
              setActiveTimelineInstanceId={setActiveTimelineInstanceId}
            />
          )}

          {activeTab === 'manufacturing' && (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ background: 'rgba(0,242,254,0.1)', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Layers size={30} color="var(--cyan)" />
              </div>
              <h2 style={{ marginBottom: '0.8rem' }}>Phân Hệ Sản Xuất & Điều Hành Nhà Máy (BOM & MRP)</h2>
              <p style={{ maxWidth: '600px', margin: '0 auto 1.5rem' }}>
                Theo lộ trình Master Plan, module này sẽ triển khai tại <strong>Phase 3 (Tháng 6 - 7)</strong> bao gồm: Định mức BOM nhiều tầng, Routing chuyền công nghệ, Thuật toán MRP và 3 chốt kiểm soát chất lượng (IQC/PQC/FQC).
              </p>
              <button onClick={() => setActiveTab('projects')} className="btn btn-primary">
                Quay Lại Module Quản Lý Dự Án Xây Dựng
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div className="badge badge-emerald" style={{ marginBottom: '0.4rem' }}>Security Architecture</div>
                <h2>Cấu Trúc Ma Trận Phân Quyền & Row-Level Security</h2>
                <p>Mô hình Hybrid 3 lớp bảo vệ dữ liệu xuyên suốt các tầng hệ thống</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cyan)', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <ShieldCheck size={18} /> Lớp 1: Multi-Tenancy Cô Lập
                  </div>
                  <p style={{ fontSize: '0.85rem' }}>
                    Thực thể kế thừa <code>ITenantScoped</code>. EF Core tự động tiêm Global Query Filter <code>WHERE TenantId = @currentTenant</code> vào mọi truy vấn LINQ. Không có rủi ro rò rỉ dữ liệu giữa các công ty con.
                  </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--amber)', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <Lock size={18} /> Lớp 2: Data Scope Phân Quyền Hàng (RLS)
                  </div>
                  <p style={{ fontSize: '0.85rem' }}>
                    Thực thể kế thừa <code>IProjectScopedEntity</code>. LINQ Extension <code>ApplyProjectScope(_currentUserContext)</code> đảm bảo Chỉ huy trưởng chỉ đọc và ghi trên công trình mình được chỉ định.
                  </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald)', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <Layers size={18} /> Lớp 3: Dynamic Workflow Engine
                  </div>
                  <p style={{ fontSize: '0.85rem' }}>
                    Thực thể kế thừa <code>IApprovableEntity</code>. Chuyển giao trạng thái qua State Machine, tự động resolve người duyệt theo vai trò công trình/nhà máy, lưu vết Audit Trail bất biến.
                  </p>
                </div>
              </div>

              <div style={{ background: 'rgba(0,242,254,0.05)', border: '1px dashed var(--cyan)', padding: '1rem 1.4rem', borderRadius: '8px' }}>
                <span style={{ fontWeight: 700, color: 'var(--cyan)' }}>💡 Hướng dẫn kiểm thử RLS trực tiếp trên UI:</span>
                <p style={{ marginTop: '0.3rem', fontSize: '0.85rem' }}>
                  Hãy bấm vào nút <strong>"Chế độ RLS"</strong> ở góc trên bên phải thanh Header. Khi ở chế độ <em>"Chỉ huy trưởng"</em>, danh sách chỉ hiển thị 1 dự án (Landmark Tower). Khi chuyển sang <em>"SuperAdmin"</em>, hệ thống lập tức mở rộng hiển thị toàn bộ 2 dự án!
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

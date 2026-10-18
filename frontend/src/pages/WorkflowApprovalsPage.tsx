import React, { useState } from 'react';
import { WorkflowInstance } from '../types/erp';
import { WorkflowStatusBadge } from '../components/Workflow/WorkflowStatusBadge';
import { ApprovalTimeline } from '../components/Workflow/ApprovalTimeline';
import { GitPullRequest, Check, X, History, Clock } from 'lucide-react';

interface Props {
  pendingWorkflows: WorkflowInstance[];
  onApprove: (instanceId: string, comment?: string) => void;
  onReject: (instanceId: string, reason: string) => void;
  activeTimelineInstanceId: string | null;
  setActiveTimelineInstanceId: (id: string | null) => void;
}

export const WorkflowApprovalsPage: React.FC<Props> = ({
  pendingWorkflows,
  onApprove,
  onReject,
  activeTimelineInstanceId,
  setActiveTimelineInstanceId
}) => {
  const [actionModal, setActionModal] = useState<{
    type: 'approve' | 'reject';
    instanceId: string;
  } | null>(null);

  const [comment, setComment] = useState('');

  const selectedInstance = pendingWorkflows.find((w) => w.id === activeTimelineInstanceId);

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal) return;

    if (actionModal.type === 'approve') {
      onApprove(actionModal.instanceId, comment);
    } else {
      if (!comment) {
        alert('Bắt buộc phải nhập lý do từ chối!');
        return;
      }
      onReject(actionModal.instanceId, comment);
    }

    setActionModal(null);
    setComment('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div className="badge badge-pending" style={{ marginBottom: '0.4rem' }}>
          <Clock size={13} /> Approval Inbox
        </div>
        <h1>Hộp Thư Phê Duyệt (Dynamic Workflow Engine)</h1>
        <p>Danh sách các chứng từ, dự toán BOQ và lệnh đang chờ bạn xem xét và phê chuẩn</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedInstance ? '1fr 420px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Pending Items List */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <GitPullRequest size={20} color="var(--amber)" />
              <h3 style={{ margin: 0 }}>Danh Sách Phiếu Cần Xử Lý ({pendingWorkflows.length})</h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cập nhật theo thời gian thực</span>
          </div>

          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>MODULE</th>
                  <th>TÊN PHIẾU / QUY TRÌNH</th>
                  <th>CẤP DUYỆT HIỆN TẠI</th>
                  <th>TRẠNG THÁI</th>
                  <th>THỜI ĐIỂM GỬI</th>
                  <th style={{ textAlign: 'right' }}>HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody>
                {pendingWorkflows.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      🎉 Tuyệt vời! Hiện tại bạn không có chứng từ hay dự toán nào cần phê duyệt.
                    </td>
                  </tr>
                ) : (
                  pendingWorkflows.map((item) => (
                    <tr
                      key={item.id}
                      style={{
                        background: activeTimelineInstanceId === item.id ? 'rgba(0, 242, 254, 0.08)' : undefined
                      }}
                    >
                      <td style={{ fontWeight: 700, color: 'var(--cyan)' }}>
                        <span className="badge badge-cyan">{item.targetEntityType}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>Dự toán BOQ phần thi công</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          ID: {item.targetEntityId.substring(0, 8)}...
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#fff' }}>
                          Cấp {item.currentStepOrder}: Chỉ huy trưởng / QĐ
                        </span>
                      </td>
                      <td>
                        <WorkflowStatusBadge status={item.currentStatus} />
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => setActiveTimelineInstanceId(item.id)}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                            title="Xem lịch sử audit trail"
                          >
                            <History size={13} />
                          </button>
                          <button
                            onClick={() => setActionModal({ type: 'approve', instanceId: item.id })}
                            className="btn btn-success"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                          >
                            <Check size={13} /> Duyệt
                          </button>
                          <button
                            onClick={() => setActionModal({ type: 'reject', instanceId: item.id })}
                            className="btn btn-danger"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                          >
                            <X size={13} /> Từ Chối
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Timeline Drawer (If active) */}
        {selectedInstance && (
          <div className="card" style={{ position: 'sticky', top: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>Tiến Trình & Audit Trail</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phiên: {selectedInstance.id.substring(0, 8)}...</div>
              </div>
              <button
                onClick={() => setActiveTimelineInstanceId(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                ✕
              </button>
            </div>

            <ApprovalTimeline logs={selectedInstance.logs || []} />
          </div>
        )}
      </div>

      {/* Modal Phê Duyệt / Từ Chối */}
      {actionModal && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '0.5rem', color: actionModal.type === 'approve' ? 'var(--emerald)' : 'var(--rose)' }}>
              {actionModal.type === 'approve' ? 'Xác Nhận Phê Duyệt' : 'Từ Chối Phê Duyệt'}
            </h2>
            <p style={{ marginBottom: '1rem' }}>
              {actionModal.type === 'approve'
                ? 'Chứng từ sẽ được chuyển lên cấp duyệt tiếp theo hoặc hoàn tất chuyển sang Approved.'
                : 'Bắt buộc nhập lý do từ chối để thông báo cho người lập phiếu chỉnh sửa.'}
            </p>

            <form onSubmit={handleConfirmAction}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  {actionModal.type === 'approve' ? 'Ý kiến phê duyệt (Không bắt buộc)' : 'Lý do từ chối (Bắt buộc)'}
                </label>
                <textarea
                  required={actionModal.type === 'reject'}
                  rows={3}
                  placeholder={actionModal.type === 'approve' ? 'Đã kiểm tra khối lượng dự toán, đồng ý...' : 'Vượt định mức vật tư thép theo thiết kế...'}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontFamily: 'var(--font-sans)',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                <button type="button" onClick={() => setActionModal(null)} className="btn btn-secondary">
                  Hủy
                </button>
                <button
                  type="submit"
                  className={actionModal.type === 'approve' ? 'btn btn-success' : 'btn btn-danger'}
                >
                  {actionModal.type === 'approve' ? 'Đồng Ý Phê Duyệt' : 'Xác Nhận Từ Chối'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

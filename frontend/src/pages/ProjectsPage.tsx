import React, { useState } from 'react';
import { Project, ProjectBOQ } from '../types/erp';
import { WorkflowStatusBadge } from '../components/Workflow/WorkflowStatusBadge';
import { Building2, Plus, Send, FileSpreadsheet, MapPin, DollarSign, Calendar, Eye } from 'lucide-react';

interface Props {
  projects: Project[];
  boqs: ProjectBOQ[];
  onCreateBOQ: (projectId: string, boqCode: string, name: string, amount: number) => void;
  onSubmitBOQ: (projectId: string, boqId: string) => void;
  onViewTimeline: (instanceId: string) => void;
  isSuperAdmin: boolean;
}

export const ProjectsPage: React.FC<Props> = ({
  projects,
  boqs,
  onCreateBOQ,
  onSubmitBOQ,
  onViewTimeline,
  isSuperAdmin
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [boqCode, setBoqCode] = useState('');
  const [boqName, setBoqName] = useState('');
  const [amount, setAmount] = useState<number>(15000000000); // 15 Tỷ

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const projectBOQs = boqs.filter((b) => b.projectId === selectedProjectId);

  const handleSubmitNewBOQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boqCode || !boqName || !amount) return;
    onCreateBOQ(selectedProjectId, boqCode, boqName, amount);
    setShowModal(false);
    setBoqCode('');
    setBoqName('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="badge badge-cyan" style={{ marginBottom: '0.4rem' }}>Construction Management</div>
          <h1>Quản Lý Công Trình & Dự Toán (BOQ)</h1>
          <p>
            Minh chứng xác thực <strong>Row-Level Security (RLS)</strong> và cơ chế kế thừa <strong>IApprovableEntity</strong>
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} /> Lập Dự Toán BOQ Mới
        </button>
      </div>

      {/* RLS Status Alert */}
      <div style={{
        background: isSuperAdmin ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
        border: `1px solid ${isSuperAdmin ? 'var(--emerald)' : 'var(--amber)'}`,
        padding: '0.8rem 1.2rem',
        borderRadius: '8px',
        fontSize: '0.85rem'
      }}>
        🛡️ <strong>Trạng thái Row-Level Security:</strong>{' '}
        {isSuperAdmin
          ? 'Đang đăng nhập với quyền SuperAdmin — Hệ thống hiển thị toàn bộ dự án trên toàn quốc.'
          : 'Đang đăng nhập với vai trò Chỉ huy trưởng — EF Core tự động lọc chỉ cho phép xem dự án được phân công.'}
      </div>

      {/* Project Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
        {projects.map((p) => {
          const isSelected = p.id === selectedProjectId;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              style={{
                background: isSelected ? 'rgba(0, 242, 254, 0.15)' : 'var(--bg-card)',
                border: `1px solid ${isSelected ? 'var(--cyan)' : 'var(--border-subtle)'}`,
                color: isSelected ? 'var(--cyan)' : 'var(--text-secondary)',
                borderRadius: '10px',
                padding: '0.8rem 1.2rem',
                cursor: 'pointer',
                textAlign: 'left',
                minWidth: '280px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <Building2 size={16} color={isSelected ? 'var(--cyan)' : '#fff'} />
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>{p.name}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mã: {p.projectCode}</div>
            </button>
          );
        })}
      </div>

      {/* Project Info Card */}
      {currentProject && (
        <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', padding: '1.2rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ĐỊA ĐIỂM THI CÔNG</div>
            <div style={{ fontWeight: 600, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={14} color="var(--cyan)" /> {currentProject.location || 'Chưa cập nhật'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TỔNG HẠN MỨC ĐẦU TƯ</div>
            <div style={{ fontWeight: 700, color: 'var(--emerald)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <DollarSign size={14} /> {(currentProject.totalBudget / 1_000_000_000).toLocaleString('vi-VN')} Tỷ VNĐ
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>THỜI GIAN THI CÔNG</div>
            <div style={{ fontWeight: 600, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} color="var(--purple)" /> {new Date(currentProject.startDate).toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>
      )}

      {/* BOQ Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileSpreadsheet size={20} color="var(--cyan)" />
            <h3 style={{ margin: 0 }}>Danh Sách Bảng Dự Toán BOQ Thuộc Dự Án</h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Tổng số: <strong>{projectBOQs.length}</strong> bảng dự toán
          </span>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>MÃ DỰ TOÁN</th>
                <th>TÊN HẠNG MỤC DỰ TOÁN</th>
                <th>GIÁ TRỊ DỰ TOÁN</th>
                <th>TRẠNG THÁI DUYỆT</th>
                <th>NGÀY TẠO</th>
                <th style={{ textAlign: 'right' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {projectBOQs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Chưa có bảng dự toán BOQ nào cho công trình này. Bấm "Lập Dự Toán BOQ Mới" để tạo.
                  </td>
                </tr>
              ) : (
                projectBOQs.map((boq) => (
                  <tr key={boq.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--cyan)' }}>
                      {boq.boqCode}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{boq.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lần điều chỉnh: Rev {boq.revisionNumber}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                      {(boq.totalEstimatedAmount / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} Tỷ VNĐ
                    </td>
                    <td>
                      <WorkflowStatusBadge status={boq.workflowStatus} />
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(boq.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        {boq.workflowStatus === 'Draft' ? (
                          <button
                            onClick={() => onSubmitBOQ(boq.projectId, boq.id)}
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                            title="Gửi bảng dự toán này vào Workflow Engine để phê duyệt"
                          >
                            <Send size={13} /> Gửi Phê Duyệt
                          </button>
                        ) : boq.currentWorkflowInstanceId ? (
                          <button
                            onClick={() => onViewTimeline(boq.currentWorkflowInstanceId!)}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                            title="Xem lịch sử và tiến trình phê duyệt"
                          >
                            <Eye size={13} /> Tiến Trình
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Đang xử lý</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Lập BOQ mới */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '0.5rem', color: '#fff' }}>Lập Bảng Dự Toán BOQ Mới</h2>
            <p style={{ marginBottom: '1.2rem' }}>Thực thể sẽ tự động kế thừa <code>IApprovableEntity</code> và gắn với dự án hiện tại.</p>

            <form onSubmit={handleSubmitNewBOQ} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Mã Dự Toán (BOQ Code)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: BOQ-ELEC-MEP-01"
                  value={boqCode}
                  onChange={(e) => setBoqCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Tên Hạng Mục Dự Toán
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Dự toán thi công trạm biến áp và hệ thống cơ điện MEP"
                  value={boqName}
                  onChange={(e) => setBoqName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    color: '#fff'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Tổng Giá Trị Dự Toán (VNĐ)
                </label>
                <input
                  type="number"
                  required
                  step="100000000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--cyan)', marginTop: '0.3rem' }}>
                  ≈ {(amount / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} Tỷ VNĐ
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  Tạo Bản Nháp (Draft)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

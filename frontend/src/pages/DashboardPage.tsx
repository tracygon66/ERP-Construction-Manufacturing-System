import React from 'react';
import { Building2, GitPullRequest, DollarSign, ShieldCheck, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { Project, WorkflowInstance } from '../types/erp';

interface Props {
  projects: Project[];
  pendingWorkflows: WorkflowInstance[];
  setActiveTab: (tab: string) => void;
  isSuperAdmin: boolean;
}

export const DashboardPage: React.FC<Props> = ({ projects, pendingWorkflows, setActiveTab, isSuperAdmin }) => {
  const totalBudget = projects.reduce((acc, p) => acc + (p.totalBudget || 0), 0);
  const totalSpent = projects.reduce((acc, p) => acc + (p.totalSpent || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>Executive Dashboard</div>
        <h1>Hệ Thống Quản Trị ERP Xây Dựng & Sản Xuất</h1>
        <p>Bản Skeleton giải pháp kiến trúc Modular Monolith trên nền .NET 8 và React.js</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DỰ ÁN HIỆN DIỆN (RLS)</span>
            <div style={{ background: 'rgba(0, 242, 254, 0.1)', padding: '0.4rem', borderRadius: '8px' }}>
              <Building2 size={18} color="var(--cyan)" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{projects.length} Công Trình</div>
          <div style={{ fontSize: '0.75rem', color: isSuperAdmin ? 'var(--emerald)' : 'var(--amber)', marginTop: '0.4rem' }}>
            ● {isSuperAdmin ? 'Hiển thị toàn bộ công trình (Admin)' : 'Đang lọc RLS theo phân công'}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TỔNG DỰ TOÁN NGÂN SÁCH</span>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.4rem', borderRadius: '8px' }}>
              <DollarSign size={18} color="var(--emerald)" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
            {(totalBudget / 1_000_000_000).toLocaleString('vi-VN')} Tỷ VNĐ
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Đã giải ngân: {(totalSpent / 1_000_000_000).toLocaleString('vi-VN')} Tỷ
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CHỜ PHÊ DUYỆT (WORKFLOW)</span>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.4rem', borderRadius: '8px' }}>
              <GitPullRequest size={18} color="var(--amber)" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--amber)' }}>
            {pendingWorkflows.length} Phiếu
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Bao gồm dự toán BOQ & đề xuất vật tư
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>HẠ TẦNG & KIẾN TRÚC</span>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.4rem', borderRadius: '8px' }}>
              <ShieldCheck size={18} color="var(--purple)" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Clean Arch</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--emerald)', marginTop: '0.4rem' }}>
            ● GQF + Outbox + Audit Trail Sẵn Sàng
          </div>
        </div>
      </div>

      {/* Kiến trúc đã hiện thực hóa */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(13, 23, 42, 0.9), rgba(18, 29, 51, 0.8))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <Zap size={20} color="var(--cyan)" />
          <h2 style={{ fontSize: '1.1rem' }}>Kiến Trúc Lõi Đã Được Cài Đặt Sẵn Trong Skeleton Solution</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, color: 'var(--cyan)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} /> Row-Level Security (RLS)
            </div>
            <p style={{ fontSize: '0.8rem' }}>
              Global Query Filter tự động lọc <code>TenantId</code> và <code>IsDeleted</code>. Dữ liệu công trình được lọc tự nhiên qua LINQ Extension <code>ApplyProjectScope(_currentUserContext)</code>.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, color: 'var(--emerald)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} /> Dynamic Workflow Engine
            </div>
            <p style={{ fontSize: '0.8rem' }}>
              Bộ máy 4 bảng lõi, duyệt theo hạn mức ngân sách BOQ, phân giải người duyệt động theo vai trò dự án (Site Manager / Director), ghi log lịch sử không thể xóa.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, color: 'var(--purple)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} /> Audit Trail & Outbox Pattern
            </div>
            <p style={{ fontSize: '0.8rem' }}>
              <code>AuditTrailInterceptor</code> tự động gán metadata; <code>OutboxInterceptor</code> gom Domain Events lưu nguyên tử trong 1 transaction duy nhất.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('projects')} className="btn btn-primary" style={{ padding: '0.75rem 1.4rem' }}>
          <span>Xem Danh Sách Công Trình & Lập Dự Toán BOQ</span>
          <ArrowRight size={16} />
        </button>

        <button onClick={() => setActiveTab('approvals')} className="btn btn-secondary" style={{ padding: '0.75rem 1.4rem' }}>
          <span>Vào Hộp Thư Phê Duyệt ({pendingWorkflows.length})</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

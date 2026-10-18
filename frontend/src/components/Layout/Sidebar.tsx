import React from 'react';
import { LayoutDashboard, Building2, GitPullRequest, Factory, ShieldCheck, Layers } from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount: number;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab, pendingCount }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng Quan', icon: <LayoutDashboard size={18} /> },
    { id: 'projects', label: 'Công Trình & Dự Án', icon: <Building2 size={18} /> },
    { id: 'approvals', label: 'Hộp Thư Phê Duyệt', icon: <GitPullRequest size={18} />, badge: pendingCount },
    { id: 'manufacturing', label: 'Sản Xuất & Nhà Máy', icon: <Factory size={18} />, tag: 'Phase 3' },
    { id: 'security', label: 'Ma Trận Quyền & RLS', icon: <ShieldCheck size={18} /> },
  ];

  return (
    <aside className="sidebar">
      <div style={{ padding: '1.5rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--teal), var(--cyan))', padding: '0.45rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Layers size={20} color="#070d19" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em', color: '#fff' }}>ERP PLATFORM</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--cyan)', fontWeight: 600 }}>CONSTRUCTION & MFG</div>
        </div>
      </div>

      <nav style={{ padding: '1.2rem 0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.7rem 0.9rem',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span style={{ background: 'var(--amber)', color: '#000', fontSize: '0.7rem', fontWeight: 800, padding: '0.1rem 0.45rem', borderRadius: '9999px' }}>
                  {item.badge}
                </span>
              )}
              {item.tag && (
                <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  {item.tag}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Modular Monolith • .NET 8 + React
      </div>
    </aside>
  );
};

import React from 'react';
import { User, Bell, Shield, ShieldAlert, Building } from 'lucide-react';
import { UserContext } from '../../types/erp';

interface Props {
  userContext: UserContext;
  setUserContext: React.Dispatch<React.SetStateAction<UserContext>>;
}

export const AppHeader: React.FC<Props> = ({ userContext, setUserContext }) => {
  const toggleSuperAdmin = () => {
    setUserContext((prev) => ({
      ...prev,
      isSuperAdmin: !prev.isSuperAdmin
    }));
  };

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <Building size={15} color="var(--cyan)" />
          <span>Tenant: <strong>TẬP ĐOÀN XÂY DỰNG & SX HÒA AN</strong></span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        {/* Nút giả lập chuyển đổi quyền để kiểm thử Row-Level Security (RLS) */}
        <button
          onClick={toggleSuperAdmin}
          className="btn btn-secondary"
          style={{
            padding: '0.35rem 0.75rem',
            fontSize: '0.75rem',
            background: userContext.isSuperAdmin ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            borderColor: userContext.isSuperAdmin ? 'var(--emerald)' : 'var(--amber)',
            color: userContext.isSuperAdmin ? 'var(--emerald)' : 'var(--amber)'
          }}
          title="Bấm để chuyển đổi vai trò kiểm tra tính năng Row-Level Security (RLS)"
        >
          {userContext.isSuperAdmin ? <Shield size={14} /> : <ShieldAlert size={14} />}
          <span>Chế độ RLS: <strong>{userContext.isSuperAdmin ? 'SuperAdmin (Toàn quyền)' : 'Chỉ huy trưởng (Bị lọc RLS)'}</strong></span>
        </button>

        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', position: 'relative' }}>
          <Bell size={18} />
          <span style={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, background: 'var(--cyan)', borderRadius: '50%' }}></span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal), var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#070d19', fontWeight: 800 }}>
            <User size={16} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{userContext.username}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--cyan)' }}>
              {userContext.isSuperAdmin ? 'Ban Tổng Giám Đốc' : 'Chỉ Huy Trưởng Công Trường'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

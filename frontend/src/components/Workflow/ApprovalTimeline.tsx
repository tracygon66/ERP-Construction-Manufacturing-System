import React from 'react';
import { WorkflowInstanceLog } from '../../types/erp';
import { Check, X, Send, User } from 'lucide-react';

interface Props {
  logs: WorkflowInstanceLog[];
}

export const ApprovalTimeline: React.FC<Props> = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return <p style={{ color: 'var(--text-muted)' }}>Chưa có lịch sử phê duyệt.</p>;
  }

  const getActionIcon = (action: number | string) => {
    const actStr = String(action).toLowerCase();
    if (actStr === 'approve' || actStr === '2') {
      return <div style={{ background: 'var(--emerald)', padding: '5px', borderRadius: '50%' }}><Check size={12} color="#fff" /></div>;
    }
    if (actStr === 'reject' || actStr === '3') {
      return <div style={{ background: 'var(--rose)', padding: '5px', borderRadius: '50%' }}><X size={12} color="#fff" /></div>;
    }
    return <div style={{ background: 'var(--cyan)', padding: '5px', borderRadius: '50%' }}><Send size={12} color="#000" /></div>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
      {logs.map((log, idx) => (
        <div key={log.id || idx} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
          {getActionIcon(log.action)}
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>{log.stepName || 'Xử lý'}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {new Date(log.actionAt).toLocaleString('vi-VN')}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <User size={13} />
              <span>Người thực hiện: <strong>{log.actionByUsername}</strong></span>
            </div>
            {log.comment && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--cyan)', background: 'rgba(0,242,254,0.06)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                💬 <em>"{log.comment}"</em>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

import React from 'react';
import { WorkflowStatus } from '../../types/erp';
import { CheckCircle2, Clock, XCircle, FileEdit } from 'lucide-react';

interface Props {
  status: WorkflowStatus;
}

export const WorkflowStatusBadge: React.FC<Props> = ({ status }) => {
  switch (status) {
    case 'Approved':
      return (
        <span className="badge badge-approved">
          <CheckCircle2 size={13} /> Đã phê duyệt
        </span>
      );
    case 'PendingApproval':
      return (
        <span className="badge badge-pending">
          <Clock size={13} /> Chờ phê duyệt
        </span>
      );
    case 'Rejected':
      return (
        <span className="badge badge-rejected">
          <XCircle size={13} /> Đã từ chối
        </span>
      );
    case 'Draft':
    default:
      return (
        <span className="badge badge-draft">
          <FileEdit size={13} /> Bản nháp (Draft)
        </span>
      );
  }
};

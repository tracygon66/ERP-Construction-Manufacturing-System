export type WorkflowStatus = 'Draft' | 'PendingApproval' | 'Approved' | 'Rejected' | 'Cancelled';

export interface Project {
  id: string;
  tenantId: string;
  projectCode: string;
  name: string;
  location?: string;
  startDate: string;
  expectedEndDate?: string;
  totalBudget: number;
  totalSpent: number;
  status: string;
}

export interface ProjectBOQ {
  id: string;
  tenantId: string;
  projectId: string;
  boqCode: string;
  name: string;
  revisionNumber: number;
  totalEstimatedAmount: number;
  workflowStatus: WorkflowStatus;
  currentWorkflowInstanceId?: string;
  createdAt: string;
}

export interface WorkflowInstanceLog {
  id: string;
  stepOrder: number;
  stepName: string;
  actionByUsername: string;
  action: number | string;
  comment?: string;
  actionAt: string;
}

export interface WorkflowInstance {
  id: string;
  tenantId: string;
  workflowDefinitionId: string;
  targetEntityType: string;
  targetEntityId: string;
  currentStatus: WorkflowStatus;
  currentStepOrder: number;
  logs: WorkflowInstanceLog[];
  createdAt: string;
  completedAt?: string;
}

export interface UserContext {
  userId: string;
  username: string;
  tenantId: string;
  isSuperAdmin: boolean;
  allowedProjectIds: string[];
}

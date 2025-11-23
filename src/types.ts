
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'Admin' | 'Member' | 'Viewer';
  inviteStatus: 'pending' | 'expired' | 'approved' | 'rejected';
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

export enum IssueType {
  TASK = 'Task',
  BUG = 'Bug',
  STORY = 'Story',
  EPIC = 'Epic',
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string; // Base64 or mock URL
  size: string;
  type: string;
}

export interface TimeLog {
    id: string;
    issueId: string;
    userId: string;
    startTime: string;
    endTime?: string; // If null, timer is running
    durationSeconds: number;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  type: IssueType;
  priority: Priority;
  statusId: string; // Column ID
  assigneeIds: string[];
  reporterId: string;
  projectId: string;
  sprintId?: string;
  storyPoints?: number;
  releaseId?: string; // Linked to Release
  order: number; 
  createdAt: string;
  updatedAt: string;
  startDate?: string;
  dueDate?: string;
  comments: Comment[];
  attachments: Attachment[];
  timeSpent: number; // Total seconds
}

export interface Column {
  id: string;
  title: string;
  order: number;
  limit?: number;
}

export interface Board {
  id: string;
  projectId: string;
  title: string;
  columns: Column[];
}

export interface Project {
  id: string;
  key: string; 
  name: string;
  description: string;
  leadId: string;
  icon: string;
  // Extended Settings
  category: string;
  visibility: 'Private' | 'Public' | 'Internal';
  enabledIssueTypes: IssueType[];
  notificationSettings: {
      issueCreated: boolean;
      issueAssigned: boolean;
      comments: boolean;
      sprintUpdates: boolean;
  };
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  goal: string;
  isActive: boolean;
  isCompleted: boolean;
}

export interface Release {
    id: string;
    projectId: string;
    name: string;
    startDate: string;
    releaseDate: string;
    description: string;
    isReleased: boolean;
    status: 'UNRELEASED' | 'RELEASED' | 'ARCHIVED';
}

export interface AutomationRule {
    id: string;
    name: string;
    description: string;
    trigger: string; // e.g., 'ISSUE_CREATED', 'STATUS_CHANGED'
    condition: string; // e.g., 'PRIORITY_IS_HIGH'
    action: string; // e.g., 'ASSIGN_TO_LEAD'
    isActive: boolean;
    lastRun?: string;
    executionCount: number;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isRead: boolean;
    createdAt: string;
}

// --- Code Module Types ---
export interface Repository {
    id: string;
    projectId: string;
    name: string;
    url: string;
    provider: 'github' | 'gitlab' | 'bitbucket';
    lastUpdated: string;
}

export interface Branch {
    id: string;
    repositoryId: string;
    name: string;
    lastCommit: string; // sha
    author: string;
    updatedAt: string;
    ahead: number;
    behind: number;
}

export interface Commit {
    id: string; // sha
    repositoryId: string;
    message: string;
    author: string;
    timestamp: string;
    branch: string;
    status: 'success' | 'failed' | 'running' | 'pending';
}

export interface PullRequest {
    id: string;
    repositoryId: string;
    title: string;
    sourceBranch: string;
    targetBranch: string;
    author: string;
    status: 'OPEN' | 'MERGED' | 'DECLINED';
    createdAt: string;
    reviewers: string[];
}

// --- Integration Types ---
export interface Integration {
    id: string;
    name: string;
    description: string;
    icon: string; // URL or icon name
    provider: 'github' | 'slack' | 'gitlab' | 'jenkins' | 'figma' | 'sentry';
    isConnected: boolean;
    config?: Record<string, string>;
    connectedAt?: string;
    lastSynced?: string;
    syncStatus?: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';
}

// --- Marketplace Types ---
export interface Plugin {
    id: string;
    name: string;
    description: string;
    fullDescription: string;
    author: string;
    icon: string; // emoji or url
    category: 'Productivity' | 'Development' | 'Design' | 'Communication' | 'Reporting';
    isInstalled: boolean;
    rating: number;
    downloads: string;
    version: string;
}

// --- Admin & Org Types ---
export interface AuditLog {
    id: string;
    userId: string;
    action: string;
    details: string;
    timestamp: string;
    ipAddress: string;
}

export interface OrgSettings {
    name: string;
    logoUrl: string;
    primaryColor: string;
    plan: 'Free' | 'Pro' | 'Enterprise';
    featureFlags: {
        betaFeatures: boolean;
        legacyView: boolean;
        ssoLogin: boolean;
        apiAccess: boolean;
    };
    paymentMethod?: {
        brand: string;
        last4: string;
        expiry: string;
    };
}

// App State
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  projects: Project[];
  currentProjectId: string | null;
  boards: Record<string, Board>; 
  issues: Record<string, Issue>; 
  users: Record<string, User>;
  sprints: Record<string, Sprint>;
  releases: Record<string, Release>;
  automations: Record<string, AutomationRule>;
  timeLogs: Record<string, TimeLog>;
  notifications: Notification[];
  // Code Module State
  repositories: Record<string, Repository>;
  branches: Record<string, Branch>;
  commits: Record<string, Commit>;
  pullRequests: Record<string, PullRequest>;
  // Integrations
  integrations: Record<string, Integration>;
  // Marketplace
  plugins: Record<string, Plugin>;
  // Admin & Org
  orgSettings: OrgSettings;
  auditLogs: AuditLog[];
  isDarkMode: boolean;
}

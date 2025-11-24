
import { AppState, User, Project, Board, Issue, IssueType, Priority, Notification, Repository, Branch, Commit, PullRequest, Integration, AuditLog, OrgSettings, AutomationRule, Plugin } from './types';

export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

export const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};

const STORAGE_KEY = 'avenstek_jira_demo__acme__v1';

// Mock Initial Data
const MOCK_USERS: Record<string, User> = {
  'u1': { id: 'u1', name: 'Alex Johnson', email: 'alex@acme.com', avatarUrl: 'https://picsum.photos/seed/u1/200', role: 'Admin', inviteStatus: 'approved' },
  'u2': { id: 'u2', name: 'Sarah Connor', email: 'sarah@acme.com', avatarUrl: 'https://picsum.photos/seed/u2/200', role: 'Member', inviteStatus: 'approved' },
  'u3': { id: 'u3', name: 'Mike Ross', email: 'mike@acme.com', avatarUrl: 'https://picsum.photos/seed/u3/200', role: 'Viewer', inviteStatus: 'approved' },
  'u4': { id: 'u4', name: 'Emily Chen', email: 'emily.chen@acme.com', avatarUrl: 'https://picsum.photos/seed/u4/200', role: 'Member', inviteStatus: 'approved' },
  'u5': { id: 'u5', name: 'David Rodriguez', email: 'david.rodriguez@acme.com', avatarUrl: 'https://picsum.photos/seed/u5/200', role: 'Member', inviteStatus: 'approved' },
  'u6': { id: 'u6', name: 'Jessica Williams', email: 'jessica.williams@acme.com', avatarUrl: 'https://picsum.photos/seed/u6/200', role: 'Admin', inviteStatus: 'approved' },
  'u7': { id: 'u7', name: 'Marcus Thompson', email: 'marcus.thompson@acme.com', avatarUrl: 'https://picsum.photos/seed/u7/200', role: 'Member', inviteStatus: 'approved' },
  'u8': { id: 'u8', name: 'Sophia Garcia', email: 'sophia.garcia@acme.com', avatarUrl: 'https://picsum.photos/seed/u8/200', role: 'Member', inviteStatus: 'approved' },
  'u9': { id: 'u9', name: 'Brian Kim', email: 'brian.kim@acme.com', avatarUrl: 'https://picsum.photos/seed/u9/200', role: 'Viewer', inviteStatus: 'approved' },
  'u10': { id: 'u10', name: 'Amanda Wilson', email: 'amanda.wilson@acme.com', avatarUrl: 'https://picsum.photos/seed/u10/200', role: 'Member', inviteStatus: 'approved' },
  'u11': { id: 'u11', name: 'Kevin Patel', email: 'kevin.patel@acme.com', avatarUrl: 'https://picsum.photos/seed/u11/200', role: 'Member', inviteStatus: 'approved' },
  'u12': { id: 'u12', name: 'Olivia Martinez', email: 'olivia.martinez@acme.com', avatarUrl: 'https://picsum.photos/seed/u12/200', role: 'Viewer', inviteStatus: 'approved' },
  'u13': { id: 'u13', name: 'Daniel Brown', email: 'daniel.brown@acme.com', avatarUrl: 'https://picsum.photos/seed/u13/200', role: 'Member', inviteStatus: 'approved' },
  'u14': { id: 'u14', name: 'Lisa Anderson', email: 'lisa.anderson@acme.com', avatarUrl: 'https://picsum.photos/seed/u14/200', role: 'Admin', inviteStatus: 'approved' },
  'u15': { id: 'u15', name: 'Robert Taylor', email: 'robert.taylor@acme.com', avatarUrl: 'https://picsum.photos/seed/u15/200', role: 'Member', inviteStatus: 'pending' },
};

const MOCK_PROJECTS: Project[] = [
  { 
    id: 'p1', 
    key: 'KAN', 
    name: 'Kanban Project', 
    description: 'Main engineering board', 
    leadId: 'u1', 
    icon: '🚀',
    category: 'Software Development',
    visibility: 'Private',
    enabledIssueTypes: [IssueType.TASK, IssueType.BUG, IssueType.STORY, IssueType.EPIC],
    notificationSettings: { issueCreated: true, issueAssigned: true, comments: true, sprintUpdates: false }
  },
  { 
    id: 'p2', 
    key: 'MKT', 
    name: 'Marketing Launch', 
    description: 'Q4 Campaigns', 
    leadId: 'u2', 
    icon: '📢',
    category: 'Marketing',
    visibility: 'Public',
    enabledIssueTypes: [IssueType.TASK, IssueType.STORY],
    notificationSettings: { issueCreated: true, issueAssigned: true, comments: false, sprintUpdates: true }
  },
];

const MOCK_BOARDS: Record<string, Board> = {
  'b1': {
    id: 'b1',
    projectId: 'p1',
    title: 'Engineering Board',
    columns: [
      { id: 'c1', title: 'To Do', order: 0 },
      { id: 'c2', title: 'In Progress', order: 1, limit: 3 },
      { id: 'c3', title: 'Code Review', order: 2 },
      { id: 'c4', title: 'Done', order: 3 },
    ]
  }
};

const MOCK_ISSUES: Record<string, Issue> = {
  'i1': {
    id: 'i1', title: 'Setup Project Infrastructure', description: 'Initialize React app with Tailwind.',
    type: IssueType.STORY, priority: Priority.HIGH, statusId: 'c4',
    assigneeIds: ['u1'], reporterId: 'u1', projectId: 'p1', order: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), comments: [],
    attachments: [], timeSpent: 3600
  },
  'i2': {
    id: 'i2', title: 'Implement Authentication', description: 'Create login and register pages.',
    type: IssueType.TASK, priority: Priority.URGENT, statusId: 'c2',
    assigneeIds: ['u2'], reporterId: 'u1', projectId: 'p1', order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), comments: [],
    attachments: [], timeSpent: 7200
  },
  'i3': {
    id: 'i3', title: 'Design System Integration', description: 'Setup Urbanist font and color palette.',
    type: IssueType.TASK, priority: Priority.MEDIUM, statusId: 'c1',
    assigneeIds: ['u3'], reporterId: 'u2', projectId: 'p1', order: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), comments: [],
    attachments: [], timeSpent: 0
  },
  'i4': {
    id: 'i4', title: 'Fix Drag and Drop Glitch', description: 'Cards get stuck when dragging quickly.',
    type: IssueType.BUG, priority: Priority.HIGH, statusId: 'c1',
    assigneeIds: ['u1'], reporterId: 'u2', projectId: 'p1', order: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), comments: [],
    attachments: [], timeSpent: 0
  },
  'e1': {
    id: 'e1', title: 'Q1 Platform Launch', description: 'Main release for the first quarter.',
    type: IssueType.EPIC, priority: Priority.HIGH, statusId: 'c1',
    assigneeIds: ['u1'], reporterId: 'u1', projectId: 'p1', order: 4, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), comments: [],
    attachments: [], timeSpent: 0,
    startDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }
};

const MOCK_NOTIFICATIONS: Notification[] = [
    { id: 'n1', title: 'Welcome', message: 'Welcome to your new project workspace.', type: 'info', isRead: false, createdAt: new Date().toISOString() },
    { id: 'n2', title: 'Sprint Started', message: 'Sprint 4 has been started successfully.', type: 'success', isRead: true, createdAt: new Date(Date.now() - 10000000).toISOString() },
];

const MOCK_REPOSITORIES: Record<string, Repository> = {
    'r1': { id: 'r1', projectId: 'p1', name: 'jira-clone-frontend', url: 'https://github.com/acme/jira-clone-frontend', provider: 'github', lastUpdated: new Date().toISOString() },
    'r2': { id: 'r2', projectId: 'p1', name: 'jira-clone-api', url: 'https://github.com/acme/jira-clone-api', provider: 'github', lastUpdated: new Date(Date.now() - 86400000).toISOString() }
};

const MOCK_BRANCHES: Record<string, Branch> = {
    'br1': { id: 'br1', repositoryId: 'r1', name: 'main', lastCommit: 'a1b2c3d', author: 'Alex Johnson', updatedAt: new Date().toISOString(), ahead: 0, behind: 0 },
    'br2': { id: 'br2', repositoryId: 'r1', name: 'develop', lastCommit: 'e5f6g7h', author: 'Sarah Connor', updatedAt: new Date(Date.now() - 3600000).toISOString(), ahead: 5, behind: 2 },
    'br3': { id: 'br3', repositoryId: 'r1', name: 'feature/KAN-2-auth', lastCommit: 'i9j0k1l', author: 'Mike Ross', updatedAt: new Date(Date.now() - 7200000).toISOString(), ahead: 12, behind: 0 },
};

const MOCK_COMMITS: Record<string, Commit> = {
    'c1': { id: 'a1b2c3d', repositoryId: 'r1', message: 'Initial commit structure', author: 'Alex Johnson', timestamp: new Date().toISOString(), branch: 'main', status: 'success' },
    'c2': { id: 'e5f6g7h', repositoryId: 'r1', message: 'KAN-1: Setup base layout and router', author: 'Sarah Connor', timestamp: new Date(Date.now() - 3600000).toISOString(), branch: 'develop', status: 'success' },
    'c3': { id: 'i9j0k1l', repositoryId: 'r1', message: 'KAN-2: Implemented login form validation', author: 'Mike Ross', timestamp: new Date(Date.now() - 7200000).toISOString(), branch: 'feature/KAN-2-auth', status: 'failed' },
    'c4': { id: 'm2n3o4p', repositoryId: 'r1', message: 'KAN-2: Fix tests for auth', author: 'Mike Ross', timestamp: new Date(Date.now() - 10000).toISOString(), branch: 'feature/KAN-2-auth', status: 'running' },
};

const MOCK_PULL_REQUESTS: Record<string, PullRequest> = {
    'pr1': { id: 'pr1', repositoryId: 'r1', title: 'KAN-2: Authentication Implementation', sourceBranch: 'feature/KAN-2-auth', targetBranch: 'develop', author: 'Mike Ross', status: 'OPEN', createdAt: new Date(Date.now() - 86400000).toISOString(), reviewers: ['u1'] },
    'pr2': { id: 'pr2', repositoryId: 'r1', title: 'KAN-1: Project Structure', sourceBranch: 'feature/KAN-1-init', targetBranch: 'main', author: 'Alex Johnson', status: 'MERGED', createdAt: new Date(Date.now() - 172800000).toISOString(), reviewers: ['u2'] },
};

const MOCK_INTEGRATIONS: Record<string, Integration> = {
    'int1': { id: 'int1', name: 'GitHub', description: 'Link pull requests and commits to issues.', icon: 'github', provider: 'github', isConnected: true, connectedAt: new Date().toISOString(), config: { org: 'acme' } },
    'int2': { id: 'int2', name: 'Slack', description: 'Get notifications and create issues from Slack.', icon: 'slack', provider: 'slack', isConnected: false },
    'int3': { id: 'int3', name: 'GitLab', description: 'Sync GitLab merge requests and pipelines.', icon: 'gitlab', provider: 'gitlab', isConnected: false },
    'int4': { id: 'int4', name: 'Jenkins', description: 'View build statuses on issue cards.', icon: 'jenkins', provider: 'jenkins', isConnected: false },
    'int5': { id: 'int5', name: 'Figma', description: 'Embed designs directly in issues.', icon: 'figma', provider: 'figma', isConnected: true, connectedAt: new Date(Date.now() - 100000000).toISOString(), config: { team: 'design-team' } },
    'int6': { id: 'int6', name: 'Sentry', description: 'Link Sentry errors to issues for tracking.', icon: 'sentry', provider: 'sentry', isConnected: false },
};

const MOCK_PLUGINS: Record<string, Plugin> = {
    'pl1': { id: 'pl1', name: 'Slack Connector', description: 'Real-time notifications in Slack channels.', fullDescription: 'Connect your project to Slack to receive instant updates when issues are created, updated, or commented on. Also supports creating issues directly from Slack messages.', author: 'Acme Inc', icon: 'slack', category: 'Communication', isInstalled: true, rating: 4.8, downloads: '12k', version: '2.1.0' },
    'pl2': { id: 'pl2', name: 'GitHub for JiraClone', description: 'View branches, commits and PRs.', fullDescription: 'The official GitHub integration. See the development status of your issues at a glance. Link commits, branches, and pull requests to your tasks.', author: 'GitHub', icon: 'github', category: 'Development', isInstalled: true, rating: 4.9, downloads: '45k', version: '1.5.3' },
    'pl3': { id: 'pl3', name: 'Figma Embed', description: 'Embed live designs in issue descriptions.', fullDescription: 'Bring your designs into your planning process. Paste Figma links into issue descriptions to see live previews of your frames and prototypes.', author: 'Figma', icon: 'figma', category: 'Design', isInstalled: false, rating: 4.7, downloads: '8k', version: '1.0.2' },
    'pl4': { id: 'pl4', name: 'Daily Standup', description: 'Automated daily standup reports.', fullDescription: 'Automate your daily scrum. Team members receive a prompt to answer 3 questions: What did you do yesterday? What will you do today? Any blockers?', author: 'ScrumTools', icon: '📅', category: 'Productivity', isInstalled: false, rating: 4.5, downloads: '3k', version: '3.0.1' },
    'pl5': { id: 'pl5', name: 'Time Sheets Pro', description: 'Advanced time tracking and reporting.', fullDescription: 'Take your time tracking to the next level with detailed timesheets, approval workflows, and billable hours reporting.', author: 'Tempo', icon: '⏱️', category: 'Reporting', isInstalled: false, rating: 4.6, downloads: '15k', version: '2.2.0' },
    'pl6': { id: 'pl6', name: 'Planning Poker', description: 'Estimating story points made fun.', fullDescription: 'Run planning poker sessions directly within your backlog view. Team members vote on story points in real-time.', author: 'AgileCorp', icon: '🃏', category: 'Productivity', isInstalled: false, rating: 4.2, downloads: '5k', version: '1.1.5' },
    'pl7': { id: 'pl7', name: 'Sentry Integration', description: 'Link crash reports to bugs.', fullDescription: 'Automatically create bug reports from Sentry exceptions. Sync status updates between Sentry and JiraClone.', author: 'Sentry', icon: 'sentry', category: 'Development', isInstalled: false, rating: 4.8, downloads: '9k', version: '1.4.0' },
    'pl8': { id: 'pl8', name: 'Zendesk Support', description: 'Link support tickets to issues.', fullDescription: 'View Zendesk tickets linked to your development tasks. Keep support agents in the loop with comments and status updates.', author: 'Zendesk', icon: '🎧', category: 'Communication', isInstalled: false, rating: 4.4, downloads: '7k', version: '2.0.1' },
};

const MOCK_AUDIT_LOGS: AuditLog[] = [
    { id: 'log1', userId: 'u1', action: 'LOGIN', details: 'User logged in successfully', timestamp: new Date().toISOString(), ipAddress: '192.168.1.1' },
    { id: 'log2', userId: 'u2', action: 'ISSUE_CREATED', details: 'Created issue KAN-3', timestamp: new Date(Date.now() - 3600000).toISOString(), ipAddress: '192.168.1.42' },
    { id: 'log3', userId: 'u1', action: 'PROJECT_SETTINGS_UPDATE', details: 'Updated project name to "Kanban Project"', timestamp: new Date(Date.now() - 86400000).toISOString(), ipAddress: '192.168.1.1' },
];

const INITIAL_ORG_SETTINGS: OrgSettings = {
    name: 'Acme Corp',
    logoUrl: 'https://picsum.photos/seed/acmelogo/200',
    primaryColor: '#4f46e5',
    plan: 'Pro',
    featureFlags: {
        betaFeatures: true,
        legacyView: false,
        ssoLogin: false,
        apiAccess: true
    },
    paymentMethod: {
        brand: 'VISA',
        last4: '4242',
        expiry: '12/25'
    }
};

const MOCK_AUTOMATION_RULES: Record<string, AutomationRule> = {
    'a1': { id: 'a1', name: 'Auto-Assign High Priority', description: 'Automatically assign urgent tasks to Project Lead', trigger: 'ISSUE_CREATED', condition: 'PRIORITY_URGENT', action: 'ASSIGN_TO_LEAD', isActive: true, executionCount: 142, lastRun: new Date(Date.now() - 3600000).toISOString() },
    'a2': { id: 'a2', name: 'Close Old Issues', description: 'Close issues in "Done" after 30 days', trigger: 'SCHEDULED_WEEKLY', condition: 'STATUS_DONE', action: 'ARCHIVE_ISSUE', isActive: false, executionCount: 0 },
    'a3': { id: 'a3', name: 'Welcome New Members', description: 'Send onboarding email when user added', trigger: 'USER_ADDED', condition: 'ALWAYS', action: 'SEND_EMAIL', isActive: true, executionCount: 5, lastRun: new Date(Date.now() - 86400000 * 2).toISOString() },
};

export const getInitialState = (): AppState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  return {
    user: null,
    isAuthenticated: false,
    projects: MOCK_PROJECTS,
    currentProjectId: 'p1',
    boards: MOCK_BOARDS,
    issues: MOCK_ISSUES,
    users: MOCK_USERS,
    sprints: {},
    releases: {},
    automations: MOCK_AUTOMATION_RULES,
    timeLogs: {},
    notifications: MOCK_NOTIFICATIONS,
    repositories: MOCK_REPOSITORIES,
    branches: MOCK_BRANCHES,
    commits: MOCK_COMMITS,
    pullRequests: MOCK_PULL_REQUESTS,
    integrations: MOCK_INTEGRATIONS,
    plugins: MOCK_PLUGINS,
    orgSettings: INITIAL_ORG_SETTINGS,
    auditLogs: MOCK_AUDIT_LOGS,
    isDarkMode: false,
  };
};

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

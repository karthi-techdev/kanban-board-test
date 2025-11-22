
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState, Issue, User, Priority, IssueType, Sprint, Project, Release, AutomationRule, TimeLog, Notification, Repository, Branch, PullRequest, OrgSettings, AuditLog } from './types';
import { getInitialState, saveState, generateId } from './utils';

const initialState: AppState = getInitialState();

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      saveState(state);
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      saveState(state);
    },
    updateCurrentUser: (state, action: PayloadAction<Partial<User>>) => {
        if (state.user) {
            const updatedUser = { ...state.user, ...action.payload };
            state.user = updatedUser;
            // Sync with users map
            if (state.users[updatedUser.id]) {
                state.users[updatedUser.id] = { ...state.users[updatedUser.id], ...action.payload };
            }
            saveState(state);
        }
    },
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      if (state.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      saveState(state);
    },
    setCurrentProject: (state, action: PayloadAction<string>) => {
      state.currentProjectId = action.payload;
      saveState(state);
    },
    updateProject: (state, action: PayloadAction<Partial<Project>>) => {
        const idx = state.projects.findIndex(p => p.id === state.currentProjectId);
        if (idx !== -1) {
            state.projects[idx] = { ...state.projects[idx], ...action.payload };
            saveState(state);
        }
    },
    deleteProject: (state, action: PayloadAction<string>) => {
        state.projects = state.projects.filter(p => p.id !== action.payload);
        if (state.currentProjectId === action.payload) {
            state.currentProjectId = state.projects[0]?.id || null;
        }
        saveState(state);
    },
    // Team Actions
    inviteUser: (state, action: PayloadAction<string>) => {
      const email = action.payload;
      const exists = (Object.values(state.users) as User[]).find(u => u.email === email);
      if (!exists) {
          const newId = generateId('u');
          state.users[newId] = {
              id: newId,
              name: email.split('@')[0],
              email: email,
              avatarUrl: `https://picsum.photos/seed/${newId}/200`,
              role: 'Member',
              inviteStatus: 'pending'
          };
          saveState(state);
      }
    },
    deleteUser: (state, action: PayloadAction<string>) => {
        const userId = action.payload;
        if (state.users[userId]) {
            delete state.users[userId];
            
            // Cleanup issue assignments
            Object.values(state.issues).forEach((issue: Issue) => {
                issue.assigneeIds = issue.assigneeIds.filter(id => id !== userId);
            });

            // Reset project lead if needed
            state.projects.forEach(p => {
                if (p.leadId === userId) p.leadId = 'u1'; // Fallback to default/admin
            });

            saveState(state);
        }
    },
    updateUserRole: (state, action: PayloadAction<{ userId: string; role: 'Admin' | 'Member' | 'Viewer' }>) => {
        const user = state.users[action.payload.userId];
        if (user) {
            user.role = action.payload.role;
            saveState(state);
        }
    },
    // Issue Actions
    updateIssue: (state, action: PayloadAction<Partial<Issue> & { id: string }>) => {
        const { id, ...changes } = action.payload;
        const issue = state.issues[id];
        if (issue) {
            // @ts-ignore - Dynamic assignment
            Object.keys(changes).forEach(key => {
                 // @ts-ignore
                issue[key] = changes[key];
            });
            issue.updatedAt = new Date().toISOString();
            saveState(state);
        }
    },
    updateIssueStatus: (state, action: PayloadAction<{ issueId: string; newStatusId: string }>) => {
      const issue = state.issues[action.payload.issueId];
      if (issue) {
        issue.statusId = action.payload.newStatusId;
        issue.updatedAt = new Date().toISOString();
        saveState(state);
      }
    },
    updateIssueSprint: (state, action: PayloadAction<{ issueId: string; sprintId: string | undefined }>) => {
        const issue = state.issues[action.payload.issueId];
        if (issue) {
            issue.sprintId = action.payload.sprintId;
            issue.updatedAt = new Date().toISOString();
            saveState(state);
        }
    },
    reorderIssue: (state, action: PayloadAction<{ 
      issueId: string; 
      newStatusId?: string; 
      newSprintId?: string | undefined; 
      targetIssueId?: string | null; 
      isSprintUpdate?: boolean; 
    }>) => {
        const { issueId, newStatusId, newSprintId, targetIssueId, isSprintUpdate } = action.payload;
        const issue = state.issues[issueId];
        const allIssues = Object.values(state.issues) as Issue[];
        
        if (!issue) return;

        if (isSprintUpdate) {
            issue.sprintId = newSprintId;
        } else if (newStatusId) {
            issue.statusId = newStatusId;
        }
        issue.updatedAt = new Date().toISOString();

        let siblings: Issue[] = [];
        if (isSprintUpdate) {
            siblings = allIssues.filter(i => i.id !== issueId && i.projectId === issue.projectId && i.sprintId === issue.sprintId);
        } else {
            siblings = allIssues.filter(i => i.id !== issueId && i.projectId === issue.projectId && i.statusId === issue.statusId);
        }

        siblings.sort((a, b) => a.order - b.order);
        
        if (targetIssueId) {
            const targetIndex = siblings.findIndex(i => i.id === targetIssueId);
            if (targetIndex !== -1) siblings.splice(targetIndex, 0, issue);
            else siblings.push(issue);
        } else if (targetIssueId === null) {
             siblings.push(issue);
        } else {
            siblings.push(issue);
        }

        siblings.forEach((item, index) => {
            if (state.issues[item.id]) {
                state.issues[item.id].order = index;
            }
        });

        saveState(state);
    },
    createIssue: (state, action: PayloadAction<{ title: string; description: string; type: IssueType; priority: Priority; statusId: string; assigneeIds: string[]; sprintId?: string; startDate?: string; dueDate?: string }>) => {
      const newId = generateId('ISSUE');
      const projectId = state.currentProjectId || 'p1';
      
      const siblings = (Object.values(state.issues) as Issue[]).filter(i => i.projectId === projectId && i.statusId === action.payload.statusId);
      const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(i => i.order)) : 0;

      const newIssue: Issue = {
        id: newId,
        ...action.payload,
        projectId,
        reporterId: state.user?.id || 'u1',
        order: maxOrder + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
        attachments: [],
        timeSpent: 0
      };
      
      state.issues[newId] = newIssue;
      saveState(state);
    },
    deleteIssue: (state, action: PayloadAction<string>) => {
      delete state.issues[action.payload];
      saveState(state);
    },
    addComment: (state, action: PayloadAction<{ issueId: string; content: string }>) => {
        const { issueId, content } = action.payload;
        const issue = state.issues[issueId];
        if (issue && state.user) {
            issue.comments.push({
                id: generateId('cmt'),
                userId: state.user.id,
                content,
                createdAt: new Date().toISOString()
            });
            saveState(state);
        }
    },
    // Board Actions
    updateColumn: (state, action: PayloadAction<{ boardId: string; columnId: string; title: string; limit?: number }>) => {
        const board = state.boards[action.payload.boardId];
        if (board) {
            const col = board.columns.find(c => c.id === action.payload.columnId);
            if (col) {
                col.title = action.payload.title;
                col.limit = action.payload.limit;
                saveState(state);
            }
        }
    },
    // Sprint Actions
    createSprint: (state) => {
        const newId = generateId('SPRINT');
        const projectId = state.currentProjectId || 'p1';
        const count = (Object.values(state.sprints) as Sprint[]).filter(s => s.projectId === projectId).length + 1;
        
        const newSprint: Sprint = {
            id: newId,
            projectId,
            name: `Sprint ${count}`,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            goal: '',
            isActive: false,
            isCompleted: false
        };
        
        state.sprints[newId] = newSprint;
        saveState(state);
    },
    editSprint: (state, action: PayloadAction<{ sprintId: string; name: string; startDate: string; endDate: string; goal: string }>) => {
        const sprint = state.sprints[action.payload.sprintId];
        if (sprint) {
            sprint.name = action.payload.name;
            sprint.startDate = action.payload.startDate;
            sprint.endDate = action.payload.endDate;
            sprint.goal = action.payload.goal;
            saveState(state);
        }
    },
    deleteSprint: (state, action: PayloadAction<string>) => {
        const sprintId = action.payload;
        // Move issues to backlog
        Object.values(state.issues).forEach((issue: Issue) => {
            if (issue.sprintId === sprintId) {
                issue.sprintId = undefined;
            }
        });
        delete state.sprints[sprintId];
        saveState(state);
    },
    startSprint: (state, action: PayloadAction<{ sprintId: string; goal: string }>) => {
        const sprint = state.sprints[action.payload.sprintId];
        if (sprint) {
            sprint.isActive = true;
            sprint.goal = action.payload.goal;
            saveState(state);
        }
    },
    completeSprint: (state, action: PayloadAction<string>) => {
        const sprint = state.sprints[action.payload];
        if (sprint) {
            sprint.isActive = false;
            sprint.isCompleted = true;
            
            // Move incomplete issues to backlog
            Object.values(state.issues).forEach((issue: Issue) => {
                if (issue.sprintId === sprint.id && issue.statusId !== 'c4') { 
                    issue.sprintId = undefined;
                }
            });

            saveState(state);
        }
    },
    // Release Actions
    createRelease: (state, action: PayloadAction<{ name: string; date: string }>) => {
        const newId = generateId('REL');
        const projectId = state.currentProjectId || 'p1';
        state.releases[newId] = {
            id: newId,
            projectId,
            name: action.payload.name,
            startDate: new Date().toISOString(),
            releaseDate: action.payload.date,
            description: 'New version release',
            isReleased: false,
            status: 'UNRELEASED'
        };
        saveState(state);
    },
    editRelease: (state, action: PayloadAction<{ id: string; name: string; date: string; description: string; status: 'UNRELEASED' | 'RELEASED' | 'ARCHIVED' }>) => {
        const rel = state.releases[action.payload.id];
        if (rel) {
            rel.name = action.payload.name;
            rel.releaseDate = action.payload.date;
            rel.description = action.payload.description;
            rel.status = action.payload.status;
            rel.isReleased = action.payload.status === 'RELEASED';
            saveState(state);
        }
    },
    deleteRelease: (state, action: PayloadAction<string>) => {
        const releaseId = action.payload;
        // Unlink issues
        Object.values(state.issues).forEach((issue: Issue) => {
            if (issue.releaseId === releaseId) {
                issue.releaseId = undefined;
            }
        });
        delete state.releases[releaseId];
        saveState(state);
    },
    toggleReleaseStatus: (state, action: PayloadAction<string>) => {
        const rel = state.releases[action.payload];
        if(rel) {
            rel.isReleased = !rel.isReleased;
            rel.status = rel.isReleased ? 'RELEASED' : 'UNRELEASED';
            saveState(state);
        }
    },
    // Automation Actions
    createAutomation: (state, action: PayloadAction<{ name: string; description: string; trigger: string; condition: string; action: string }>) => {
        const newId = generateId('AUTO');
        state.automations[newId] = {
            id: newId,
            name: action.payload.name,
            description: action.payload.description,
            trigger: action.payload.trigger,
            condition: action.payload.condition,
            action: action.payload.action,
            isActive: true,
            executionCount: 0
        };
        saveState(state);
    },
    deleteAutomation: (state, action: PayloadAction<string>) => {
        delete state.automations[action.payload];
        saveState(state);
    },
    triggerAutomation: (state, action: PayloadAction<string>) => {
        const rule = state.automations[action.payload];
        if (rule && rule.isActive) {
            rule.lastRun = new Date().toISOString();
            rule.executionCount = (rule.executionCount || 0) + 1;
            const notifId = generateId('NOTIF');
            if (!state.notifications) state.notifications = [];
            state.notifications.unshift({
                id: notifId,
                title: 'Automation Executed',
                message: `Rule "${rule.name}" executed successfully.`,
                type: 'success',
                isRead: false,
                createdAt: new Date().toISOString()
            });
            saveState(state);
        }
    },
    toggleAutomation: (state, action: PayloadAction<string>) => {
        const rule = state.automations[action.payload];
        if(rule) {
            rule.isActive = !rule.isActive;
            saveState(state);
        }
    },
    // Time Tracking
    startTimeLog: (state, action: PayloadAction<{ issueId: string }>) => {
        if (!state.user) return;
        (Object.values(state.timeLogs) as TimeLog[]).forEach(log => {
             if (!log.endTime && log.userId === state.user?.id) {
                 log.endTime = new Date().toISOString();
                 log.durationSeconds = Math.floor((new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 1000);
                 const issue = state.issues[log.issueId];
                 if (issue) issue.timeSpent = (issue.timeSpent || 0) + log.durationSeconds;
             }
        });
        const newId = generateId('LOG');
        state.timeLogs[newId] = {
            id: newId,
            issueId: action.payload.issueId,
            userId: state.user.id,
            startTime: new Date().toISOString(),
            durationSeconds: 0
        };
        saveState(state);
    },
    stopTimeLog: (state, action: PayloadAction<{ logId: string }>) => {
        const log = state.timeLogs[action.payload.logId];
        if(log && !log.endTime) {
            log.endTime = new Date().toISOString();
            const duration = (new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 1000;
            log.durationSeconds = Math.floor(duration);
            const issue = state.issues[log.issueId];
            if(issue) {
                issue.timeSpent = (issue.timeSpent || 0) + log.durationSeconds;
            }
            saveState(state);
        }
    },
    logManualTime: (state, action: PayloadAction<{ issueId: string; seconds: number; date: string }>) => {
        if (!state.user) return;
        const newId = generateId('LOG');
        state.timeLogs[newId] = {
            id: newId,
            issueId: action.payload.issueId,
            userId: state.user.id,
            startTime: new Date(action.payload.date).toISOString(),
            endTime: new Date(action.payload.date).toISOString(),
            durationSeconds: action.payload.seconds
        };
        const issue = state.issues[action.payload.issueId];
        if (issue) {
            issue.timeSpent = (issue.timeSpent || 0) + action.payload.seconds;
        }
        saveState(state);
    },
    deleteTimeLog: (state, action: PayloadAction<string>) => {
        const logId = action.payload;
        const log = state.timeLogs[logId];
        if (log) {
             const issue = state.issues[log.issueId];
             if (issue) {
                 const durationToRemove = log.durationSeconds || 0;
                 const currentSpent = issue.timeSpent || 0;
                 issue.timeSpent = Math.max(0, currentSpent - durationToRemove);
             }
             delete state.timeLogs[logId];
             saveState(state);
        }
    },
    editTimeLog: (state, action: PayloadAction<{ logId: string; seconds: number; date: string }>) => {
        const log = state.timeLogs[action.payload.logId];
        if (log) {
            const oldDuration = log.durationSeconds || 0;
            const newDuration = action.payload.seconds;
            const diff = newDuration - oldDuration;

            log.durationSeconds = newDuration;
            log.startTime = new Date(action.payload.date).toISOString();
            log.endTime = new Date(action.payload.date).toISOString(); 

            const issue = state.issues[log.issueId];
            if (issue) {
                issue.timeSpent = Math.max(0, (issue.timeSpent || 0) + diff);
            }
            saveState(state);
        }
    },
    // Code Module Actions
    addRepository: (state, action: PayloadAction<{ name: string; url: string; provider: 'github'|'gitlab'|'bitbucket' }>) => {
        const newId = generateId('REPO');
        const projectId = state.currentProjectId || 'p1';
        state.repositories[newId] = {
            id: newId,
            projectId,
            ...action.payload,
            lastUpdated: new Date().toISOString()
        };
        saveState(state);
    },
    deleteRepository: (state, action: PayloadAction<string>) => {
        const repoId = action.payload;
        delete state.repositories[repoId];
        Object.keys(state.branches).forEach(id => {
            if (state.branches[id].repositoryId === repoId) delete state.branches[id];
        });
        Object.keys(state.commits).forEach(id => {
            if (state.commits[id].repositoryId === repoId) delete state.commits[id];
        });
        Object.keys(state.pullRequests).forEach(id => {
            if (state.pullRequests[id].repositoryId === repoId) delete state.pullRequests[id];
        });
        saveState(state);
    },
    createBranch: (state, action: PayloadAction<{ repoId: string; name: string; source: string }>) => {
        const newId = generateId('BRANCH');
        state.branches[newId] = {
            id: newId,
            repositoryId: action.payload.repoId,
            name: action.payload.name,
            lastCommit: generateId('SHA'),
            author: state.user?.name || 'Unknown',
            updatedAt: new Date().toISOString(),
            ahead: 0,
            behind: 0
        };
        saveState(state);
    },
    deleteBranch: (state, action: PayloadAction<string>) => {
        delete state.branches[action.payload];
        saveState(state);
    },
    createPullRequest: (state, action: PayloadAction<{ repoId: string; title: string; source: string; target: string }>) => {
        const newId = generateId('PR');
        state.pullRequests[newId] = {
            id: newId,
            repositoryId: action.payload.repoId,
            title: action.payload.title,
            sourceBranch: action.payload.source,
            targetBranch: action.payload.target,
            author: state.user?.name || 'Unknown',
            status: 'OPEN',
            createdAt: new Date().toISOString(),
            reviewers: []
        };
        saveState(state);
    },
    mergePullRequest: (state, action: PayloadAction<string>) => {
        const pr = state.pullRequests[action.payload];
        if (pr) {
            pr.status = 'MERGED';
            saveState(state);
        }
    },
    updatePullRequestStatus: (state, action: PayloadAction<{ id: string; status: 'OPEN' | 'MERGED' | 'DECLINED' }>) => {
        const pr = state.pullRequests[action.payload.id];
        if (pr) {
            pr.status = action.payload.status;
            saveState(state);
        }
    },
    // Integration Actions
    connectIntegration: (state, action: PayloadAction<{ id: string; config?: any }>) => {
        const integration = state.integrations[action.payload.id];
        if (integration) {
            integration.isConnected = true;
            integration.connectedAt = new Date().toISOString();
            integration.syncStatus = 'IDLE'; // Initial status
            if (action.payload.config) {
                integration.config = { ...integration.config, ...action.payload.config };
            }
            saveState(state);
        }
    },
    disconnectIntegration: (state, action: PayloadAction<string>) => {
        const integration = state.integrations[action.payload];
        if (integration) {
            integration.isConnected = false;
            integration.connectedAt = undefined;
            integration.config = undefined;
            integration.lastSynced = undefined;
            integration.syncStatus = undefined;
            saveState(state);
        }
    },
    configureIntegration: (state, action: PayloadAction<{ id: string; config: any }>) => {
        const integration = state.integrations[action.payload.id];
        if (integration) {
            integration.config = { ...integration.config, ...action.payload.config };
            saveState(state);
        }
    },
    syncIntegration: (state, action: PayloadAction<string>) => {
        const integration = state.integrations[action.payload];
        if (integration && integration.isConnected) {
            integration.lastSynced = new Date().toISOString();
            integration.syncStatus = 'SUCCESS';
            saveState(state);
        }
    },
    // Marketplace Actions
    installPlugin: (state, action: PayloadAction<string>) => {
        const plugin = state.plugins[action.payload];
        if(plugin) {
            plugin.isInstalled = true;
            saveState(state);
        }
    },
    uninstallPlugin: (state, action: PayloadAction<string>) => {
        const plugin = state.plugins[action.payload];
        if(plugin) {
            plugin.isInstalled = false;
            saveState(state);
        }
    },
    // Admin Actions
    updateOrgSettings: (state, action: PayloadAction<Partial<OrgSettings>>) => {
        state.orgSettings = { ...state.orgSettings, ...action.payload };
        saveState(state);
    },
    restoreBackup: (state, action: PayloadAction<AppState>) => {
        return action.payload; 
    },
    addAuditLog: (state, action: PayloadAction<{ action: string; details: string; userId: string }>) => {
        if (!state.auditLogs) state.auditLogs = [];
        state.auditLogs.unshift({
            id: generateId('LOG'),
            userId: action.payload.userId,
            action: action.payload.action,
            details: action.payload.details,
            timestamp: new Date().toISOString(),
            ipAddress: '127.0.0.1' // Mock IP
        });
        saveState(state);
    },
    // Notifications
    addNotification: (state, action: PayloadAction<{ title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }>) => {
        const newId = generateId('NOTIF');
        if (!state.notifications) state.notifications = [];
        state.notifications.unshift({
            id: newId,
            ...action.payload,
            isRead: false,
            createdAt: new Date().toISOString()
        });
        saveState(state);
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
        const notif = state.notifications.find(n => n.id === action.payload);
        if(notif) {
            notif.isRead = true;
            saveState(state);
        }
    },
    markAllNotificationsAsRead: (state) => {
        state.notifications.forEach(n => n.isRead = true);
        saveState(state);
    },
    clearNotifications: (state) => {
        state.notifications = [];
        saveState(state);
    }
  },
});

export const { 
    login, logout, updateCurrentUser, toggleTheme, setCurrentProject, updateProject, deleteProject,
    inviteUser, deleteUser, updateUserRole,
    updateIssueStatus, updateIssueSprint, reorderIssue, createIssue, deleteIssue, addComment, updateColumn, updateIssue,
    createSprint, editSprint, deleteSprint, startSprint, completeSprint,
    createRelease, editRelease, deleteRelease, toggleReleaseStatus,
    createAutomation, deleteAutomation, triggerAutomation, toggleAutomation,
    startTimeLog, stopTimeLog, logManualTime, deleteTimeLog, editTimeLog,
    addRepository, deleteRepository, createBranch, deleteBranch, createPullRequest, mergePullRequest, updatePullRequestStatus,
    connectIntegration, disconnectIntegration, configureIntegration, syncIntegration,
    installPlugin, uninstallPlugin,
    updateOrgSettings, restoreBackup, addAuditLog,
    addNotification, markNotificationAsRead, markAllNotificationsAsRead, clearNotifications
} = appSlice.actions;

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

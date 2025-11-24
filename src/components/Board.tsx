import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, reorderIssue, createIssue, addComment, addNotification, completeSprint, updateColumn, updateIssue, createBoard, deleteBoard, createColumn, deleteColumn } from '../store';
import { Issue, Priority, IssueType, User, AppState, Board, Sprint, Column } from '../types';
import { Plus, MoreHorizontal, X, MessageSquare, Calendar, CheckSquare, Users, Search, Rocket } from './Icons';
import { formatDate } from '../utils';
import Tippy from '@tippyjs/react';

// --- Local Icons ---
const ChevronDown = ({ size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);
const Trash = ({ size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);
const Check = ({ size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>
);

// --- Helper Components ---

export const Avatar: React.FC<{ user: User | undefined, size?: number, className?: string }> = ({ user, size = 8, className = '' }) => {
    if (!user) return <div className={`w-${size} h-${size} rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 border-2 border-white dark:border-slate-800 ${className}`}>?</div>;
    return (
        <img 
            src={user.avatarUrl} 
            alt={user.name} 
            className={`w-${size} h-${size} rounded-full border-2 border-white dark:border-slate-800 object-cover shadow-sm ${className}`} 
            title={user.name}
        />
    );
};

export const PriorityBadge = ({ priority }: { priority: Priority }) => {
    const colors = {
        [Priority.LOW]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        [Priority.MEDIUM]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        [Priority.HIGH]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
        [Priority.URGENT]: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    };
    return (
        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${colors[priority]}`}>
            {priority}
        </span>
    );
};

export const IssueTypeIcon = ({ type }: { type: IssueType }) => {
    switch (type) {
        case IssueType.BUG: return <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center text-[10px] text-white shadow-sm">🐞</div>;
        case IssueType.STORY: return <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center text-[10px] text-white shadow-sm">📖</div>;
        case IssueType.EPIC: return <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center text-[10px] text-white shadow-sm">⚡</div>;
        default: return <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center text-[10px] text-white shadow-sm">✓</div>;
    }
};

// --- Modal for Issue Details ---

export const IssueModal = ({ issue, onClose }: { issue: Issue; onClose: () => void }) => {
    const dispatch = useDispatch();
    const users = useSelector((state: RootState) => (state.app as AppState).users);
    const boards = useSelector((state: RootState) => (state.app as AppState).boards);
    const [comment, setComment] = useState('');

    // Find current board and status name
    const board = (Object.values(boards) as Board[]).find(b => b.projectId === issue.projectId && b.columns.some(c => c.id === issue.statusId));
    const column = board?.columns.find(c => c.id === issue.statusId);

    const handleSendComment = () => {
        if(!comment.trim()) return;
        dispatch(addComment({ issueId: issue.id, content: comment }));
        setComment('');
    };

    const handleAssigneeChange = (userId: string) => {
        dispatch(updateIssue({
            id: issue.id,
            assigneeIds: userId ? [userId] : []
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex overflow-hidden border border-slate-200 dark:border-slate-700">
                
                {/* Header & Content */}
                <div className="flex-1 flex flex-col overflow-y-auto relative">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur z-10">
                        <div className="flex items-center gap-3">
                            <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-mono font-medium">{issue.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>
                    </div>

                    <div className="p-8 max-w-3xl">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">{issue.title}</h1>
                        
                        <div className="mb-10">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Description</h3>
                            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 min-h-[100px]">
                                <p>{issue.description || "No description provided."}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Activity & Comments</h3>
                            
                            <div className="space-y-6 mb-8">
                                {issue.comments.map(c => (
                                    <div key={c.id} className="flex gap-4">
                                        <Avatar user={users[c.userId]} size={10} />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-sm text-slate-900 dark:text-white">{users[c.userId]?.name}</span>
                                                <span className="text-xs text-slate-500">{formatDate(c.createdAt)}</span>
                                            </div>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{c.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-sm shrink-0">
                                    You
                                </div>
                                <div className="flex-1">
                                    <textarea 
                                        className="w-full bg-white border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:text-white transition-shadow shadow-sm"
                                        rows={3}
                                        placeholder="Add a comment..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                    <div className="mt-3 flex justify-end">
                                        <button 
                                            onClick={handleSendComment}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-transform active:scale-95 shadow-md shadow-indigo-500/20">
                                            Post Comment
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-80 bg-slate-50 dark:bg-slate-900/50 border-l border-slate-200 dark:border-slate-700 p-6 overflow-y-auto hidden lg:block">
                    <div className="space-y-8">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Status</label>
                            <select 
                                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={issue.statusId}
                                onChange={(e) => dispatch(reorderIssue({ issueId: issue.id, newStatusId: e.target.value, isSprintUpdate: false }))}
                            >
                                {board?.columns.map(col => (
                                    <option key={col.id} value={col.id}>{col.title}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Priority</label>
                            <div className="flex items-center">
                                <PriorityBadge priority={issue.priority} />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Assignee</label>
                            <div className="flex items-center gap-2 mb-2">
                                {issue.assigneeIds.length > 0 ? (
                                    issue.assigneeIds.map(uid => <Avatar key={uid} user={users[uid]} size={8} />)
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                        <Users size={14} />
                                    </div>
                                )}
                            </div>
                            <select 
                                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={issue.assigneeIds[0] || ''}
                                onChange={(e) => handleAssigneeChange(e.target.value)}
                            >
                                <option value="">Unassigned</option>
                                {Object.values(users).map((u: User) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Reporter</span>
                                <span className="font-medium dark:text-slate-300">{users[issue.reporterId]?.name || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Created</span>
                                <span className="font-medium dark:text-slate-300">{formatDate(issue.createdAt)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Updated</span>
                                <span className="font-medium dark:text-slate-300">{formatDate(issue.updatedAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Edit Column Modal ---
const EditColumnModal = ({ column, boardId, onClose }: { column: Column; boardId: string; onClose: () => void }) => {
    const dispatch = useDispatch();
    const [title, setTitle] = useState(column.title);
    const [limit, setLimit] = useState(column.limit || 0);

    const handleSave = () => {
        dispatch(updateColumn({
            boardId,
            columnId: column.id,
            title,
            limit: limit > 0 ? limit : undefined
        }));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold mb-4 dark:text-white">Edit Column</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Column Name</label>
                        <input 
                            className="w-full bg-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Max Issue Limit (WIP)</label>
                        <input 
                            type="number"
                            className="w-full bg-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            value={limit}
                            onChange={(e) => setLimit(parseInt(e.target.value) || 0)}
                            min="0"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Set to 0 for no limit.</p>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-bold">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md">Save</button>
                </div>
            </div>
        </div>
    );
};

// --- Create Board Modal ---
const CreateBoardModal = ({ onClose, projectId }: { onClose: () => void; projectId: string }) => {
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');

    const handleCreate = () => {
        if (!title.trim()) return;
        dispatch(createBoard({ title, projectId }));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold mb-4 dark:text-white">Create New Board</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Board Title</label>
                        <input 
                            autoFocus
                            className="w-full bg-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            placeholder="e.g. Kanban Board"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-bold">Cancel</button>
                    <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md">Create</button>
                </div>
            </div>
        </div>
    );
};

// --- Create Column Modal ---
const CreateColumnModal = ({ onClose, boardId }: { onClose: () => void; boardId: string }) => {
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');

    const handleCreate = () => {
        if (!title.trim()) return;
        dispatch(createColumn({ boardId, title }));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold mb-4 dark:text-white">Add New Column</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Column Title</label>
                        <input 
                            autoFocus
                            className="w-full bg-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            placeholder="e.g. QA Review"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-bold">Cancel</button>
                    <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md">Add Column</button>
                </div>
            </div>
        </div>
    );
};

// --- Drag & Drop Board ---

export const BoardView = () => {
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app as AppState);
    const { currentProjectId, boards, issues, users, sprints } = appState;
    
    // Board Selection Logic
    const projectBoards = (Object.values(boards) as Board[]).filter(b => b.projectId === currentProjectId);
    const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

    // Initial load selection
    useEffect(() => {
        if (!activeBoardId && projectBoards.length > 0) {
            setActiveBoardId(projectBoards[0].id);
        } else if (activeBoardId && !boards[activeBoardId]) {
            // Handle deletion case
            setActiveBoardId(projectBoards.length > 0 ? projectBoards[0].id : null);
        }
    }, [projectBoards, activeBoardId, boards]);

    const activeBoard = activeBoardId ? boards[activeBoardId] : null;
    const activeSprint = (Object.values(sprints) as Sprint[]).find(s => s.projectId === currentProjectId && s.isActive);
    
    const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCompleteSprintModalOpen, setIsCompleteSprintModalOpen] = useState(false);
    const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);
    const [isCreateColumnModalOpen, setIsCreateColumnModalOpen] = useState(false);
    
    const [newIssueTitle, setNewIssueTitle] = useState('');
    const [newIssueType, setNewIssueType] = useState<IssueType>(IssueType.TASK);
    const [newIssuePriority, setNewIssuePriority] = useState<Priority>(Priority.MEDIUM);
    const [newIssueAssignee, setNewIssueAssignee] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Member Filter State - Changed to Multi Select
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    
    // Board Menu State
    const [isBoardMenuOpen, setIsBoardMenuOpen] = useState(false);

    // Column Menu State
    const [activeColMenu, setActiveColMenu] = useState<string | null>(null);
    const [editingColumn, setEditingColumn] = useState<Column | null>(null);
    
    // DND State
    const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
    const [dragOverCard, setDragOverCard] = useState<string | null>(null);

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = () => {
            setActiveColMenu(null);
            setIsBoardMenuOpen(false);
            setIsUserMenuOpen(false);
        };
        // Simple handler attached to document
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const projectIssues = (Object.values(issues) as Issue[]).filter(i => {
        const matchProject = i.projectId === currentProjectId;
        const matchSearch = i.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchSprint = activeSprint ? i.sprintId === activeSprint.id : true;
        // Check if any of the assignees are in the selected list (if filter active)
        const matchMember = selectedMemberIds.length > 0 ? i.assigneeIds.some(id => selectedMemberIds.includes(id)) : true;
        return matchProject && matchSearch && matchSprint && matchMember;
    }).sort((a, b) => a.order - b.order);

    const handleDragStart = (e: React.DragEvent, issueId: string) => {
        setDraggedIssueId(issueId);
        e.dataTransfer.setData('text/plain', issueId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnterColumn = (e: React.DragEvent, colId: string) => {
        e.preventDefault();
        setDragOverColumn(colId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDragEnterCard = (e: React.DragEvent, issueId: string) => {
        e.preventDefault();
        if (issueId !== draggedIssueId) {
            setDragOverCard(issueId);
        }
    };

    const handleDropOnCard = (e: React.DragEvent, targetIssue: Issue) => {
        e.preventDefault();
        e.stopPropagation(); 
        const issueId = e.dataTransfer.getData('text/plain');
        
        if (issueId && issueId !== targetIssue.id) {
            dispatch(reorderIssue({ 
                issueId, 
                newStatusId: targetIssue.statusId, 
                targetIssueId: targetIssue.id, 
                isSprintUpdate: false 
            }));
        }
        resetDragState();
    };

    const handleDropOnColumn = (e: React.DragEvent, statusId: string) => {
        e.preventDefault();
        const issueId = e.dataTransfer.getData('text/plain');
        if (issueId) {
            dispatch(reorderIssue({ 
                issueId, 
                newStatusId: statusId, 
                targetIssueId: null, 
                isSprintUpdate: false
            }));
        }
        resetDragState();
    };

    const resetDragState = () => {
        setDraggedIssueId(null);
        setDragOverColumn(null);
        setDragOverCard(null);
    };

    const handleCreateIssue = () => {
        if (!newIssueTitle.trim()) return;
        const firstColId = activeBoard ? activeBoard.columns[0].id : 'c1';
        dispatch(createIssue({
            title: newIssueTitle,
            description: '',
            type: newIssueType,
            priority: newIssuePriority,
            statusId: firstColId,
            assigneeIds: newIssueAssignee ? [newIssueAssignee] : [],
            sprintId: activeSprint?.id // Assign to active sprint if exists
        }));
        dispatch(addNotification({
            title: 'Issue Created',
            message: `Issue "${newIssueTitle}" has been created successfully.`,
            type: 'success'
        }));
        setNewIssueTitle('');
        setNewIssueType(IssueType.TASK);
        setNewIssuePriority(Priority.MEDIUM);
        setNewIssueAssignee('');
        setIsCreateModalOpen(false);
    };

    const handleCompleteSprint = () => {
        if (activeSprint) {
            dispatch(completeSprint(activeSprint.id));
            dispatch(addNotification({
                title: 'Sprint Completed',
                message: `${activeSprint.name} has been completed successfully.`,
                type: 'success'
            }));
            setIsCompleteSprintModalOpen(false);
        }
    };
    
    const handleDeleteColumn = (colId: string) => {
        if (activeBoard && window.confirm("Are you sure? Issues in this column will be moved to the first column.")) {
            dispatch(deleteColumn({ boardId: activeBoard.id, columnId: colId }));
        }
    }

    const toggleMemberFilter = (userId: string) => {
        setSelectedMemberIds(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId) 
                : [...prev, userId]
        );
    };

    if (!projectBoards.length && !isCreateBoardModalOpen) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                <p>No boards found for this project.</p>
                <button 
                    onClick={() => setIsCreateBoardModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700"
                >
                    Create Board
                </button>
                {isCreateBoardModalOpen && <CreateBoardModal projectId={currentProjectId || ''} onClose={() => setIsCreateBoardModalOpen(false)} />}
            </div>
        );
    }
    
    // Ensure we render something if we have boards but state isn't synced yet
    if (!activeBoard) return <div className="p-8">Loading board...</div>;

    const allUsers = Object.values(users) as User[];
    const visibleUsers = allUsers.slice(0, 5);
    const hiddenUsers = allUsers.slice(5);

    return (
        <div className="h-full flex flex-col overflow-hidden bg-slate-50/50 dark:bg-black">
            {/* Toolbar */}
            <div className="px-8 py-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                        {/* Board Switcher */}
                        <button 
                            onClick={() => setIsBoardMenuOpen(!isBoardMenuOpen)}
                            className="flex items-center gap-2 text-2xl font-bold text-slate-800 dark:text-white hover:text-indigo-600 transition-colors"
                        >
                            {activeBoard.title}
                            <ChevronDown size={20} className="text-slate-400" />
                        </button>
                        
                        {isBoardMenuOpen && (
                             <div className="absolute left-0 top-10 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                                <div className="p-2 border-b border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Switch Board
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {projectBoards.map(b => (
                                        <button 
                                            key={b.id}
                                            onClick={() => { setActiveBoardId(b.id); setIsBoardMenuOpen(false); }}
                                            className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors flex items-center justify-between
                                                ${b.id === activeBoardId 
                                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300' 
                                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}
                                            `}
                                        >
                                            {b.title}
                                            {b.id === activeBoardId && <div className="w-2 h-2 rounded-full bg-indigo-500"></div>}
                                        </button>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => { setIsCreateBoardModalOpen(true); setIsBoardMenuOpen(false); }}
                                    className="w-full text-left px-4 py-3 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 font-bold transition-colors border-t border-slate-100 dark:border-slate-700 flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Create Board
                                </button>
                            </div>
                        )}

                        {activeSprint ? (
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wide">
                                    {activeSprint.name}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {formatDate(activeSprint.startDate)} - {formatDate(activeSprint.endDate)}
                                </span>
                            </div>
                        ) : (
                            <div className="text-xs text-slate-400 mt-1 italic">Kanban Mode (No active sprint)</div>
                        )}
                    </div>
                    
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                    
                    {/* Member Filter List */}
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-1.5 transition-all duration-200 relative">
                            {visibleUsers.map(u => {
                                const isSelected = selectedMemberIds.includes(u.id);
                                const isDimmed = selectedMemberIds.length > 0 && !isSelected;
                                return (
                                    <Tippy key={u.id} content={u.name} arrow={true} placement="top">
                                        <div 
                                            onClick={() => toggleMemberFilter(u.id)}
                                            className={`cursor-pointer transition-all duration-200 relative
                                                ${isSelected 
                                                    ? 'z-20 scale-110' 
                                                    : isDimmed
                                                        ? 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:z-10' 
                                                        : 'hover:z-10 hover:scale-105'}
                                            `}
                                        >
                                            <Avatar 
                                                user={u} 
                                                size={8} 
                                                className={isSelected ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900' : ''} 
                                            />
                                        </div>
                                    </Tippy>
                                );
                            })}
                            
                            {hiddenUsers.length > 0 && (
                                <div className="relative">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsUserMenuOpen(!isUserMenuOpen); }}
                                        className={`w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors z-30 relative shadow-sm
                                         ${hiddenUsers.some(u => selectedMemberIds.includes(u.id)) ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900 bg-indigo-50 text-indigo-600' : ''}
                                        `}
                                    >
                                        +{hiddenUsers.length}
                                    </button>

                                    {isUserMenuOpen && (
                                        <div 
                                            onClick={(e) => e.stopPropagation()} 
                                            className="absolute right-0 top-10 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden py-1"
                                        >
                                            {hiddenUsers.map(u => {
                                                const isSelected = selectedMemberIds.includes(u.id);
                                                return (
                                                    <button
                                                        key={u.id}
                                                        onClick={() => toggleMemberFilter(u.id)}
                                                        className={`w-full text-left px-3 py-2 text-sm flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors
                                                            ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}
                                                        `}
                                                    >
                                                        <Avatar user={u} size={6} />
                                                        <span className="truncate font-medium flex-1">{u.name}</span>
                                                        {isSelected && <Check size={14} className="text-indigo-500" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {selectedMemberIds.length > 0 && (
                            <button 
                                onClick={() => setSelectedMemberIds([])}
                                className="ml-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline animate-in fade-in"
                            >
                                Clear
                            </button>
                        )}
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                            title="Create Issue"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search issues..." 
                            className="pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 w-64 transition-all" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    {activeSprint && (
                        <button 
                            onClick={() => setIsCompleteSprintModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-lg shadow-indigo-500/20 transition-transform active:scale-95"
                        >
                            Complete Sprint
                        </button>
                    )}
                </div>
            </div>

            {/* Columns */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-8">
                <div className="flex h-full gap-6 min-w-max">
                    {activeBoard.columns.map(column => {
                        const columnIssues = projectIssues.filter(i => i.statusId === column.id);
                        const isOver = dragOverColumn === column.id;
                        const isLimitExceeded = column.limit && columnIssues.length > column.limit;
                        
                        return (
                            <div 
                                key={column.id}
                                onDragOver={handleDragOver}
                                onDragEnter={(e) => handleDragEnterColumn(e, column.id)}
                                onDrop={(e) => handleDropOnColumn(e, column.id)}
                                className={`
                                    w-80 flex flex-col h-full rounded-2xl transition-colors duration-200 border
                                    ${isOver 
                                        ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500/20' 
                                        : 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800'}
                                    ${isLimitExceeded ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900' : ''}
                                `}
                            >
                                {/* Column Header */}
                                <div className="p-4 flex items-center justify-between relative group/header">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`font-bold text-xs uppercase tracking-wider ${isLimitExceeded ? 'text-red-500' : 'text-slate-500'}`}>
                                            {column.title}
                                        </h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold
                                            ${isLimitExceeded 
                                                ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' 
                                                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}
                                        `}>
                                            {columnIssues.length}{column.limit ? `/${column.limit}` : ''}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setActiveColMenu(activeColMenu === column.id ? null : column.id); }}
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
                                        >
                                            <MoreHorizontal size={16} />
                                        </button>
                                        
                                        {/* Dropdown */}
                                        {activeColMenu === column.id && (
                                            <div className="absolute right-0 top-8 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                                                <button 
                                                    onClick={() => { setEditingColumn(column); setActiveColMenu(null); }}
                                                    className="w-full text-left px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors"
                                                >
                                                    Edit Column
                                                </button>
                                                <button 
                                                    onClick={() => { handleDeleteColumn(column.id); setActiveColMenu(null); }}
                                                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors border-t border-slate-50 dark:border-slate-700 flex items-center gap-2"
                                                >
                                                    <Trash size={14} />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Issues List */}
                                <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3 custom-scrollbar min-h-[100px]">
                                    {columnIssues.map(issue => (
                                        <div
                                            key={issue.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, issue.id)}
                                            onDragEnter={(e) => handleDragEnterCard(e, issue.id)}
                                            onDrop={(e) => handleDropOnCard(e, issue)}
                                            onClick={() => setSelectedIssueId(issue.id)}
                                            className={`
                                                group bg-white dark:bg-slate-800 p-4 rounded-xl border transition-all duration-200 cursor-pointer relative
                                                ${draggedIssueId === issue.id 
                                                    ? 'opacity-40 scale-95 shadow-none border-dashed border-slate-300' 
                                                    : 'shadow-sm hover:shadow-md border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'}
                                                ${dragOverCard === issue.id && draggedIssueId !== issue.id
                                                    ? 'border-t-4 border-t-indigo-500 mt-4' // Visual indicator for drop target
                                                    : ''}
                                            `}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-slate-800 dark:text-slate-100 font-medium text-sm leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {issue.title}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 mb-4">
                                                <IssueTypeIcon type={issue.type} />
                                                <span className="text-[10px] text-slate-400 font-mono font-medium">{issue.id}</span>
                                                <PriorityBadge priority={issue.priority} />
                                            </div>

                                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50 dark:border-slate-700/50">
                                                <div className="flex items-center gap-2">
                                                    {issue.assigneeIds.length > 0 ? (
                                                        <div className="flex -space-x-2">
                                                            {issue.assigneeIds.map(uid => <Avatar key={uid} user={users[uid]} size={6} />)}
                                                        </div>
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center group-hover:border-indigo-300 transition-colors">
                                                            <Users size={12} className="text-slate-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                {issue.comments.length > 0 && (
                                                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-indigo-500 transition-colors">
                                                    <MessageSquare size={14} />
                                                    <span className="text-xs font-medium">{issue.comments.length}</span>
                                                  </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <button 
                                        onClick={() => { setIsCreateModalOpen(true); }}
                                        className="w-full py-3 flex items-center justify-center gap-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl border border-transparent hover:border-indigo-100 dark:hover:border-slate-700 text-sm font-medium transition-all"
                                    >
                                        <Plus size={16} />
                                        Create issue
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                     {/* Add Column Button */}
                    <div className="w-80 h-full flex flex-col pt-10 px-2 opacity-60 hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => setIsCreateColumnModalOpen(true)}
                            className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 font-bold transition-all gap-2"
                        >
                            <Plus size={20} />
                            Add Column
                        </button>
                    </div>

                </div>
            </div>

            {/* Issue Detail Modal */}
            {selectedIssueId && issues[selectedIssueId] && (
                <IssueModal issue={issues[selectedIssueId]} onClose={() => setSelectedIssueId(null)} />
            )}

            {/* Create Issue Modal */}
            {isCreateModalOpen && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-8 transform transition-all scale-100">
                        <h2 className="text-2xl font-bold mb-6 dark:text-white">Create Issue</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Summary</label>
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full bg-white border border-slate-300 dark:border-slate-600 rounded-xl p-4 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                                    placeholder="What needs to be done?"
                                    value={newIssueTitle}
                                    onChange={(e) => setNewIssueTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateIssue()}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                                    <select 
                                        className="w-full bg-white border border-slate-300 dark:border-slate-600 rounded-xl p-3 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newIssueType}
                                        onChange={(e) => setNewIssueType(e.target.value as IssueType)}
                                    >
                                        {Object.values(IssueType).map((t) => <option key={t as string} value={t as string}>{t as string}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority</label>
                                    <select 
                                        className="w-full bg-white border border-slate-300 dark:border-slate-600 rounded-xl p-3 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newIssuePriority}
                                        onChange={(e) => setNewIssuePriority(e.target.value as Priority)}
                                    >
                                        {Object.values(Priority).map((p) => <option key={p as string} value={p as string}>{p as string}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assignee</label>
                                <select 
                                    className="w-full bg-white border border-slate-300 dark:border-slate-600 rounded-xl p-3 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newIssueAssignee}
                                    onChange={(e) => setNewIssueAssignee(e.target.value)}
                                >
                                    <option value="">Unassigned</option>
                                    {Object.values(users).map((u: User) => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors">Cancel</button>
                            <button onClick={handleCreateIssue} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-500/20 transition-transform active:scale-95">Create Issue</button>
                        </div>
                    </div>
                 </div>
            )}

            {/* Complete Sprint Modal */}
            {isCompleteSprintModalOpen && activeSprint && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-8 transform transition-all scale-100 border border-slate-100 dark:border-slate-700">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4 mx-auto text-indigo-600 dark:text-indigo-300">
                            <Rocket size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-center mb-2 dark:text-white">Complete Sprint</h2>
                        <p className="text-center text-slate-500 mb-6 font-medium">{activeSprint.name}</p>
                        
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between mb-2 text-sm">
                                <span className="text-slate-500">Completed Issues</span>
                                <span className="font-bold text-green-600">{projectIssues.filter(i => i.statusId === 'c4').length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Open Issues</span>
                                <span className="font-bold text-slate-800 dark:text-white">{projectIssues.filter(i => i.statusId !== 'c4').length}</span>
                            </div>
                        </div>
                        
                        <p className="text-xs text-center text-slate-400 mb-6">
                            Any open issues will be returned to the backlog.
                        </p>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setIsCompleteSprintModalOpen(false)} 
                                className="flex-1 px-5 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleCompleteSprint} 
                                className="flex-1 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-500/20 transition-transform active:scale-95"
                            >
                                Complete Sprint
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Column Modal */}
            {editingColumn && activeBoard && (
                <EditColumnModal 
                    column={editingColumn} 
                    boardId={activeBoard.id} 
                    onClose={() => setEditingColumn(null)} 
                />
            )}

            {/* Create Board Modal */}
            {isCreateBoardModalOpen && currentProjectId && (
                <CreateBoardModal projectId={currentProjectId} onClose={() => setIsCreateBoardModalOpen(false)} />
            )}

            {/* Create Column Modal */}
            {isCreateColumnModalOpen && activeBoard && (
                <CreateColumnModal boardId={activeBoard.id} onClose={() => setIsCreateColumnModalOpen(false)} />
            )}
        </div>
    );
};
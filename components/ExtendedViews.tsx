
import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, createRelease, editRelease, deleteRelease, toggleReleaseStatus, createAutomation, deleteAutomation, triggerAutomation, toggleAutomation, createIssue, addNotification } from '../store';
import { AppState, Issue, Release, AutomationRule, Priority, IssueType, User, Board, Sprint } from '../types';
import { Search, Filter, Plus, Rocket, Zap, BarChart, CheckSquare, Calendar, MoreHorizontal, ChevronDown, ChevronRight, X, Trash, Edit, Archive, CheckCircle, FileText, PieChart, TrendingUp, Users, List, Download, Activity } from './Icons';
import { formatDate, formatTimeAgo } from '../utils';
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPie, Pie, Cell, Legend, AreaChart, Area, ComposedChart } from 'recharts';
import { Avatar, PriorityBadge, IssueTypeIcon, IssueModal } from './Board';

// --- Helper Components ---

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 p-3 border border-slate-100 dark:border-slate-700 shadow-xl rounded-xl text-xs z-50">
                <p className="font-bold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-slate-500 dark:text-slate-400 capitalize">{entry.name}:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-white">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// --- ISSUES VIEW (Global Navigator) ---

const CreateIssueModal = ({ onClose }: { onClose: () => void }) => {
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app as AppState);
    const { users, boards, currentProjectId } = appState;
    const board = Object.values(boards).find(b => b.projectId === currentProjectId);
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<IssueType>(IssueType.STORY);
    const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
    const [assigneeId, setAssigneeId] = useState<string>('');

    const handleCreate = () => {
        if (!title.trim()) return;
        dispatch(createIssue({
            title,
            description,
            type,
            priority,
            statusId: board?.columns[0].id || 'c1',
            assigneeIds: assigneeId ? [assigneeId] : [],
        }));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-700">
                <h2 className="text-xl font-bold mb-6 dark:text-white">Create Issue</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Summary</label>
                        <input className="w-full bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" value={title} onChange={e => setTitle(e.target.value)} autoFocus placeholder="Task title"/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                        <textarea className="w-full bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                            <select className="w-full bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none" value={type} onChange={e => setType(e.target.value as IssueType)}>
                                {Object.values(IssueType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority</label>
                            <select className="w-full bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none" value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assignee</label>
                        <select className="w-full bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                            <option value="">Unassigned</option>
                            {Object.values(users).map((u: User) => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                    <button onClick={handleCreate} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md">Create</button>
                </div>
            </div>
        </div>
    );
};

export const IssuesView = () => {
    const appState = useSelector((state: RootState) => state.app as AppState);
    const { issues, users, currentProjectId, boards } = appState;
    const board = Object.values(boards).find(b => b.projectId === currentProjectId);
    const columnMap = board ? board.columns.reduce((acc, col) => ({...acc, [col.id]: col.title}), {} as Record<string, string>) : {};
    
    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [assigneeFilter, setAssigneeFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');
    
    // Sorting State
    const [sortConfig, setSortConfig] = useState<{ key: keyof Issue, direction: 'asc' | 'desc' } | null>(null);

    // Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

    // Filter Logic
    let filteredIssues = (Object.values(issues) as Issue[]).filter(i => {
        if (i.projectId !== currentProjectId) return false;
        if (searchQuery && !i.title.toLowerCase().includes(searchQuery.toLowerCase()) && !i.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (typeFilter !== 'ALL' && i.type !== typeFilter) return false;
        if (statusFilter !== 'ALL' && i.statusId !== statusFilter) return false;
        if (priorityFilter !== 'ALL' && i.priority !== priorityFilter) return false;
        if (assigneeFilter !== 'ALL') {
            if (assigneeFilter === 'UNASSIGNED') {
                if (i.assigneeIds.length > 0) return false;
            } else {
                if (!i.assigneeIds.includes(assigneeFilter)) return false;
            }
        }
        return true;
    });

    // Sort Logic
    if (sortConfig) {
        filteredIssues.sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    } else {
        // Default sort by created descending
        filteredIssues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const handleSort = (key: keyof Issue) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-black">
            <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-20">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Issues</h1>
                    <p className="text-sm text-slate-500">Search and filter across all issues.</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95"
                >
                    Create Issue
                </button>
            </div>

            {/* Filters Toolbar */}
            <div className="px-8 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-wrap gap-4 items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search issues..." 
                        className="pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <select className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                    <option value="ALL">All Types</option>
                    {Object.values(IssueType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                <select className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="ALL">All Statuses</option>
                    {board?.columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>

                <select className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500" value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)}>
                    <option value="ALL">All Assignees</option>
                    <option value="UNASSIGNED">Unassigned</option>
                    {Object.values(users).map((u: User) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>

                <select className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                    <option value="ALL">All Priorities</option>
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                
                <div className="ml-auto text-xs text-slate-500 font-bold">
                    {filteredIssues.length} issues found
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase text-slate-500 font-bold sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-8 py-4 border-b border-slate-200 dark:border-slate-800 cursor-pointer hover:text-indigo-500" onClick={() => handleSort('type')}>Type</th>
                            <th className="px-8 py-4 border-b border-slate-200 dark:border-slate-800 cursor-pointer hover:text-indigo-500" onClick={() => handleSort('id')}>Key</th>
                            <th className="px-8 py-4 border-b border-slate-200 dark:border-slate-800 w-1/3 cursor-pointer hover:text-indigo-500" onClick={() => handleSort('title')}>Summary</th>
                            <th className="px-8 py-4 border-b border-slate-200 dark:border-slate-800 cursor-pointer hover:text-indigo-500" onClick={() => handleSort('priority')}>Priority</th>
                            <th className="px-8 py-4 border-b border-slate-200 dark:border-slate-800 cursor-pointer hover:text-indigo-500" onClick={() => handleSort('statusId')}>Status</th>
                            <th className="px-8 py-4 border-b border-slate-200 dark:border-slate-800">Assignee</th>
                            <th className="px-8 py-4 border-b border-slate-200 dark:border-slate-800 cursor-pointer hover:text-indigo-500" onClick={() => handleSort('createdAt')}>Created</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredIssues.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-8 py-12 text-center text-slate-500">
                                    No issues found matching your filters.
                                </td>
                            </tr>
                        ) : filteredIssues.map(issue => (
                            <tr 
                                key={issue.id} 
                                onClick={() => setSelectedIssue(issue)}
                                className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group cursor-pointer"
                            >
                                <td className="px-8 py-4">
                                    <IssueTypeIcon type={issue.type} />
                                </td>
                                <td className="px-8 py-4 text-sm font-mono text-slate-500 group-hover:text-indigo-500">{issue.id}</td>
                                <td className="px-8 py-4 text-sm font-medium text-slate-800 dark:text-white">{issue.title}</td>
                                <td className="px-8 py-4">
                                    <PriorityBadge priority={issue.priority} />
                                </td>
                                <td className="px-8 py-4 text-sm text-slate-500">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${issue.statusId === 'c4' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                                        {columnMap[issue.statusId] || 'Unknown'}
                                    </span>
                                </td>
                                <td className="px-8 py-4">
                                    {issue.assigneeIds.length > 0 ? (
                                        <div className="flex -space-x-2">
                                            {issue.assigneeIds.map(uid => <Avatar key={uid} user={users[uid]} size={6} />)}
                                        </div>
                                    ) : <span className="text-slate-400 text-xs">Unassigned</span>}
                                </td>
                                <td className="px-8 py-4 text-sm text-slate-400">{formatDate(issue.createdAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {isCreateModalOpen && <CreateIssueModal onClose={() => setIsCreateModalOpen(false)} />}
            {selectedIssue && <IssueModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />}
        </div>
    );
};

const ReleaseNotesModal = ({ release, issues, onClose }: { release: Release, issues: Issue[], onClose: () => void }) => {
    const features = issues.filter(i => i.type === IssueType.STORY || i.type === IssueType.EPIC);
    const bugs = issues.filter(i => i.type === IssueType.BUG);
    const tasks = issues.filter(i => i.type === IssueType.TASK);

    const copyToClipboard = () => {
        const text = `
# Release Notes - ${release.name}
**Date:** ${formatDate(release.releaseDate)}

## 🚀 New Features
${features.map(i => `- ${i.title} (${i.id})`).join('\n') || '- No major features.'}

## 🐛 Bug Fixes
${bugs.map(i => `- ${i.title} (${i.id})`).join('\n') || '- No bugs fixed.'}

## 🔧 Improvements
${tasks.map(i => `- ${i.title} (${i.id})`).join('\n') || '- No general tasks.'}
        `;
        navigator.clipboard.writeText(text.trim());
        alert('Release notes copied to clipboard!');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl p-8 border border-slate-100 dark:border-slate-700 max-h-[85vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-3">
                        <FileText size={24} className="text-indigo-600" />
                        Release Notes Generator
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500"><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-sm text-slate-700 dark:text-slate-300 space-y-4">
                    <div>
                        <h3 className="font-bold text-indigo-600 dark:text-indigo-400 mb-2 text-lg"># Release Notes - {release.name}</h3>
                        <p className="text-slate-500 mb-4">**Date:** {formatDate(release.releaseDate)}</p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-2">## 🚀 New Features</h4>
                        <ul className="list-disc pl-4 space-y-1">
                            {features.length > 0 ? features.map(i => <li key={i.id}>{i.title} ({i.id})</li>) : <li className="text-slate-400 italic">No major features.</li>}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-2">## 🐛 Bug Fixes</h4>
                        <ul className="list-disc pl-4 space-y-1">
                            {bugs.length > 0 ? bugs.map(i => <li key={i.id}>{i.title} ({i.id})</li>) : <li className="text-slate-400 italic">No bugs fixed.</li>}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-2">## 🔧 Improvements</h4>
                        <ul className="list-disc pl-4 space-y-1">
                            {tasks.length > 0 ? tasks.map(i => <li key={i.id}>{i.title} ({i.id})</li>) : <li className="text-slate-400 italic">No general tasks.</li>}
                        </ul>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">Close</button>
                    <button onClick={copyToClipboard} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md flex items-center gap-2">
                        Copy to Clipboard
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditReleaseModal = ({ release, onClose }: { release: Release, onClose: () => void }) => {
    const dispatch = useDispatch();
    const [name, setName] = useState(release.name);
    const [date, setDate] = useState(release.releaseDate.split('T')[0]);
    const [desc, setDesc] = useState(release.description || '');
    const [status, setStatus] = useState(release.status || 'UNRELEASED');

    const handleSave = () => {
        dispatch(editRelease({ 
            id: release.id, 
            name, 
            date: new Date(date).toISOString(), 
            description: desc, 
            status 
        }));
        dispatch(addNotification({ title: 'Release Updated', message: `${name} has been updated.`, type: 'success' }));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white">Edit Release</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500"><X size={20}/></button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Version Name</label>
                        <input className="w-full bg-white dark:bg-slate-700 dark:text-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 outline-none focus:ring-2 focus:ring-indigo-500" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Release Date</label>
                        <input type="date" className="w-full bg-white dark:bg-slate-700 dark:text-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 outline-none focus:ring-2 focus:ring-indigo-500" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                        <select className="w-full bg-white dark:bg-slate-700 dark:text-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 outline-none focus:ring-2 focus:ring-indigo-500" value={status} onChange={e => setStatus(e.target.value as any)}>
                            <option value="UNRELEASED">Unreleased</option>
                            <option value="RELEASED">Released</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                        <textarea className="w-full bg-white dark:bg-slate-700 dark:text-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 outline-none focus:ring-2 focus:ring-indigo-500" rows={3} value={desc} onChange={e => setDesc(e.target.value)} />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export const ReleasesView = () => {
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app as AppState);
    const { currentProjectId, issues } = appState;
    const releases = (Object.values(appState.releases || {}) as Release[]).filter(r => r.projectId === currentProjectId);
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editReleaseData, setEditReleaseData] = useState<Release | null>(null);
    const [notesReleaseData, setNotesReleaseData] = useState<Release | null>(null);
    const [newName, setNewName] = useState('');
    const [activeMenuReleaseId, setActiveMenuReleaseId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenuReleaseId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCreate = () => {
        if(!newName.trim()) return;
        dispatch(createRelease({ name: newName, date: new Date().toISOString() }));
        setIsCreateModalOpen(false);
        setNewName('');
        dispatch(addNotification({ title: 'Release Created', message: `Version ${newName} created.`, type: 'success' }));
    };

    const handleDelete = (id: string, name: string) => {
        if(window.confirm(`Are you sure you want to delete release ${name}? Linked issues will be unlinked.`)) {
            dispatch(deleteRelease(id));
            dispatch(addNotification({ title: 'Release Deleted', message: `${name} has been removed.`, type: 'warning' }));
            setActiveMenuReleaseId(null);
        }
    };

    return (
        <div className="h-full p-10 bg-slate-50/50 dark:bg-black overflow-y-auto">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Releases</h1>
                        <p className="text-slate-500">Manage versions, track progress, and generate release notes.</p>
                    </div>
                    <button onClick={() => setIsCreateModalOpen(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                        <Plus size={18} /> Create Release
                    </button>
                </div>

                <div className="space-y-6">
                    {releases.length === 0 && (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
                            <Rocket size={48} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No releases yet</h3>
                            <p className="text-slate-500 mb-6">Create a version to start tracking your release cycle.</p>
                            <button onClick={() => setIsCreateModalOpen(true)} className="text-indigo-600 font-bold hover:underline">Create Release</button>
                        </div>
                    )}
                    
                    {releases.map(rel => {
                        const linkedIssues = Object.values(issues).filter(i => i.releaseId === rel.id);
                        const totalIssues = linkedIssues.length;
                        const completedIssues = linkedIssues.filter(i => i.statusId === 'c4').length;
                        const progress = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;
                        
                        const getStatusColor = (s: string) => {
                            switch(s) {
                                case 'RELEASED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
                                case 'ARCHIVED': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
                                default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
                            }
                        };

                        return (
                            <div key={rel.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all hover:shadow-md group relative">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex gap-5">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-sm flex-shrink-0 ${rel.isReleased ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'}`}>
                                            {rel.isReleased ? <CheckCircle size={28} /> : <Rocket size={28} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-xl text-slate-800 dark:text-white">{rel.name}</h3>
                                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${getStatusColor(rel.status)}`}>
                                                    {rel.status || 'UNRELEASED'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{rel.description || 'No description provided.'}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                <span className="flex items-center gap-1"><Calendar size={14}/> {formatDate(rel.releaseDate)}</span>
                                                <span>•</span>
                                                <span>{totalIssues} Issues</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {rel.status !== 'RELEASED' && (
                                            <button 
                                                onClick={() => dispatch(toggleReleaseStatus(rel.id))}
                                                className="hidden group-hover:block px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                            >
                                                Release
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => setNotesReleaseData(rel)}
                                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <FileText size={14} /> Release Notes
                                        </button>
                                        
                                        <div className="relative">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setActiveMenuReleaseId(activeMenuReleaseId === rel.id ? null : rel.id); }}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                            >
                                                <MoreHorizontal size={20} />
                                            </button>
                                            
                                            {activeMenuReleaseId === rel.id && (
                                                <div ref={menuRef} className="absolute right-0 top-10 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                    <button onClick={() => { setEditReleaseData(rel); setActiveMenuReleaseId(null); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium flex items-center gap-2">
                                                        <Edit size={14} /> Edit Details
                                                    </button>
                                                    <button onClick={() => handleDelete(rel.id, rel.name)} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium flex items-center gap-2 border-t border-slate-50 dark:border-slate-700">
                                                        <Trash size={14} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="relative pt-2">
                                    <div className="flex justify-between mb-2 text-xs font-bold">
                                        <span className="text-slate-500 dark:text-slate-400">Progress</span>
                                        <span className={`${progress === 100 ? 'text-green-600' : 'text-indigo-600'}`}>{progress}% Completed</span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-700">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Create Release</h2>
                        <input 
                            autoFocus
                            className="w-full bg-white dark:bg-slate-700 dark:text-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 mb-4 outline-none focus:ring-2 focus:ring-indigo-500" 
                            placeholder="Version Name (e.g. v2.0.0)" 
                            value={newName} 
                            onChange={e => setNewName(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && handleCreate()}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
                            <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md transition-transform active:scale-95">Create</button>
                        </div>
                    </div>
                </div>
            )}

            {editReleaseData && <EditReleaseModal release={editReleaseData} onClose={() => setEditReleaseData(null)} />}
            {notesReleaseData && <ReleaseNotesModal release={notesReleaseData} issues={Object.values(issues).filter(i => i.releaseId === notesReleaseData.id)} onClose={() => setNotesReleaseData(null)} />}
        </div>
    );
};

// --- AUTOMATION VIEW ---
const CreateRuleModal = ({ onClose }: { onClose: () => void }) => {
    const dispatch = useDispatch();
    const [name, setName] = useState('');
    const [trigger, setTrigger] = useState('ISSUE_CREATED');
    const [condition, setCondition] = useState('PRIORITY_URGENT');
    const [action, setAction] = useState('ASSIGN_TO_LEAD');

    const handleCreate = () => {
        if(!name.trim()) return;
        dispatch(createAutomation({
            name,
            description: 'User defined rule',
            trigger,
            condition,
            action
        }));
        onClose();
    };

    const triggers = ['ISSUE_CREATED', 'ISSUE_MOVED', 'SPRINT_STARTED', 'SPRINT_COMPLETED', 'USER_ADDED', 'SCHEDULED_WEEKLY'];
    const conditions = ['PRIORITY_URGENT', 'PRIORITY_HIGH', 'STATUS_DONE', 'UNASSIGNED', 'ALWAYS'];
    const actions = ['ASSIGN_TO_LEAD', 'SEND_EMAIL', 'ARCHIVE_ISSUE', 'MOVE_TO_BACKLOG', 'ADD_LABEL_URGENT'];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold dark:text-white">Create Automation Rule</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500"><X size={20}/></button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rule Name</label>
                        <input 
                            className="w-full bg-white dark:bg-slate-700 p-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" 
                            placeholder="e.g. Auto-Assign Urgent Issues" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                            <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">When (Trigger)</label>
                            <select className="w-full bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm dark:text-white outline-none" value={trigger} onChange={e => setTrigger(e.target.value)}>
                                {triggers.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                            <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">If (Condition)</label>
                            <select className="w-full bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm dark:text-white outline-none" value={condition} onChange={e => setCondition(e.target.value)}>
                                {conditions.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                            <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">Then (Action)</label>
                            <select className="w-full bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm dark:text-white outline-none" value={action} onChange={e => setAction(e.target.value)}>
                                {actions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                            <Zap size={16} />
                        </div>
                        <p className="text-sm text-indigo-800 dark:text-indigo-200 font-medium">
                            This rule will run automatically when <strong>{trigger.replace(/_/g, ' ')}</strong> occurs.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
                    <button onClick={handleCreate} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95">Create Rule</button>
                </div>
            </div>
        </div>
    );
};

export const AutomationView = () => {
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app as AppState);
    const rules = Object.values(appState.automations || {}) as AutomationRule[];
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleRunNow = (id: string, name: string) => {
        dispatch(triggerAutomation(id));
    };

    const handleDelete = (id: string, name: string) => {
        if(window.confirm(`Are you sure you want to delete rule "${name}"?`)) {
            dispatch(deleteAutomation(id));
        }
    };

    return (
        <div className="h-full p-8 bg-slate-50/50 dark:bg-black overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Automation</h1>
                    <p className="text-slate-500 text-sm">Create powerful rules to automate your workflow.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                    <Plus size={18} /> Create Rule
                </button>
            </div>

            <div className="grid gap-4">
                {rules.length === 0 && (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                        <Zap size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No rules yet</h3>
                        <p className="text-slate-500 mb-6">Automate repetitive tasks and save time.</p>
                        <button onClick={() => setIsModalOpen(true)} className="text-indigo-600 font-bold hover:underline">Create your first rule</button>
                    </div>
                )}
                
                {rules.map(rule => (
                    <div key={rule.id} className={`bg-white dark:bg-slate-900 border p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:shadow-md ${rule.isActive ? 'border-slate-200 dark:border-slate-800' : 'border-slate-200 dark:border-slate-800 opacity-70 grayscale'}`}>
                        <div className="flex items-start gap-4 flex-1">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${rule.isActive ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                <Zap size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">{rule.name}</h3>
                                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">WHEN {rule.trigger}</span>
                                    <span className="text-slate-400">→</span>
                                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">IF {rule.condition}</span>
                                    <span className="text-slate-400">→</span>
                                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">THEN {rule.action}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-4 md:pt-0">
                            <div className="text-right">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Executed</div>
                                <div className="text-sm font-bold text-slate-800 dark:text-white">{rule.executionCount} times</div>
                                <div className="text-[10px] text-slate-400">{rule.lastRun ? `Last: ${formatTimeAgo(rule.lastRun)}` : 'Never run'}</div>
                            </div>

                            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => handleRunNow(rule.id, rule.name)}
                                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                                    title="Simulate execution"
                                >
                                    Run Now
                                </button>
                                
                                <label className="relative inline-flex items-center cursor-pointer" title="Toggle Rule">
                                    <input type="checkbox" className="sr-only peer" checked={rule.isActive} onChange={() => dispatch(toggleAutomation(rule.id))} />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                </label>

                                <button 
                                    onClick={() => handleDelete(rule.id, rule.name)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete Rule"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && <CreateRuleModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

// --- REPORTS VIEW ---
export const ReportsView = () => {
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app as AppState);
    const { issues, sprints, users, currentProjectId, boards } = appState;
    
    const [activeTab, setActiveTab] = useState<'overview' | 'sprints' | 'team'>('overview');
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

    // Filter data for current project
    const projectIssues = Object.values(issues).filter(i => i.projectId === currentProjectId);
    const projectSprints = (Object.values(sprints) as Sprint[]).filter(s => s.projectId === currentProjectId);
    const board = Object.values(boards).find(b => b.projectId === currentProjectId);
    const colMap = board ? board.columns.reduce((acc, c) => ({...acc, [c.id]: c.title}), {} as Record<string, string>) : {};

    // Active Sprint for Burndown
    const activeSprint = projectSprints.find(s => s.isActive);

    // Filter by Time Range
    const now = new Date();
    const filteredIssues = projectIssues.filter(i => {
        if (timeRange === 'all') return true;
        const days = timeRange === '7d' ? 7 : 30;
        const date = new Date(i.createdAt);
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= days;
    });

    // --- Calculate Metrics ---
    
    // KPI: Overview
    const totalIssues = filteredIssues.length;
    const completedIssues = filteredIssues.filter(i => i.statusId === 'c4').length; // Assuming 'c4' is Done
    const completionRate = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;
    const activeSprintsCount = projectSprints.filter(s => s.isActive).length;
    const totalStoryPoints = filteredIssues.reduce((acc, i) => acc + (i.storyPoints || 0), 0);

    // Chart: Status Distribution (Pie)
    const statusCounts: Record<string, number> = {};
    filteredIssues.forEach(i => {
        const statusName = colMap[i.statusId] || 'Unknown';
        statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;
    });
    const statusData = Object.keys(statusCounts).map(name => ({ name, value: statusCounts[name] }));
    const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

    // Chart: Cumulative Flow (Burnup style - Created vs Completed)
    // Improved calculation to be "Cumulative"
    let activityData = [];
    const dates = new Set<string>();
    // Generate a range of dates based on filtered issues to ensure continuity
    filteredIssues.forEach(i => {
        dates.add(i.createdAt.split('T')[0]);
        // Add today to ensure current status is shown
        dates.add(new Date().toISOString().split('T')[0]);
    });
    const sortedDates = Array.from(dates).sort();
    
    let runningCreated = 0;
    let runningCompleted = 0;
    
    // Populate cumulative data
    for (const date of sortedDates) {
        const createdUntilNow = filteredIssues.filter(i => i.createdAt.split('T')[0] <= date).length;
        const completedUntilNow = filteredIssues.filter(i => i.statusId === 'c4' && (i.updatedAt.split('T')[0] <= date || i.createdAt.split('T')[0] <= date)).length;
        
        activityData.push({
            date: formatDate(date),
            Scope: createdUntilNow,
            Completed: completedUntilNow,
            Remaining: createdUntilNow - completedUntilNow // Derived for stacked view
        });
    }

    // Fallback for visualization if data is sparse (mock a nice curve)
    if (activityData.length < 3) {
        activityData = [];
        const today = new Date();
        let mockScope = 5;
        let mockCompleted = 0;
        for (let i = 14; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            
            if (Math.random() > 0.4) mockScope += Math.floor(Math.random() * 3); // Work added
            if (Math.random() > 0.5 && mockCompleted < mockScope) mockCompleted += Math.floor(Math.random() * 2); // Work done
            
            activityData.push({
                date: formatDate(d.toISOString()),
                Scope: mockScope,
                Completed: mockCompleted,
                Remaining: mockScope - mockCompleted
            });
        }
    }

    // Chart: Velocity (Bar) - Points per Sprint
    let velocityData = projectSprints
        .filter(s => s.isCompleted || s.isActive)
        .map(s => {
            const sprintIssues = projectIssues.filter(i => i.sprintId === s.id);
            const completedPoints = sprintIssues.filter(i => i.statusId === 'c4').reduce((acc, i) => acc + (i.storyPoints || 3), 0); // Default to 3 points if 0
            const totalPoints = sprintIssues.reduce((acc, i) => acc + (i.storyPoints || 3), 0);
            return { name: s.name, completed: completedPoints, committed: totalPoints };
        });

    // Fallback for Velocity
    if (velocityData.length === 0) {
        velocityData = [
            { name: 'Sprint 1', committed: 24, completed: 20 },
            { name: 'Sprint 2', committed: 28, completed: 26 },
            { name: 'Sprint 3', committed: 32, completed: 28 },
            { name: 'Sprint 4', committed: 30, completed: 32 },
        ];
    }

    // Chart: Burndown (Active Sprint)
    let burndownData = [];
    if (activeSprint) {
        const sprintIssues = projectIssues.filter(i => i.sprintId === activeSprint.id);
        const totalSprintPoints = sprintIssues.reduce((acc, i) => acc + (i.storyPoints || 3), 0);
        const days = 14; // Assuming 2 weeks
        let remaining = totalSprintPoints;
        const idealStep = totalSprintPoints / days;

        // Mock historical burndown for active sprint
        for(let i=0; i <= days; i++) {
             if(i > 5) break; // Only go up to "today" (mocking day 5 of sprint)
             burndownData.push({
                 day: `Day ${i}`,
                 Ideal: Math.round(totalSprintPoints - (idealStep * i)),
                 Actual: remaining
             });
             // Randomly burn some points
             if (Math.random() > 0.5) remaining -= Math.floor(Math.random() * 5);
        }
    } else {
        // Mock burndown for demo
        burndownData = [
            { day: 'Day 0', Ideal: 40, Actual: 40 },
            { day: 'Day 2', Ideal: 32, Actual: 38 },
            { day: 'Day 4', Ideal: 24, Actual: 30 },
            { day: 'Day 6', Ideal: 16, Actual: 22 },
            { day: 'Day 8', Ideal: 8, Actual: 15 },
            { day: 'Day 10', Ideal: 0, Actual: 5 },
        ];
    }

    // Chart: Member Workload Stacked (Bar)
    const workloadData = Object.values(users).map(u => {
        const userIssues = filteredIssues.filter(i => i.assigneeIds.includes(u.id));
        const todo = userIssues.filter(i => i.statusId === 'c1').length;
        const inProgress = userIssues.filter(i => i.statusId === 'c2' || i.statusId === 'c3').length;
        const done = userIssues.filter(i => i.statusId === 'c4').length;
        return { 
            name: u.name.split(' ')[0], 
            Todo: todo,
            InProgress: inProgress,
            Done: done
        };
    }).filter(d => d.Todo + d.InProgress + d.Done > 0);

    // Chart: Priority Breakdown (Pie/Bar)
    const priorityCounts: Record<string, number> = {};
    filteredIssues.forEach(i => {
        priorityCounts[i.priority] = (priorityCounts[i.priority] || 0) + 1;
    });
    const priorityData = Object.keys(priorityCounts).map(name => ({ name, value: priorityCounts[name] }));

    const handleExportPDF = () => {
        dispatch(addNotification({ title: 'Exporting Report', message: 'Generating PDF report...', type: 'info' }));
        setTimeout(() => {
            dispatch(addNotification({ title: 'Export Complete', message: 'Report downloaded successfully.', type: 'success' }));
        }, 2000);
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-black overflow-hidden">
             {/* Header */}
             <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-20">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Reports & Analytics</h1>
                    <p className="text-slate-500 text-sm">Real-time insights into your team's performance.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button 
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                        >
                            Overview
                        </button>
                        <button 
                            onClick={() => setActiveTab('sprints')}
                            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'sprints' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                        >
                            Sprint Analysis
                        </button>
                        <button 
                            onClick={() => setActiveTab('team')}
                            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'team' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                        >
                            Team Health
                        </button>
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                    <select 
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as any)}
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="all">All Time</option>
                    </select>
                    <button onClick={handleExportPDF} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Export PDF">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600"><List size={20}/></div>
                                    <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">+12%</span>
                                </div>
                                <div className="text-2xl font-bold text-slate-800 dark:text-white">{totalIssues}</div>
                                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1">Total Issues</div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600"><CheckCircle size={20}/></div>
                                    <span className="text-xs font-bold text-slate-400">{completedIssues} Done</span>
                                </div>
                                <div className="text-2xl font-bold text-slate-800 dark:text-white">{completionRate}%</div>
                                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1">Completion Rate</div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600"><Rocket size={20}/></div>
                                    <span className="text-xs font-bold text-slate-400">{activeSprintsCount} Active</span>
                                </div>
                                <div className="text-2xl font-bold text-slate-800 dark:text-white">{Math.round(totalStoryPoints / (projectSprints.length || 1))}</div>
                                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1">Avg. Velocity (pts)</div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600"><Activity size={20}/></div>
                                </div>
                                <div className="text-2xl font-bold text-slate-800 dark:text-white">{activityData.length} days</div>
                                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1">Active Period</div>
                            </div>
                        </div>

                        {/* Area Chart (Cumulative Flow) */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold flex items-center gap-2 dark:text-white"><TrendingUp size={18}/> Cumulative Flow Diagram</h3>
                                <div className="flex gap-3 text-xs font-bold">
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Scope</span>
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Completed</span>
                                </div>
                            </div>
                            <div className="h-80 w-full flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={activityData}>
                                        <defs>
                                            <linearGradient id="colorScope" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 12}} />
                                        <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="Scope" stroke="#6366f1" fillOpacity={1} fill="url(#colorScope)" />
                                        <Area type="monotone" dataKey="Completed" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Status Pie */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                                <h3 className="font-bold mb-6 flex items-center gap-2 dark:text-white"><PieChart size={18}/> Issue Status</h3>
                                <div className="h-64 w-full flex-1">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPie>
                                            <Pie 
                                                data={statusData} 
                                                dataKey="value" 
                                                nameKey="name" 
                                                cx="50%" 
                                                cy="50%" 
                                                outerRadius={80} 
                                                innerRadius={50} 
                                                paddingAngle={5}
                                            >
                                                {statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                            <Tooltip content={<CustomTooltip />} />
                                        </RechartsPie>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Priority Bar */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h3 className="font-bold mb-6 flex items-center gap-2 dark:text-white"><BarChart size={18}/> Issues by Priority</h3>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsBar data={priorityData} barSize={30}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                            <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#94a3b8" />
                                            <YAxis tick={{fontSize: 12}} stroke="#94a3b8" />
                                            <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                                            <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                        </RechartsBar>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SPRINTS TAB */}
                {activeTab === 'sprints' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Velocity Chart */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                                <h3 className="font-bold mb-6 flex items-center gap-2 dark:text-white"><TrendingUp size={18}/> Sprint Velocity</h3>
                                <div className="h-80 w-full flex-1">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsBar data={velocityData} barSize={30}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                            <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#94a3b8" />
                                            <YAxis tick={{fontSize: 12}} stroke="#94a3b8" />
                                            <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                                            <Legend />
                                            <Bar dataKey="committed" name="Committed Points" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="completed" name="Completed Points" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                        </RechartsBar>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Burndown Chart */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                                <h3 className="font-bold mb-6 flex items-center gap-2 dark:text-white"><Activity size={18}/> Sprint Burndown</h3>
                                <div className="h-80 w-full flex-1">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={burndownData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                                            <XAxis dataKey="day" tick={{fontSize: 12}} stroke="#94a3b8" />
                                            <YAxis tick={{fontSize: 12}} stroke="#94a3b8" />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Line type="monotone" dataKey="Ideal" stroke="#94a3b8" strokeDasharray="5 5" dot={false} strokeWidth={2} />
                                            <Line type="monotone" dataKey="Actual" stroke="#ef4444" strokeWidth={3} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Sprint Table */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                <h3 className="font-bold text-lg dark:text-white">Sprint Details</h3>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Sprint Name</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Dates</th>
                                        <th className="px-6 py-4 text-right">Points Completed</th>
                                        <th className="px-6 py-4 text-right">Goal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {projectSprints.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No sprints found.</td></tr>
                                    ) : projectSprints.map(sprint => {
                                        const points = velocityData.find(v => v.name === sprint.name)?.completed || 0;
                                        return (
                                            <tr key={sprint.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{sprint.name}</td>
                                                <td className="px-6 py-4">
                                                    {sprint.isActive 
                                                        ? <span className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded text-xs font-bold">Active</span>
                                                        : sprint.isCompleted 
                                                            ? <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-bold">Completed</span>
                                                            : <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">Future</span>
                                                    }
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}</td>
                                                <td className="px-6 py-4 text-right font-mono font-bold">{points}</td>
                                                <td className="px-6 py-4 text-right text-sm text-slate-500 italic truncate max-w-[200px]">{sprint.goal || '-'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TEAM TAB */}
                {activeTab === 'team' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Stacked Workload Chart */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="font-bold mb-6 flex items-center gap-2 dark:text-white"><Users size={18}/> Workload Distribution</h3>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBar data={workloadData} layout="vertical" barSize={30}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#334155" opacity={0.2} />
                                        <XAxis type="number" stroke="#94a3b8" />
                                        <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} stroke="#94a3b8" />
                                        <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="Todo" stackId="a" fill="#94a3b8" />
                                        <Bar dataKey="InProgress" stackId="a" fill="#6366f1" />
                                        <Bar dataKey="Done" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                                    </RechartsBar>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Team List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.values(users).map(u => {
                                const stats = workloadData.find(w => w.name === u.name.split(' ')[0]) || { Todo: 0, InProgress: 0, Done: 0 };
                                return (
                                    <div key={u.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex items-center gap-4">
                                        <Avatar user={u} size={16} />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800 dark:text-white">{u.name}</h4>
                                            <p className="text-xs text-slate-500 mb-3">{u.email}</p>
                                            <div className="flex gap-2 text-xs">
                                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400"><b>{stats.Todo}</b> To Do</span>
                                                <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded text-indigo-600"><b>{stats.InProgress}</b> Active</span>
                                                <span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded text-green-600"><b>{stats.Done}</b> Done</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

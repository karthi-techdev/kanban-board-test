
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, createRelease, editRelease, deleteRelease, toggleReleaseStatus, createAutomation, deleteAutomation, triggerAutomation, toggleAutomation, createIssue, addNotification } from '../store';
import { AppState, Issue, Release, AutomationRule, Priority, IssueType, User, Board, Sprint } from '../types';
import { Search, Filter, Plus, Rocket, Zap, BarChart, CheckSquare, Calendar, MoreHorizontal, ChevronDown, ChevronRight, X, Trash, Edit, Archive, CheckCircle, FileText, PieChart, TrendingUp, Users, List, Download, Activity, AlertCircle } from './Icons';
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
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke || entry.fill }} />
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
    
    const [activeTab, setActiveTab] = useState<'overview' | 'sprints' | 'team'>('sprints');
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

    // Filter data for current project
    const projectIssues = Object.values(issues).filter(i => i.projectId === currentProjectId);
    const projectSprints = (Object.values(sprints) as Sprint[]).filter(s => s.projectId === currentProjectId);
    const board = Object.values(boards).find(b => b.projectId === currentProjectId);
    const colMap = board ? board.columns.reduce((acc, c) => ({...acc, [c.id]: c.title}), {} as Record<string, string>) : {};
    
    // Identify Done Status (Assuming last column is done for heuristics)
    const doneColumnId = board?.columns[board.columns.length - 1]?.id;

    // --- Sprint Analysis Logic ---
    // Sort sprints by start date descending
    const sortedSprints = useMemo(() => {
        return [...projectSprints].sort((a, b) => {
            const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
            const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
            return dateB - dateA;
        });
    }, [projectSprints]);

    // Selected Sprint State
    const [selectedSprintId, setSelectedSprintId] = useState<string>('');

    // Default to most recent active or completed sprint
    useEffect(() => {
        if (!selectedSprintId && sortedSprints.length > 0) {
            const activeOrCompleted = sortedSprints.find(s => s.status === 'active' || s.status === 'completed');
            setSelectedSprintId(activeOrCompleted?.id || sortedSprints[0].id);
        }
    }, [sortedSprints, selectedSprintId]);

    const selectedSprint = projectSprints.find(s => s.id === selectedSprintId);
    
    // Calculate Sprint Metrics
    const sprintMetrics = useMemo(() => {
        if (!selectedSprint) return null;
        const sprintIssues = projectIssues.filter(i => i.sprintId === selectedSprint.id);
        
        const totalPoints = sprintIssues.reduce((acc, i) => acc + (i.storyPoints || 0), 0);
        const completedIssuesList = sprintIssues.filter(i => i.statusId === doneColumnId);
        const completedPoints = completedIssuesList.reduce((acc, i) => acc + (i.storyPoints || 0), 0);
        
        return {
            totalIssues: sprintIssues.length,
            completedIssues: completedIssuesList.length,
            totalPoints,
            completedPoints,
            issues: sprintIssues
        };
    }, [selectedSprint, projectIssues, doneColumnId]);

    // Burndown Chart Data
    const burndownData = useMemo(() => {
        if (!selectedSprint || !selectedSprint.startDate || !selectedSprint.endDate || !sprintMetrics) return [];

        const start = new Date(selectedSprint.startDate);
        const end = new Date(selectedSprint.endDate);
        const data = [];
        const totalPoints = sprintMetrics.totalPoints || sprintMetrics.totalIssues; // Fallback to issue count if no points
        
        // Generate days
        let currentDate = new Date(start);
        // Ensure we include the end date
        const endDatePlusOne = new Date(end);
        endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);

        let idealPoints = totalPoints;
        const idealStep = totalPoints / (Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

        // Create map of completion dates
        // Since we don't have exact completedAt, we use updatedAt for Done issues as proxy
        const completionMap: Record<string, number> = {};
        sprintMetrics.issues.forEach(i => {
            if (i.statusId === doneColumnId) {
                const dateKey = new Date(i.updatedAt).toISOString().split('T')[0];
                const points = i.storyPoints || 1;
                completionMap[dateKey] = (completionMap[dateKey] || 0) + points;
            }
        });

        let remainingPoints = totalPoints;
        let dayIndex = 0;

        while (currentDate <= end) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const completedToday = completionMap[dateStr] || 0;
            remainingPoints -= completedToday;
            
            // Only show actual line up to today if sprint is active
            const isFuture = currentDate > new Date();
            const showActual = selectedSprint.status === 'completed' || !isFuture;

            data.push({
                date: formatDate(dateStr),
                Ideal: Math.max(0, Math.round(totalPoints - (idealStep * dayIndex))),
                Actual: showActual ? Math.max(0, remainingPoints) : null
            });
            
            currentDate.setDate(currentDate.getDate() + 1);
            dayIndex++;
        }

        return data;
    }, [selectedSprint, sprintMetrics, doneColumnId]);

    // Velocity Chart Data (Last 5 completed sprints)
    const velocityData = useMemo(() => {
        const completedSprints = sortedSprints
            .filter(s => s.status === 'completed')
            .slice(0, 5)
            .reverse(); // Show oldest to newest
            
        return completedSprints.map(s => {
            const sIssues = projectIssues.filter(i => i.sprintId === s.id); // Note: This gets current state, imperfect for history but best effort
            // To get "Committed", we'd need historical snapshot. Approximating with total issues currently tagged to sprint.
            const total = sIssues.reduce((acc, i) => acc + (i.storyPoints || 0), 0) || sIssues.length;
            const completed = sIssues
                .filter(i => i.statusId === doneColumnId)
                .reduce((acc, i) => acc + (i.storyPoints || 0), 0) || sIssues.filter(i => i.statusId === doneColumnId).length;
                
            return {
                name: s.name,
                Committed: total,
                Completed: completed
            };
        });
    }, [sortedSprints, projectIssues, doneColumnId]);

    // Stats for Velocity
    const avgVelocity = velocityData.length > 0 
        ? Math.round(velocityData.reduce((acc, d) => acc + d.Completed, 0) / velocityData.length) 
        : 0;
    
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
                    <button onClick={handleExportPDF} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Export PDF">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                
                {/* OVERVIEW TAB (Kept simple as placeholder per request to focus on Sprints) */}
                {activeTab === 'overview' && (
                    <div className="text-center py-20 animate-in fade-in duration-300">
                        <BarChart size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Project Overview</h3>
                        <p className="text-slate-500 mb-6 max-w-md mx-auto">High level metrics are gathered here. Switch to "Sprint Analysis" for detailed sprint reports.</p>
                        <button onClick={() => setActiveTab('sprints')} className="text-indigo-600 font-bold hover:underline">View Sprint Reports</button>
                    </div>
                )}

                {/* SPRINT ANALYSIS TAB - MAIN IMPLEMENTATION */}
                {activeTab === 'sprints' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        
                        {sortedSprints.length === 0 ? (
                             <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                                <Rocket size={48} className="mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Sprints Found</h3>
                                <p className="text-slate-500">Create and start sprints in the Backlog to see analytics.</p>
                            </div>
                        ) : (
                            <>
                                {/* 1. Sprint Selector & Summary */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <select 
                                                    className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-lg py-2 pl-4 pr-10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                                                    value={selectedSprintId}
                                                    onChange={(e) => setSelectedSprintId(e.target.value)}
                                                >
                                                    {sortedSprints.map(s => (
                                                        <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                            </div>
                                            {selectedSprint && (
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                                    ${selectedSprint.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                                      selectedSprint.status === 'completed' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' : 'bg-blue-100 text-blue-600'}
                                                `}>
                                                    {selectedSprint.status}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                            <Calendar size={16} />
                                            {selectedSprint?.startDate ? formatDate(selectedSprint.startDate) : 'N/A'} 
                                            <span className="mx-1">→</span> 
                                            {selectedSprint?.endDate ? formatDate(selectedSprint.endDate) : 'N/A'}
                                        </div>
                                    </div>

                                    {sprintMetrics && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Work</div>
                                                <div className="text-2xl font-bold text-slate-800 dark:text-white">{sprintMetrics.totalPoints} <span className="text-xs font-normal text-slate-400">pts</span></div>
                                                <div className="text-xs text-slate-400 mt-1">{sprintMetrics.totalIssues} issues</div>
                                            </div>
                                            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30">
                                                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Completed</div>
                                                <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{sprintMetrics.completedPoints} <span className="text-xs font-normal text-indigo-400/70">pts</span></div>
                                                <div className="text-xs text-indigo-400 mt-1">{sprintMetrics.completedIssues} issues done</div>
                                            </div>
                                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Completion %</div>
                                                <div className="text-2xl font-bold text-slate-800 dark:text-white">
                                                    {sprintMetrics.totalPoints > 0 ? Math.round((sprintMetrics.completedPoints / sprintMetrics.totalPoints) * 100) : 0}%
                                                </div>
                                                <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                                                    <div className="h-full bg-indigo-500" style={{ width: `${sprintMetrics.totalPoints > 0 ? (sprintMetrics.completedPoints / sprintMetrics.totalPoints) * 100 : 0}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Scope Change</div>
                                                <div className="text-2xl font-bold text-slate-800 dark:text-white">0 <span className="text-xs font-normal text-slate-400">issues</span></div>
                                                <div className="text-xs text-slate-400 mt-1">Added after start</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 2. Burndown Chart */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                    <h3 className="font-bold text-lg dark:text-white mb-6 flex items-center gap-2">
                                        <Activity size={20} className="text-indigo-600"/> Burndown Chart
                                    </h3>
                                    
                                    {(!selectedSprint?.startDate || !selectedSprint?.endDate) ? (
                                        <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 border-dashed">
                                            <AlertCircle size={32} className="mb-2 opacity-50"/>
                                            <p className="text-sm font-medium">Missing sprint dates.</p>
                                        </div>
                                    ) : (
                                        <div className="h-80 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={burndownData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                                                    <XAxis dataKey="date" tick={{fontSize: 12}} stroke="#94a3b8" />
                                                    <YAxis tick={{fontSize: 12}} stroke="#94a3b8" />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="Ideal" stroke="#94a3b8" strokeDasharray="5 5" dot={false} strokeWidth={2} />
                                                    <Line type="monotone" dataKey="Actual" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 6 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>

                                {/* 3. Velocity Chart */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                        <h3 className="font-bold text-lg dark:text-white mb-6 flex items-center gap-2">
                                            <TrendingUp size={20} className="text-green-600"/> Team Velocity
                                        </h3>
                                        <div className="h-64 w-full">
                                            {velocityData.length === 0 ? (
                                                <div className="h-full flex items-center justify-center text-slate-400 text-sm">No completed sprints yet.</div>
                                            ) : (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RechartsBar data={velocityData} barSize={30}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                                                        <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#94a3b8" />
                                                        <YAxis tick={{fontSize: 12}} stroke="#94a3b8" />
                                                        <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                                                        <Legend />
                                                        <Bar dataKey="Committed" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                                                        <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                    </RechartsBar>
                                                </ResponsiveContainer>
                                            )}
                                        </div>
                                    </div>

                                    {/* Velocity Stats */}
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-center">
                                        <div className="text-center mb-6">
                                            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Average Velocity</div>
                                            <div className="text-4xl font-black text-slate-800 dark:text-white">{avgVelocity}</div>
                                            <div className="text-xs text-slate-400 mt-1">points / sprint</div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-sm p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <span className="text-slate-500">Last Sprint</span>
                                                <span className="font-bold dark:text-white">{velocityData[velocityData.length - 1]?.Completed || 0} pts</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <span className="text-slate-500">Best Sprint</span>
                                                <span className="font-bold text-green-600">{Math.max(...velocityData.map(d => d.Completed), 0)} pts</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* TEAM TAB (Placeholder) */}
                {activeTab === 'team' && (
                    <div className="text-center py-20 animate-in fade-in duration-300">
                        <Users size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Team Insights</h3>
                        <p className="text-slate-500 mb-6">Workload distribution and member performance metrics.</p>
                        <button onClick={() => setActiveTab('sprints')} className="text-indigo-600 font-bold hover:underline">Go to Sprint Analysis</button>
                    </div>
                )}
            </div>
        </div>
    );
};

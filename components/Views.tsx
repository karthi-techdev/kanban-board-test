
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, updateProject, inviteUser, deleteUser, updateUserRole, addNotification, deleteProject, logout, toggleTheme, updateCurrentUser } from '../store';
import { AppState, Project, User, IssueType, AuditLog } from '../types';
import { Users, Settings, Plus, CheckSquare, Layout, Calendar, Bell, X, MoreHorizontal, Shield, Globe, List, User as UserIcon, Lock, Activity, LogOut, Moon, Sun } from './Icons';
import { formatTimeAgo } from '../utils';

// --- Team View ---
export const TeamView = () => {
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app as AppState);
    const { users } = appState;
    const userList = Object.values(users) as User[];
    const [email, setEmail] = useState('');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    
    // Success Modal State
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastInvitedEmail, setLastInvitedEmail] = useState('');
    
    // Menu State
    const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenuUserId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInvite = () => {
        if (email && email.includes('@')) {
            dispatch(inviteUser(email));
            setLastInvitedEmail(email);
            setEmail('');
            setIsInviteModalOpen(false);
            dispatch(addNotification({ title: 'User Invited', message: `${email} added to workspace.`, type: 'success' }));
            setShowSuccessModal(true);
        }
    };

    const handleRemoveUser = (userId: string, userName: string) => {
        if (window.confirm(`Are you sure you want to remove ${userName} from the team?`)) {
            dispatch(deleteUser(userId));
            setActiveMenuUserId(null);
            dispatch(addNotification({ title: 'User Removed', message: `${userName} has been removed.`, type: 'info' }));
        }
    };

    const handleChangeRole = (role: 'Admin' | 'Member' | 'Viewer') => {
        if (activeMenuUserId) {
            dispatch(updateUserRole({ userId: activeMenuUserId, role }));
            setActiveMenuUserId(null);
            dispatch(addNotification({ title: 'Role Updated', message: `User role changed to ${role}.`, type: 'success' }));
        }
    };

    const getRoleBadgeColor = (role?: string) => {
        switch(role) {
            case 'Admin': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
            case 'Viewer': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
            default: return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
        }
    };

    const getStatusBadgeColor = (status?: string) => {
        switch(status) {
            case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            case 'expired': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
            default: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
        }
    };

    return (
        <div className="h-full p-10 bg-slate-50/50 dark:bg-black overflow-y-auto">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Team Members</h1>
                        <p className="text-slate-500">Manage access and roles for this project.</p>
                    </div>
                    {/* Quick Invite Bar */}
                    <div className="hidden md:flex gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                        <input 
                            type="email" 
                            placeholder="Quick invite by email..." 
                            className="bg-transparent border-none rounded-md px-4 py-2 text-sm w-64 dark:text-white focus:ring-0"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                        />
                        <button 
                            onClick={handleInvite}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md text-sm font-bold transition-colors shadow-sm"
                        >
                            Invite
                        </button>
                    </div>
                </div>

                {/* List Layout */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-visible min-h-[300px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <div className="col-span-4 pl-2">User</div>
                        <div className="col-span-3">Email</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2">Role</div>
                        <div className="col-span-1"></div>
                    </div>
                    
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {userList.map(user => (
                            <div key={user.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group relative">
                                <div className="col-span-4 flex items-center gap-4 pl-2">
                                     <div className="relative flex-shrink-0">
                                        <img src={user.avatarUrl} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover" alt={user.name} />
                                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white dark:border-slate-900 rounded-full ${user.inviteStatus === 'pending' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-sm text-slate-800 dark:text-white truncate">{user.name}</h3>
                                        <p className="text-xs text-slate-400 md:hidden truncate">{user.email}</p>
                                    </div>
                                </div>
                                <div className="col-span-3 text-sm text-slate-500 truncate hidden md:block">
                                    {user.email}
                                </div>
                                <div className="col-span-2">
                                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${getStatusBadgeColor(user.inviteStatus)}`}>
                                        {user.inviteStatus || 'Approved'}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getRoleBadgeColor(user.role)}`}>
                                        {user.role || 'Member'}
                                    </span>
                                </div>
                                <div className="col-span-1 flex justify-end relative">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setActiveMenuUserId(activeMenuUserId === user.id ? null : user.id); }}
                                        className={`p-2 rounded-lg transition-colors ${activeMenuUserId === user.id ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                    >
                                        <MoreHorizontal size={16} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {activeMenuUserId === user.id && (
                                        <div ref={menuRef} className="absolute right-0 top-10 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                            <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                                                <p className="text-xs font-bold text-slate-500 px-2 py-1 uppercase">Change Role</p>
                                                <button onClick={() => handleChangeRole('Admin')} className="w-full text-left px-2 py-1.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md">Admin</button>
                                                <button onClick={() => handleChangeRole('Member')} className="w-full text-left px-2 py-1.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md">Member</button>
                                                <button onClick={() => handleChangeRole('Viewer')} className="w-full text-left px-2 py-1.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md">Viewer</button>
                                            </div>
                                            <div className="p-2">
                                                <button 
                                                    onClick={() => handleRemoveUser(user.id, user.name)} 
                                                    className="w-full text-left px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md font-medium"
                                                >
                                                    Remove from Team
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Add Member Footer Row */}
                    <div 
                        onClick={() => setIsInviteModalOpen(true)}
                        className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors flex items-center justify-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 rounded-b-2xl"
                    >
                        <Plus size={16} />
                        <span>Add Team Member</span>
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-8 transform transition-all scale-100 border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                             <h2 className="text-2xl font-bold dark:text-white">Invite Team Member</h2>
                             <button onClick={() => setIsInviteModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <X size={20} className="text-slate-400" />
                             </button>
                        </div>
                        
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                            Add a new member to your workspace to start collaborating. They will be added immediately to this project.
                        </p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                                <input 
                                    autoFocus
                                    type="email" 
                                    placeholder="name@company.com"
                                    className="w-full bg-white border border-slate-300 dark:border-slate-600 rounded-xl p-3 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button 
                                onClick={() => setIsInviteModalOpen(false)} 
                                className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleInvite} 
                                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-500/20 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!email || !email.includes('@')}
                            >
                                Send Invitation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                 <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-700 text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckSquare size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Invite Sent Successfully</h2>
                        <p className="text-slate-500 text-sm mb-6">
                            An invitation has been sent to <span className="font-bold text-slate-800 dark:text-slate-200">{lastInvitedEmail}</span>.
                        </p>
                        <button 
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Settings View ---
export const SettingsView = () => {
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app as AppState);
    const { currentProjectId, projects, users } = appState;
    const project = projects.find(p => p.id === currentProjectId);

    const [name, setName] = useState(project?.name || '');
    const [key, setKey] = useState(project?.key || '');
    const [desc, setDesc] = useState(project?.description || '');
    const [leadId, setLeadId] = useState(project?.leadId || '');
    const [category, setCategory] = useState(project?.category || 'Software Development');
    const [visibility, setVisibility] = useState(project?.visibility || 'Private');
    
    // Settings States
    const [issueTypes, setIssueTypes] = useState(project?.enabledIssueTypes || [IssueType.TASK, IssueType.BUG]);
    const [notifications, setNotifications] = useState(project?.notificationSettings || { issueCreated: true, issueAssigned: true, comments: true, sprintUpdates: false });

    useEffect(() => {
        if (project) {
            setName(project.name);
            setKey(project.key);
            setDesc(project.description);
            setLeadId(project.leadId);
            setCategory(project.category || 'Software Development');
            setVisibility(project.visibility || 'Private');
            setIssueTypes(project.enabledIssueTypes || [IssueType.TASK]);
            setNotifications(project.notificationSettings || { issueCreated: true, issueAssigned: true, comments: true, sprintUpdates: false });
        }
    }, [project]);

    if (!project) return <div>Project not found</div>;

    const handleSave = () => {
        dispatch(updateProject({ 
            name, key, description: desc, leadId, 
            category, visibility, 
            enabledIssueTypes: issueTypes,
            notificationSettings: notifications
        }));
        dispatch(addNotification({ title: 'Settings Saved', message: 'Project configuration updated.', type: 'success' }));
    };

    const handleDeleteProject = () => {
        if (window.confirm(`Are you sure you want to delete ${project.name}? This action cannot be undone.`)) {
            dispatch(deleteProject(project.id));
            dispatch(addNotification({ title: 'Project Deleted', message: `${project.name} has been removed.`, type: 'warning' }));
        }
    };

    const toggleIssueType = (type: IssueType) => {
        setIssueTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    };

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="h-full bg-slate-50/50 dark:bg-black overflow-y-auto">
            <div className="max-w-4xl mx-auto p-10">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Project Settings</h1>
                        <p className="text-slate-500">Configuration for <span className="font-semibold text-slate-800 dark:text-slate-200">{project.name}</span></p>
                    </div>
                    <button 
                        onClick={handleSave}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
                    >
                        Save Changes
                    </button>
                </div>
                
                <div className="space-y-8">
                    {/* General Details Section */}
                    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <Settings size={20} className="text-slate-400" />
                            General Details
                        </h2>
                        
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Icon</label>
                                <div className="w-32 h-32 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 flex flex-col items-center justify-center text-4xl cursor-pointer hover:bg-indigo-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <span className="group-hover:scale-110 transition-transform duration-200">{project.icon || '🚀'}</span>
                                    <span className="text-xs text-indigo-600 dark:text-indigo-300 mt-2 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Change</span>
                                </div>
                            </div>

                            {/* Fields */}
                            <div className="flex-1 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Project Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-white p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Key</label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-white p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-mono"
                                            value={key}
                                            onChange={(e) => setKey(e.target.value)}
                                            maxLength={6}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                                        <select 
                                            className="w-full bg-white p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                        >
                                            <option>Software Development</option>
                                            <option>Marketing Campaign</option>
                                            <option>Business Operation</option>
                                            <option>Design System</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">URL</label>
                                    <div className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm font-mono border border-transparent truncate select-all">
                                        https://jira-clone.demo/projects/{key.toLowerCase()}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                                    <textarea 
                                        rows={3}
                                        className="w-full bg-white p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                                        value={desc}
                                        onChange={(e) => setDesc(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Access & Roles */}
                    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <Users size={20} className="text-slate-400" />
                            Access & Visibility
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Project Lead</label>
                                <p className="text-xs text-slate-500 mb-2">Managed the project settings and permissions.</p>
                                <select 
                                    className="w-full bg-white p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={leadId}
                                    onChange={(e) => setLeadId(e.target.value)}
                                >
                                    {Object.values(users).map((u: any) => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                             </div>
                             <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Visibility Level</label>
                                <p className="text-xs text-slate-500 mb-2">Who can view and access this project?</p>
                                <select 
                                    className="w-full bg-white p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={visibility}
                                    onChange={(e: any) => setVisibility(e.target.value)}
                                >
                                    <option value="Private">Private (Members Only)</option>
                                    <option value="Internal">Internal (Organization)</option>
                                    <option value="Public">Public (Everyone)</option>
                                </select>
                             </div>
                        </div>
                    </section>

                    {/* Issue Types */}
                    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <List size={20} className="text-slate-400" />
                            Issue Types Scheme
                        </h2>
                        <p className="text-sm text-slate-500 mb-6">Select the issue types available for this project.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {Object.values(IssueType).map(type => (
                                <div 
                                    key={type}
                                    onClick={() => toggleIssueType(type)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center gap-2 ${issueTypes.includes(type) ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-500' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${issueTypes.includes(type) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                        {issueTypes.includes(type) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                    <span className="font-bold text-sm dark:text-white">{type}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Notification Settings */}
                    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <Bell size={20} className="text-slate-400" />
                            Notifications
                        </h2>
                        <div className="space-y-4">
                            {Object.keys(notifications).map((key) => (
                                <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                                    <div>
                                        <div className="font-bold text-slate-800 dark:text-white capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                                        <div className="text-xs text-slate-500">Receive alerts when this event occurs.</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={notifications[key as keyof typeof notifications]} 
                                            onChange={() => toggleNotification(key as keyof typeof notifications)} 
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section className="rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-8">
                        <h2 className="text-lg font-bold text-red-700 dark:text-red-400 mb-6 pb-4 border-b border-red-200 dark:border-red-900/30 flex items-center gap-2">
                            <X size={20} />
                            Danger Zone
                        </h2>
                        <p className="text-sm text-red-600 dark:text-red-300 mb-6">
                            Irreversible actions for your project. Please be certain.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="px-4 py-2 bg-white dark:bg-transparent border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                Archive Project
                            </button>
                            <button 
                                onClick={handleDeleteProject}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-lg shadow-red-500/20 transition-colors"
                            >
                                Delete Project
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

// --- Profile View ---
export const ProfileView = () => {
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app as AppState);
    const { user, auditLogs, isDarkMode } = appState;
    
    const [activeTab, setActiveTab] = useState<'general' | 'security' | 'activity'>('general');
    
    // Form State
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSaveProfile = () => {
        if(user) {
            dispatch(updateCurrentUser({ name, email, avatarUrl }));
            dispatch(addNotification({ title: 'Profile Updated', message: 'Your profile details have been saved.', type: 'success' }));
        }
    };

    const handleChangePassword = () => {
        if(newPassword !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        if(newPassword.length < 6) {
            alert('Password must be at least 6 characters.');
            return;
        }
        // Mock API call
        setTimeout(() => {
            dispatch(addNotification({ title: 'Password Changed', message: 'Your password has been updated successfully.', type: 'success' }));
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }, 500);
    };

    const handleLogout = () => {
        if(window.confirm('Are you sure you want to log out?')) {
            dispatch(logout());
        }
    };

    if (!user) return <div>Please log in.</div>;

    // Filter audit logs for current user
    const userActivity = auditLogs.filter(log => log.userId === user.id);

    return (
        <div className="h-full bg-white dark:bg-black flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 p-6 flex flex-col gap-2">
                <div className="mb-6 px-2 text-center">
                    <img src={user.avatarUrl} className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-white dark:border-slate-800 shadow-md object-cover" alt={user.name} />
                    <h2 className="font-bold text-lg text-slate-800 dark:text-white">{user.name}</h2>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold rounded-full uppercase tracking-wide">{user.role}</span>
                </div>
                
                <button onClick={() => setActiveTab('general')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all w-full text-left ${activeTab === 'general' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                    <UserIcon size={18} /> General
                </button>
                <button onClick={() => setActiveTab('security')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all w-full text-left ${activeTab === 'security' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                    <Lock size={18} /> Security
                </button>
                <button onClick={() => setActiveTab('activity')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all w-full text-left ${activeTab === 'activity' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                    <Activity size={18} /> Activity
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-10">
                <div className="max-w-3xl mx-auto space-y-8">
                    
                    {activeTab === 'general' && (
                        <div className="animate-in fade-in duration-300">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">General Settings</h2>
                            
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                                    <input 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                    <input 
                                        type="email"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Avatar URL</label>
                                    <div className="flex gap-4">
                                        <img src={avatarUrl} className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700" alt="Preview" />
                                        <input 
                                            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                            value={avatarUrl}
                                            onChange={e => setAvatarUrl(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Preferences</h3>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                                            <span className="text-sm font-medium dark:text-white">Dark Mode</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={isDarkMode} onChange={() => dispatch(toggleTheme())} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button onClick={handleSaveProfile} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="animate-in fade-in duration-300">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Security</h2>
                            
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm mb-8">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Change Password</h3>
                                <div className="space-y-4 max-w-md">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
                                        <input type="password" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                                        <input type="password" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                                        <input type="password" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <button onClick={handleChangePassword} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold shadow-md transition-all active:scale-95 hover:opacity-90">
                                        Update Password
                                    </button>
                                </div>
                            </div>

                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-8 shadow-sm">
                                <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-4">Log Out</h3>
                                <p className="text-sm text-red-600 dark:text-red-300 mb-6">End your current session. You will be redirected to the login screen.</p>
                                <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95">
                                    <LogOut size={18} /> Log Out
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="animate-in fade-in duration-300">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Recent Activity</h2>
                            
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                                {userActivity.length === 0 ? (
                                    <div className="p-10 text-center text-slate-500">No recent activity found.</div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {userActivity.map(log => (
                                            <div key={log.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300">{log.action}</span>
                                                    <span className="text-xs text-slate-400">{formatTimeAgo(log.timestamp)}</span>
                                                </div>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">{log.details}</p>
                                                <div className="text-xs text-slate-400 mt-2 font-mono">IP: {log.ipAddress}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

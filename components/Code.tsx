
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, addRepository, createBranch, deleteBranch, createPullRequest, mergePullRequest, updatePullRequestStatus, addNotification, deleteRepository } from '../store';
import { AppState, Repository, Branch, Commit, PullRequest } from '../types';
import { GitBranch, Plus, Search, ChevronDown, CheckSquare, X, Shield, Globe, MoreHorizontal, Folder, FileCode, CornerUpLeft, Copy, GitCommit, Trash, CheckCircle, MessageSquare } from './Icons';
import { formatDate, formatTimeAgo } from '../utils';
import { Avatar } from './Board';

// --- Components ---

const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
        'success': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        'failed': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        'running': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        'pending': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        'OPEN': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        'MERGED': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        'DECLINED': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${colors[status as keyof typeof colors] || colors['pending']}`}>
            {status}
        </span>
    );
};

// --- Mock File System ---
const MOCK_FILES = {
    name: 'root', type: 'folder', children: [
        { name: 'src', type: 'folder', children: [
            { name: 'components', type: 'folder', children: [
                { name: 'Button.tsx', type: 'file', size: '1.2kb' },
                { name: 'Header.tsx', type: 'file', size: '2.4kb' },
                { name: 'Layout.tsx', type: 'file', size: '1.8kb' },
                { name: 'Icons.tsx', type: 'file', size: '8.5kb' }
            ]},
            { name: 'utils', type: 'folder', children: [
                { name: 'helpers.ts', type: 'file', size: '0.5kb' },
                { name: 'api.ts', type: 'file', size: '1.1kb' }
            ]},
            { name: 'App.tsx', type: 'file', size: '3.1kb' },
            { name: 'index.tsx', type: 'file', size: '0.8kb' },
            { name: 'types.ts', type: 'file', size: '4.2kb' }
        ]},
        { name: 'public', type: 'folder', children: [
            { name: 'index.html', type: 'file', size: '1.5kb' },
            { name: 'favicon.ico', type: 'file', size: '5kb' },
            { name: 'manifest.json', type: 'file', size: '0.5kb' }
        ]},
        { name: 'package.json', type: 'file', size: '1.2kb' },
        { name: 'README.md', type: 'file', size: '4.5kb' },
        { name: '.gitignore', type: 'file', size: '0.2kb' },
        { name: 'tsconfig.json', type: 'file', size: '0.8kb' }
    ]
};

// --- PR Details Modal ---
const PRDetailsModal = ({ pr, onClose }: { pr: PullRequest, onClose: () => void }) => {
    const dispatch = useDispatch();
    const [comment, setComment] = useState('');
    const [timeline, setTimeline] = useState([
        { id: '1', type: 'comment', author: 'System', content: `created this pull request from ${pr.sourceBranch}`, date: pr.createdAt },
        { id: '2', type: 'check', status: 'running', text: 'Continuous Integration / build', date: new Date(new Date(pr.createdAt).getTime() + 5000).toISOString() }
    ]);

    const handleMerge = () => {
        if(window.confirm('Merge this pull request?')) {
            dispatch(mergePullRequest(pr.id));
            dispatch(addNotification({ title: 'Merged', message: `PR #${pr.id} merged successfully.`, type: 'success' }));
            onClose();
        }
    };

    const handleDecline = () => {
        if(window.confirm('Decline this pull request?')) {
            dispatch(updatePullRequestStatus({ id: pr.id, status: 'DECLINED' }));
            dispatch(addNotification({ title: 'Declined', message: `PR #${pr.id} declined.`, type: 'info' }));
            onClose();
        }
    };

    const handlePostComment = () => {
        if(!comment.trim()) return;
        setTimeline([...timeline, { id: Date.now().toString(), type: 'comment', author: 'You', content: comment, date: new Date().toISOString() }]);
        setComment('');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-white dark:bg-slate-900">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-slate-500 font-mono text-lg">#{pr.id}</span>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{pr.title}</h2>
                            <StatusBadge status={pr.status} />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{pr.author}</span> wants to merge 
                            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs mx-1">{pr.sourceBranch}</span>
                            into
                            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs mx-1">{pr.targetBranch}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500"><X size={20}/></button>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/50">
                        {/* Timeline */}
                        <div className="space-y-6">
                            {timeline.map((item: any) => (
                                <div key={item.id} className="flex gap-4">
                                    {item.type === 'comment' ? (
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 text-xs font-bold flex-shrink-0">
                                            {item.author[0]}
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                                            {item.status === 'success' ? <CheckCircle size={16} className="text-green-500"/> : <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="font-bold text-sm text-slate-800 dark:text-white">{item.author || 'System'}</span>
                                            <span className="text-xs text-slate-500">{formatTimeAgo(item.date)}</span>
                                        </div>
                                        <div className={`text-sm text-slate-600 dark:text-slate-300 ${item.type === 'check' ? 'font-mono text-xs' : ''}`}>
                                            {item.content || item.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Comment Box */}
                        {pr.status === 'OPEN' && (
                            <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
                                <textarea 
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    rows={3}
                                    placeholder="Leave a comment..."
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                />
                                <div className="flex justify-end mt-2">
                                    <button 
                                        onClick={handlePostComment}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700"
                                    >
                                        Comment
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="w-72 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 overflow-y-auto hidden md:block">
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Reviewers</h4>
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <span className="w-6 h-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center"><Plus size={12}/></span>
                                    Add reviewers
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Status Checks</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle size={14} className="text-green-500" />
                                        <span className="text-slate-700 dark:text-slate-300">Build / test</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle size={14} className="text-green-500" />
                                        <span className="text-slate-700 dark:text-slate-300">Linting</span>
                                    </div>
                                </div>
                            </div>

                            {pr.status === 'OPEN' && (
                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                    <button onClick={handleMerge} className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm transition-colors">
                                        Merge Pull Request
                                    </button>
                                    <button onClick={handleDecline} className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-300 hover:text-red-600 font-bold rounded-lg text-sm transition-colors">
                                        Decline
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CodeView = () => {
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app as AppState);
    const { currentProjectId, repositories, branches, commits, pullRequests } = appState;
    
    const projectRepos = Object.values(repositories).filter(r => r.projectId === currentProjectId);
    const [selectedRepoId, setSelectedRepoId] = useState<string>(projectRepos[0]?.id || '');
    const [activeTab, setActiveTab] = useState<'source' | 'commits' | 'branches' | 'prs'>('source');
    
    // Source Browser State
    const [currentPath, setCurrentPath] = useState<string[]>([]);
    
    // Modals
    const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
    const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
    const [isPRModalOpen, setIsPRModalOpen] = useState(false);
    const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null);

    // Menu State
    const [activeBranchMenu, setActiveBranchMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Derived Data
    const currentBranches = Object.values(branches).filter(b => b.repositoryId === selectedRepoId);
    const currentCommits = Object.values(commits).filter(c => c.repositoryId === selectedRepoId).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const currentPRs = Object.values(pullRequests).filter(pr => pr.repositoryId === selectedRepoId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Update selected repo if current becomes invalid
    useEffect(() => {
        if (!repositories[selectedRepoId] && projectRepos.length > 0) {
            setSelectedRepoId(projectRepos[0].id);
        }
    }, [repositories, selectedRepoId, projectRepos]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveBranchMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // ... Handlers (Add Repo, Create Branch, etc.) are same as before, adding delete repo
    const handleAddRepo = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        dispatch(addRepository({
            name: formData.get('name') as string,
            url: formData.get('url') as string,
            provider: formData.get('provider') as any
        }));
        setIsRepoModalOpen(false);
        dispatch(addNotification({ title: 'Repository Added', message: 'Successfully connected new repository.', type: 'success' }));
    };

    const handleDeleteRepo = () => {
        if(window.confirm('Are you sure you want to delete this repository? This will delete all associated branches, commits, and pull requests.')) {
            dispatch(deleteRepository(selectedRepoId));
            dispatch(addNotification({ title: 'Repository Deleted', message: 'Repository removed successfully.', type: 'warning' }));
        }
    };

    const handleCreateBranch = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        dispatch(createBranch({
            repoId: selectedRepoId,
            name: formData.get('name') as string,
            source: formData.get('source') as string
        }));
        setIsBranchModalOpen(false);
        dispatch(addNotification({ title: 'Branch Created', message: 'New branch created successfully.', type: 'success' }));
    };

    const handleDeleteBranch = (id: string) => {
        if(window.confirm('Are you sure you want to delete this branch?')) {
            dispatch(deleteBranch(id));
            dispatch(addNotification({ title: 'Branch Deleted', message: 'Branch removed successfully.', type: 'success' }));
            setActiveBranchMenu(null);
        }
    };

    const handleCreatePR = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        dispatch(createPullRequest({
            repoId: selectedRepoId,
            title: formData.get('title') as string,
            source: formData.get('source') as string,
            target: formData.get('target') as string
        }));
        setIsPRModalOpen(false);
        dispatch(addNotification({ title: 'Pull Request Created', message: 'PR created and ready for review.', type: 'success' }));
    };

    const handleCopyBranch = (name: string) => {
        navigator.clipboard.writeText(name);
        dispatch(addNotification({ title: 'Copied', message: 'Branch name copied to clipboard.', type: 'success' }));
        setActiveBranchMenu(null);
    };

    // --- Source Browser Logic ---
    const getCurrentFiles = () => {
        let current: any = MOCK_FILES;
        for (const folder of currentPath) {
            if (current.children) {
                current = current.children.find((c: any) => c.name === folder);
            }
        }
        return current?.children || [];
    };

    if (projectRepos.length === 0 && !isRepoModalOpen) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-400">
                    <GitBranch size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No Repositories Connected</h2>
                <p className="text-slate-500 max-w-md mb-8">Connect your Git repositories to track branches, commits, and pull requests directly within your project.</p>
                <button onClick={() => setIsRepoModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20">
                    Connect Repository
                </button>
                {isRepoModalOpen && <RepoModal onClose={() => setIsRepoModalOpen(false)} onSubmit={handleAddRepo} />}
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white dark:bg-black overflow-hidden">
             {/* Header */}
             <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Code</h1>
                        <p className="text-sm text-slate-500">Manage repositories and development workflow.</p>
                    </div>
                    {/* Repo Selector */}
                    <div className="relative group">
                        <select 
                            className="appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2 pl-4 pr-10 rounded-lg font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                            value={selectedRepoId}
                            onChange={(e) => { setSelectedRepoId(e.target.value); setCurrentPath([]); }}
                        >
                            {projectRepos.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleDeleteRepo} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete Repository">
                        <Trash size={18}/>
                    </button>
                    <button onClick={() => setIsRepoModalOpen(true)} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm">
                        Add Repo
                    </button>
                    <button 
                        onClick={() => {
                            if (activeTab === 'branches') setIsBranchModalOpen(true);
                            else if (activeTab === 'prs') setIsPRModalOpen(true);
                            else alert('Select Branches or Pull Requests tab to create new items.');
                        }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-md transition-all active:scale-95"
                    >
                        <Plus size={16} /> 
                        {activeTab === 'branches' ? 'Create Branch' : activeTab === 'prs' ? 'Create PR' : 'Create'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-8 pt-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-6">
                {['source', 'commits', 'branches', 'prs'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`pb-3 text-sm font-bold capitalize border-b-2 transition-colors ${activeTab === tab ? 'text-indigo-600 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'text-slate-500 border-transparent hover:text-slate-800 dark:hover:text-slate-200'}`}
                    >
                        {tab === 'prs' ? 'Pull Requests' : tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                
                {/* SOURCE TAB */}
                {activeTab === 'source' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                        {/* Breadcrumbs */}
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2 text-sm text-slate-500 font-mono">
                             <span className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setCurrentPath([])}>{repositories[selectedRepoId]?.name}</span>
                             {currentPath.length > 0 && <span className="text-slate-300">/</span>}
                             {currentPath.map((folder, idx) => (
                                 <React.Fragment key={folder}>
                                     <span 
                                        className={`cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 ${idx === currentPath.length - 1 ? 'font-bold text-slate-800 dark:text-white' : ''}`}
                                        onClick={() => setCurrentPath(currentPath.slice(0, idx + 1))}
                                     >
                                         {folder}
                                     </span>
                                     {idx < currentPath.length - 1 && <span className="text-slate-300">/</span>}
                                 </React.Fragment>
                             ))}
                        </div>
                        
                        {/* File List */}
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                             {currentPath.length > 0 && (
                                 <div 
                                    className="p-3 px-6 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer text-indigo-600"
                                    onClick={() => setCurrentPath(currentPath.slice(0, -1))}
                                 >
                                     <CornerUpLeft size={16} />
                                     <span className="text-sm font-bold">..</span>
                                 </div>
                             )}
                             
                             {getCurrentFiles().map((file: any) => (
                                 <div 
                                    key={file.name} 
                                    className="p-3 px-6 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                                    onClick={() => file.type === 'folder' ? setCurrentPath([...currentPath, file.name]) : alert(`Opening ${file.name}... (Mock Preview)`)}
                                 >
                                     <span className="text-slate-400 group-hover:text-indigo-500">
                                         {file.type === 'folder' ? <Folder size={18} fill="currentColor" className="text-indigo-100 dark:text-slate-700" stroke="currentColor" /> : <FileCode size={18} />}
                                     </span>
                                     <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{file.name}</span>
                                     {file.type === 'file' && <span className="ml-auto text-xs text-slate-400 font-mono">{file.size}</span>}
                                 </div>
                             ))}
                             {getCurrentFiles().length === 0 && (
                                 <div className="p-8 text-center text-slate-400 text-sm italic">Empty directory</div>
                             )}
                        </div>
                    </div>
                )}

                {/* COMMITS TAB */}
                {activeTab === 'commits' && (
                    <div className="space-y-4 relative">
                        {/* Timeline line */}
                        <div className="absolute left-6 top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-800"></div>
                        
                        {currentCommits.map(commit => (
                            <div key={commit.id} className="flex gap-6 items-start relative z-10 group">
                                <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400 group-hover:border-indigo-500 group-hover:text-indigo-500 transition-colors">
                                    <GitCommit size={20} />
                                </div>
                                <div className="flex-1 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-white text-sm">{commit.message}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-slate-500">Authored by <span className="font-semibold text-slate-700 dark:text-slate-300">{commit.author}</span></span>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-xs text-slate-500">{formatTimeAgo(commit.timestamp)}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                {commit.id.substring(0,7)}
                                            </div>
                                            <StatusBadge status={commit.status} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-800 text-slate-500 w-fit mt-2">
                                        <GitBranch size={12}/> {commit.branch}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* BRANCHES TAB */}
                {activeTab === 'branches' && (
                     <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-visible">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Last Commit</th>
                                    <th className="px-6 py-3">Updated</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {currentBranches.map(branch => (
                                    <tr key={branch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <GitBranch size={16} className="text-slate-400 group-hover:text-indigo-500" />
                                                <span className="font-bold text-sm text-slate-800 dark:text-white">{branch.name}</span>
                                                {branch.name === 'main' && <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 rounded-full text-slate-600 dark:text-slate-300">Default</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-xs">
                                                <div className="h-1.5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                                                    <div className="h-full bg-green-500" style={{width: `${branch.ahead > 0 ? (branch.ahead / (branch.ahead + branch.behind + 1)) * 100 : 0}%`}}></div>
                                                    <div className="h-full bg-red-500" style={{width: `${branch.behind > 0 ? (branch.behind / (branch.ahead + branch.behind + 1)) * 100 : 0}%`}}></div>
                                                </div>
                                                <span className="text-slate-400 ml-2 whitespace-nowrap">{branch.ahead} ahead, {branch.behind} behind</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-slate-500 bg-transparent">
                                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{branch.lastCommit.substring(0,7)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500">{formatTimeAgo(branch.updatedAt)}</td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setActiveBranchMenu(activeBranchMenu === branch.id ? null : branch.id); }}
                                                className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                                            >
                                                <MoreHorizontal size={16}/>
                                            </button>
                                            
                                            {/* Dropdown Menu */}
                                            {activeBranchMenu === branch.id && (
                                                <div ref={menuRef} className="absolute right-8 top-8 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden text-left">
                                                    <button onClick={() => handleCopyBranch(branch.name)} className="w-full text-left px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium flex items-center gap-2">
                                                        <Copy size={14}/> Copy Name
                                                    </button>
                                                    <button onClick={() => { setIsPRModalOpen(true); setActiveBranchMenu(null); }} className="w-full text-left px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium flex items-center gap-2">
                                                        <GitBranch size={14}/> New Pull Request
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteBranch(branch.id)}
                                                        className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors border-t border-slate-50 dark:border-slate-700 flex items-center gap-2"
                                                    >
                                                        <Trash size={14}/> Delete Branch
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                )}

                {/* PULL REQUESTS TAB */}
                {activeTab === 'prs' && (
                    <div className="space-y-4">
                        {currentPRs.length === 0 && <div className="text-center py-10 text-slate-500">No pull requests found.</div>}
                        {currentPRs.map(pr => (
                            <div key={pr.id} onClick={() => setSelectedPR(pr)} className="flex gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm cursor-pointer group">
                                <div className="pt-1">
                                    <GitBranch size={20} className={pr.status === 'MERGED' ? 'text-purple-500' : pr.status === 'DECLINED' ? 'text-red-500' : 'text-green-500'} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">{pr.title}</h3>
                                        <StatusBadge status={pr.status} />
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                                        <span className="font-mono text-xs">#{pr.id}</span>
                                        <span>opened by <span className="font-semibold text-slate-700 dark:text-slate-300">{pr.author}</span></span>
                                        <span>•</span>
                                        <span>{formatTimeAgo(pr.createdAt)}</span>
                                        <span className="mx-2 text-slate-300">|</span>
                                        <span className="flex items-center gap-1 font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                            {pr.sourceBranch} <span className="text-slate-400">→</span> {pr.targetBranch}
                                        </span>
                                    </div>
                                    {pr.status === 'OPEN' && (
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="text-xs text-slate-400 flex items-center gap-1">
                                                <CheckSquare size={12} className="text-green-500" />
                                                No conflicts
                                            </div>
                                            <div className="text-xs text-slate-400 flex items-center gap-1">
                                                <MessageSquare size={12} />
                                                0 comments
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {isRepoModalOpen && <RepoModal onClose={() => setIsRepoModalOpen(false)} onSubmit={handleAddRepo} />}
            {isBranchModalOpen && <BranchModal branches={currentBranches} onClose={() => setIsBranchModalOpen(false)} onSubmit={handleCreateBranch} />}
            {isPRModalOpen && <PRModal branches={currentBranches} onClose={() => setIsPRModalOpen(false)} onSubmit={handleCreatePR} />}
            {selectedPR && <PRDetailsModal pr={selectedPR} onClose={() => setSelectedPR(null)} />}
        </div>
    );
};

// --- Modal Subcomponents (Same as before, reused) ---

const RepoModal = ({ onClose, onSubmit }: any) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-6 dark:text-white">Connect Repository</h2>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Provider</label>
                    <select name="provider" className="w-full bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none">
                        <option value="github">GitHub</option>
                        <option value="gitlab">GitLab</option>
                        <option value="bitbucket">Bitbucket</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Repository Name</label>
                    <input name="name" required className="w-full bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none" placeholder="e.g. jira-clone" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">URL</label>
                    <input name="url" required className="w-full bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none" placeholder="https://github.com/..." />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Connect</button>
                </div>
            </form>
        </div>
    </div>
);

const BranchModal = ({ branches, onClose, onSubmit }: any) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-6 dark:text-white">Create Branch</h2>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Source Branch</label>
                    <select name="source" className="w-full bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none">
                        {branches.map((b: any) => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Branch Name</label>
                    <input name="name" required className="w-full bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none" placeholder="feature/new-feature" />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Create</button>
                </div>
            </form>
        </div>
    </div>
);

const PRModal = ({ branches, onClose, onSubmit }: any) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-6 dark:text-white">Create Pull Request</h2>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
                    <input name="title" required className="w-full bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none" placeholder="e.g. Fix login bug" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Source</label>
                        <select name="source" className="w-full bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none">
                             {branches.map((b: any) => <option key={b.id} value={b.name}>{b.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target</label>
                        <select name="target" className="w-full bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none">
                             {branches.map((b: any) => <option key={b.id} value={b.name}>{b.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Create PR</button>
                </div>
            </form>
        </div>
    </div>
);

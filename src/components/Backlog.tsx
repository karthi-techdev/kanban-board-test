
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, reorderIssue, createSprint, startSprint, completeSprint, createIssue, deleteIssue, deleteSprint, editSprint } from '../store';
import { AppState, Issue, Sprint, IssueType, Priority } from '../types';
import { Plus, ChevronDown, MoreHorizontal, Calendar, X } from './Icons';
import { formatDate } from '../utils';

// --- Start Sprint Modal ---
const StartSprintModal = ({ sprint, onClose }: { sprint: Sprint; onClose: () => void }) => {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    // Default 2 weeks duration
    const [endDate, setEndDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [goal, setGoal] = useState(sprint.goal || '');

    const handleStart = () => {
        dispatch(startSprint({
            sprintId: sprint.id,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            goal
        }));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold dark:text-white">Start Sprint: {sprint.name}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Issues will be included in this sprint.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                            <input type="date" className="w-full bg-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 dark:bg-slate-700 dark:text-white outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Date</label>
                            <input type="date" className="w-full bg-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 dark:bg-slate-700 dark:text-white outline-none" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sprint Goal</label>
                        <textarea 
                            className="w-full bg-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 dark:bg-slate-700 dark:text-white outline-none" 
                            rows={3} 
                            placeholder="What do we want to achieve in this sprint?"
                            value={goal} 
                            onChange={e => setGoal(e.target.value)} 
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-bold">Cancel</button>
                    <button onClick={handleStart} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md">Start Sprint</button>
                </div>
            </div>
        </div>
    );
}

// --- Edit Sprint Modal ---
const EditSprintModal = ({ sprint, onClose }: { sprint: Sprint; onClose: () => void }) => {
    const dispatch = useDispatch();
    const [name, setName] = useState(sprint.name);
    const [startDate, setStartDate] = useState(sprint.startDate ? sprint.startDate.split('T')[0] : '');
    const [endDate, setEndDate] = useState(sprint.endDate ? sprint.endDate.split('T')[0] : '');
    const [goal, setGoal] = useState(sprint.goal || '');

    const handleSave = () => {
        dispatch(editSprint({
            sprintId: sprint.id,
            name,
            startDate: startDate ? new Date(startDate).toISOString() : null,
            endDate: endDate ? new Date(endDate).toISOString() : null,
            goal
        }));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold dark:text-white">Edit Sprint</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sprint Name</label>
                        <input className="w-full bg-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 dark:bg-slate-700 dark:text-white outline-none" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                            <input type="date" className="w-full bg-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 dark:bg-slate-700 dark:text-white outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Date</label>
                            <input type="date" className="w-full bg-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 dark:bg-slate-700 dark:text-white outline-none" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sprint Goal</label>
                        <textarea className="w-full bg-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 dark:bg-slate-700 dark:text-white outline-none" rows={3} value={goal} onChange={e => setGoal(e.target.value)} />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-bold">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md">Update Sprint</button>
                </div>
            </div>
        </div>
    );
};

// --- Sub-components ---

interface IssueRowProps {
    issue: Issue;
    index: number;
    totalIssues: number;
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDrop: (e: React.DragEvent, targetIssue: Issue) => void;
}

const IssueRow: React.FC<IssueRowProps> = ({ issue, index, totalIssues, onDragStart, onDrop }) => {
    const dispatch = useDispatch();
    const [isDragOver, setIsDragOver] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const priorityColor = {
        [Priority.LOW]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200',
        [Priority.MEDIUM]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200',
        [Priority.HIGH]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-200',
        [Priority.URGENT]: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200',
    }[issue.priority];

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDropInternal = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent bubble to sprint container
        setIsDragOver(false);
        onDrop(e, issue);
    };

    const handleDelete = () => {
        if(window.confirm('Are you sure you want to delete this issue?')) {
            dispatch(deleteIssue(issue.id));
        }
        setIsMenuOpen(false);
    }

    return (
        <div 
            draggable
            onDragStart={(e) => onDragStart(e, issue.id)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDropInternal}
            className={`
                flex items-center gap-4 p-3 bg-white dark:bg-slate-800 border transition-all group cursor-grab active:cursor-grabbing rounded-md mb-1 relative
                ${isDragOver 
                    ? 'border-indigo-500 border-t-4 shadow-md' 
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm hover:shadow-md'}
            `}
        >
            <div className="text-slate-300 group-hover:text-slate-500 cursor-move">
                <div className="grid grid-cols-2 gap-0.5 w-3 h-4">
                    <div className="bg-current rounded-full w-0.5 h-0.5"></div>
                    <div className="bg-current rounded-full w-0.5 h-0.5"></div>
                    <div className="bg-current rounded-full w-0.5 h-0.5"></div>
                    <div className="bg-current rounded-full w-0.5 h-0.5"></div>
                    <div className="bg-current rounded-full w-0.5 h-0.5"></div>
                    <div className="bg-current rounded-full w-0.5 h-0.5"></div>
                </div>
            </div>
            <div className="flex-1 flex items-center gap-4 min-w-0">
                <span className="text-slate-400 font-mono text-xs w-12 flex-shrink-0">{issue.id}</span>
                <span className="text-slate-800 dark:text-slate-200 text-sm font-medium truncate">{issue.title}</span>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0 relative">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${priorityColor}`}>{issue.priority}</span>
                <div className="flex items-center gap-1 text-slate-400">
                    {issue.assigneeIds.length > 0 ? (
                         <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                            {issue.assigneeIds.length}
                         </div>
                    ) : (
                        <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 dark:border-slate-600"></div>
                    )}
                </div>
                
                <div ref={menuRef} className="relative">
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <MoreHorizontal size={16} />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 top-8 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                            <button onClick={handleDelete} className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium">Delete</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface SprintSectionProps { 
    sprint: Sprint; 
    issues: Issue[]; 
    onDropSprint: (e: React.DragEvent, sprintId: string) => void; 
    onDropIssue: (e: React.DragEvent, targetIssue: Issue, sprintId: string) => void;
    onDragStart: (e: React.DragEvent, id: string) => void;
}

const SprintSection: React.FC<SprintSectionProps> = ({ 
    sprint, 
    issues, 
    onDropSprint, 
    onDropIssue,
    onDragStart
}) => {
    const dispatch = useDispatch();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isStartModalOpen, setIsStartModalOpen] = useState(false);
    
    // Inline edit state
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(sprint.name);
    
    const menuRef = useRef<HTMLDivElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);

    const isFuture = sprint.status !== 'active' && sprint.status !== 'completed';
    const isActive = sprint.status === 'active';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isEditingName && nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, [isEditingName]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }

    const handleDragLeave = () => {
        setIsDragOver(false);
    }

    const handleDropInternal = (e: React.DragEvent) => {
        setIsDragOver(false);
        onDropSprint(e, sprint.id);
    }

    const handleDeleteSprint = () => {
        if(window.confirm('Are you sure you want to delete this sprint? All issues will be moved to the backlog.')) {
            dispatch(deleteSprint(sprint.id));
        }
    }

    const handleNameSave = () => {
        setIsEditingName(false);
        if (tempName.trim() !== sprint.name) {
             dispatch(editSprint({
                sprintId: sprint.id,
                name: tempName,
                startDate: sprint.startDate,
                endDate: sprint.endDate,
                goal: sprint.goal
            }));
        }
    }

    return (
        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDropInternal}
            className={`rounded-xl border transition-all mb-6 overflow-hidden
                ${isDragOver 
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-500/20' 
                : 'bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}
            `}
        >
            <div className="p-4 flex items-center justify-between bg-slate-100/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3 select-none">
                    <div className={`cursor-pointer transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} onClick={() => setIsExpanded(!isExpanded)}>
                        <ChevronDown size={18} className="text-slate-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                             {isEditingName ? (
                                <input 
                                    ref={nameInputRef}
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    onBlur={handleNameSave}
                                    onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                                    className="font-bold text-sm bg-white dark:bg-slate-700 border border-indigo-500 rounded px-2 py-0.5 outline-none"
                                />
                             ) : (
                                <h3 
                                    className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2 cursor-pointer hover:text-indigo-600"
                                    onClick={() => { setTempName(sprint.name); setIsEditingName(true); }}
                                    title="Click to edit name"
                                >
                                    {sprint.name} 
                                </h3>
                             )}
                            {isActive && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">Active</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            {sprint.startDate && sprint.endDate ? (
                                <span>{formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}</span>
                            ) : (
                                <span>No dates set</span>
                            )}
                            <span>•</span>
                            <span>{issues.length} issues</span>
                            {sprint.goal && <span className="hidden sm:inline">• {sprint.goal}</span>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isActive ? (
                         <div className="px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded-lg flex items-center gap-1">
                            Running
                         </div>
                    ) : (
                        <button 
                            onClick={() => setIsStartModalOpen(true)} 
                            className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                            Start Sprint
                        </button>
                    )}
                    
                    <div ref={menuRef} className="relative">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <MoreHorizontal size={16} className="text-slate-500"/>
                        </button>
                        {isMenuOpen && (
                             <div className="absolute right-0 top-8 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                <button 
                                    onClick={() => { setIsEditModalOpen(true); setIsMenuOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium"
                                >
                                    Edit Sprint
                                </button>
                                <button 
                                    onClick={handleDeleteSprint}
                                    className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium border-t border-slate-50 dark:border-slate-700"
                                >
                                    Delete Sprint
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {isExpanded && (
                <div className="p-3 min-h-[60px]">
                    {issues.length === 0 && (
                        <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                            Drag issues here to plan this sprint
                        </div>
                    )}
                    <div className="space-y-1">
                        {issues.map((i, idx) => (
                            <IssueRow 
                                key={i.id} 
                                index={idx}
                                totalIssues={issues.length}
                                issue={i} 
                                onDragStart={onDragStart} 
                                onDrop={(e, target) => onDropIssue(e, target, sprint.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {isEditModalOpen && <EditSprintModal sprint={sprint} onClose={() => setIsEditModalOpen(false)} />}
            {isStartModalOpen && <StartSprintModal sprint={sprint} onClose={() => setIsStartModalOpen(false)} />}
        </div>
    );
};

export const BacklogView = () => {
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app as AppState);
    const { currentProjectId, sprints, issues } = appState;
    
    // Filter issues by project
    const projectIssues = (Object.values(issues) as Issue[]).filter(i => i.projectId === currentProjectId);
    
    // Sprints - Exclude completed
    const projectSprints = (Object.values(sprints) as Sprint[])
        .filter(s => s.projectId === currentProjectId && s.status !== 'completed');
    
    // Sort issues by order
    projectIssues.sort((a, b) => a.order - b.order);

    // State for quick create
    const [quickCreateTitle, setQuickCreateTitle] = useState('');
    const [isBacklogDragOver, setIsBacklogDragOver] = useState(false);

    const handleDragStart = (e: React.DragEvent, issueId: string) => {
        e.dataTransfer.setData('text/plain', issueId);
    };

    // Drop on Sprint Header/Container (Append to end)
    const handleDropSprint = (e: React.DragEvent, sprintId: string) => {
        e.preventDefault();
        const issueId = e.dataTransfer.getData('text/plain');
        if (issueId) {
             dispatch(reorderIssue({ 
                issueId, 
                newSprintId: sprintId, 
                targetIssueId: null, // End of list
                isSprintUpdate: true 
            }));
        }
    };

    // Drop on specific Issue in Sprint (Insert before)
    const handleDropSprintIssue = (e: React.DragEvent, targetIssue: Issue, sprintId: string) => {
        e.stopPropagation();
        const issueId = e.dataTransfer.getData('text/plain');
        if (issueId && issueId !== targetIssue.id) {
             dispatch(reorderIssue({ 
                issueId, 
                newSprintId: sprintId, 
                targetIssueId: targetIssue.id,
                isSprintUpdate: true 
            }));
        }
    };

    // Drop on Backlog Container (Append to end)
    const handleDropBacklog = (e: React.DragEvent) => {
        e.preventDefault();
        setIsBacklogDragOver(false);
        const issueId = e.dataTransfer.getData('text/plain');
        if (issueId) {
            dispatch(reorderIssue({ 
                issueId, 
                newSprintId: undefined, 
                targetIssueId: null, 
                isSprintUpdate: true 
            }));
        }
    };

    // Drop on specific Issue in Backlog (Insert before)
    const handleDropBacklogIssue = (e: React.DragEvent, targetIssue: Issue) => {
        const issueId = e.dataTransfer.getData('text/plain');
        if (issueId && issueId !== targetIssue.id) {
            dispatch(reorderIssue({ 
                issueId, 
                newSprintId: undefined, 
                targetIssueId: targetIssue.id,
                isSprintUpdate: true 
            }));
        }
    };

    const handleQuickCreate = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && quickCreateTitle.trim()) {
            dispatch(createIssue({
                title: quickCreateTitle,
                description: '',
                type: IssueType.STORY,
                priority: Priority.MEDIUM,
                statusId: 'c1',
                assigneeIds: [],
                sprintId: undefined // To Backlog
            }));
            setQuickCreateTitle('');
        }
    };

    const backlogIssues = projectIssues.filter(i => !i.sprintId);

    return (
        <div className="h-full flex flex-col bg-white dark:bg-black overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-20">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Backlog</h1>
                    <p className="text-slate-500 text-sm mt-1">Plan sprints and manage your product backlog.</p>
                </div>
                <button 
                    onClick={() => dispatch(createSprint())}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors"
                >
                    Create Sprint
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-5xl mx-auto">
                    {/* Sprints */}
                    <div className="mb-10">
                        {projectSprints.map(sprint => (
                            <SprintSection 
                                key={sprint.id} 
                                sprint={sprint} 
                                issues={projectIssues.filter(i => i.sprintId === sprint.id)}
                                onDragStart={handleDragStart}
                                onDropSprint={handleDropSprint}
                                onDropIssue={handleDropSprintIssue}
                            />
                        ))}
                    </div>

                    {/* Backlog */}
                    <div 
                        onDragOver={(e) => { e.preventDefault(); setIsBacklogDragOver(true); }}
                        onDragLeave={() => setIsBacklogDragOver(false)}
                        onDrop={handleDropBacklog}
                        className={`rounded-xl border transition-all duration-200
                            ${isBacklogDragOver 
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-400 ring-2 ring-indigo-500/20' 
                            : 'bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}
                        `}
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur z-10 rounded-t-xl">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Backlog</h3>
                                <span className="text-xs text-slate-400 font-mono">({backlogIssues.length} issues)</span>
                            </div>
                        </div>
                        <div className="p-3 min-h-[100px]">
                            {backlogIssues.map((issue, idx) => (
                                <IssueRow 
                                    key={issue.id} 
                                    index={idx}
                                    totalIssues={backlogIssues.length}
                                    issue={issue} 
                                    onDragStart={handleDragStart}
                                    onDrop={handleDropBacklogIssue}
                                />
                            ))}
                            
                            {/* Quick Create */}
                            <div className="mt-2">
                                <div className="flex items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-transparent hover:border-indigo-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900 transition-all shadow-sm group">
                                    <Plus size={18} className="text-slate-400 mr-3 group-focus-within:text-indigo-500" />
                                    <input 
                                        type="text" 
                                        placeholder="Create issue..." 
                                        className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-700 dark:text-white placeholder-slate-400 font-medium"
                                        value={quickCreateTitle}
                                        onChange={(e) => setQuickCreateTitle(e.target.value)}
                                        onKeyDown={handleQuickCreate}
                                    />
                                </div>
                                <div className="text-xs text-slate-400 mt-2 ml-2">Press <kbd className="font-mono bg-slate-100 dark:bg-slate-700 px-1 rounded">Enter</kbd> to create</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

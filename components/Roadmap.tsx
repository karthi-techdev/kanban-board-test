
import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, createIssue, updateIssue, deleteIssue } from '../store';
import { AppState, Issue, IssueType, Priority } from '../types';
import { formatDate } from '../utils';
import { Plus, ChevronLeft, ChevronRight, Calendar, X } from './Icons';

// Helper to get days in month
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

// Modal for Creating Epic
const CreateEpicModal = ({ onClose }: { onClose: () => void }) => {
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0]);

    const handleCreate = () => {
        if (!title.trim()) return;
        dispatch(createIssue({
            title,
            description,
            type: IssueType.EPIC,
            priority: Priority.MEDIUM,
            statusId: 'c1', // Todo column default
            assigneeIds: [],
            startDate: new Date(startDate).toISOString(),
            dueDate: new Date(dueDate).toISOString()
        }));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white">Create Epic</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Epic Name</label>
                        <input className="w-full bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500" value={title} onChange={e => setTitle(e.target.value)} autoFocus placeholder="e.g. Q3 Marketing Launch"/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                        <textarea className="w-full bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this epic about?"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                            <input type="date" className="w-full bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
                            <input type="date" className="w-full bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                    <button onClick={handleCreate} className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-md">Create Epic</button>
                </div>
            </div>
        </div>
    );
};

// Modal for Editing Epic
const EditEpicModal = ({ epic, onClose }: { epic: Issue, onClose: () => void }) => {
    const dispatch = useDispatch();
    const [title, setTitle] = useState(epic.title);
    const [description, setDescription] = useState(epic.description);
    const [startDate, setStartDate] = useState(epic.startDate ? epic.startDate.split('T')[0] : new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(epic.dueDate ? epic.dueDate.split('T')[0] : new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]);

    const handleSave = () => {
        dispatch(updateIssue({
            id: epic.id,
            title,
            description,
            startDate: new Date(startDate).toISOString(),
            dueDate: new Date(dueDate).toISOString()
        }));
        onClose();
    };

    const handleDelete = () => {
        if(window.confirm('Delete this Epic?')) {
            dispatch(deleteIssue(epic.id));
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white">Edit Epic</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Epic Name</label>
                        <input className="w-full bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500" value={title} onChange={e => setTitle(e.target.value)}/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                        <textarea className="w-full bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500" rows={3} value={description} onChange={e => setDescription(e.target.value)}/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                            <input type="date" className="w-full bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
                            <input type="date" className="w-full bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between mt-8 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button onClick={handleDelete} className="text-red-500 text-sm font-bold hover:underline">Delete Epic</button>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                        <button onClick={handleSave} className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-md">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const RoadmapView = () => {
    const appState = useSelector((state: RootState) => state.app as AppState);
    const { currentProjectId, issues } = appState;
    const [viewDate, setViewDate] = useState(new Date());
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedEpic, setSelectedEpic] = useState<Issue | null>(null);

    // Filter for EPICS only
    const epics = (Object.values(issues) as Issue[]).filter(i => i.projectId === currentProjectId && i.type === IssueType.EPIC);

    // Calculate view window (3 months)
    const monthsToDisplay = 4;
    const startYear = viewDate.getFullYear();
    const startMonth = viewDate.getMonth();
    
    // Generate headers
    const headers = [];
    let totalDays = 0;
    const monthWidths = [];

    for (let i = 0; i < monthsToDisplay; i++) {
        const d = new Date(startYear, startMonth + i, 1);
        const days = getDaysInMonth(d.getFullYear(), d.getMonth());
        totalDays += days;
        monthWidths.push(days);
        headers.push({
            label: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
            days,
            year: d.getFullYear(),
            month: d.getMonth()
        });
    }

    const viewStartDate = new Date(startYear, startMonth, 1);
    const viewEndDate = new Date(startYear, startMonth + monthsToDisplay, 0);

    // Helper to calculate bar position and width percentage
    const getBarMetrics = (startDate?: string, dueDate?: string) => {
        const s = startDate ? new Date(startDate) : new Date();
        const e = dueDate ? new Date(dueDate) : new Date(Date.now() + 86400000);
        
        // Clamp to view
        let renderStart = s < viewStartDate ? viewStartDate : s;
        let renderEnd = e > viewEndDate ? viewEndDate : e;

        if (renderStart > viewEndDate || renderEnd < viewStartDate) return null;

        const startDiff = Math.max(0, (renderStart.getTime() - viewStartDate.getTime()) / (1000 * 60 * 60 * 24));
        const duration = Math.max(1, (renderEnd.getTime() - renderStart.getTime()) / (1000 * 60 * 60 * 24));
        
        const left = (startDiff / totalDays) * 100;
        const width = (duration / totalDays) * 100;

        return { left: `${left}%`, width: `${width}%` };
    };

    const moveView = (months: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + months);
        setViewDate(newDate);
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-black overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-20">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Roadmap</h1>
                    <p className="text-slate-500 text-sm mt-1">Strategic timeline of Epics.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button onClick={() => moveView(-1)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm transition-all"><ChevronLeft size={16}/></button>
                        <button onClick={() => setViewDate(new Date())} className="px-3 text-xs font-bold text-slate-600 dark:text-slate-300">Today</button>
                        <button onClick={() => moveView(1)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm transition-all"><ChevronRight size={16}/></button>
                    </div>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all"
                    >
                        <Plus size={16} /> Create Epic
                    </button>
                </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-auto custom-scrollbar relative">
                <div className="min-w-[1000px] h-full flex flex-col">
                    
                    {/* Month Headers */}
                    <div className="flex border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
                        {headers.map((h, idx) => (
                            <div 
                                key={idx} 
                                className="border-r border-slate-200 dark:border-slate-800 py-3 px-4 text-xs font-bold text-slate-500 uppercase bg-slate-50 dark:bg-slate-900"
                                style={{ width: `${(h.days / totalDays) * 100}%` }}
                            >
                                {h.label}
                            </div>
                        ))}
                    </div>

                    {/* Grid Background */}
                    <div className="absolute inset-0 top-10 pointer-events-none flex z-0">
                        {headers.map((h, idx) => (
                            <div 
                                key={idx} 
                                className="border-r border-slate-100 dark:border-slate-800/50 h-full"
                                style={{ width: `${(h.days / totalDays) * 100}%` }}
                            >
                                {/* Weekly sub-grid could go here */}
                            </div>
                        ))}
                        
                        {/* Current Date Line */}
                        {(() => {
                            const now = new Date();
                            if (now >= viewStartDate && now <= viewEndDate) {
                                const diff = (now.getTime() - viewStartDate.getTime()) / (1000 * 60 * 60 * 24);
                                const left = (diff / totalDays) * 100;
                                return (
                                    <div 
                                        className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
                                        style={{ left: `${left}%` }}
                                    >
                                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full"></div>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>

                    {/* Epics Rows */}
                    <div className="relative z-0 p-4 space-y-2">
                        {epics.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-slate-400 mb-4">No Epics found for this timeline.</p>
                                <button onClick={() => setIsCreateModalOpen(true)} className="text-purple-600 font-bold hover:underline">Create your first Epic</button>
                            </div>
                        ) : epics.map(epic => {
                            const metrics = getBarMetrics(epic.startDate, epic.dueDate);
                            if (!metrics) return null; // Outside view

                            return (
                                <div key={epic.id} className="relative h-12 flex items-center group mb-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-lg transition-colors px-2">
                                    <div 
                                        className="absolute h-9 rounded-md bg-gradient-to-r from-purple-500 to-indigo-600 shadow-md border-t border-white/20 flex items-center px-4 text-white text-xs font-bold truncate cursor-pointer hover:brightness-110 transition-all z-10"
                                        style={{ left: metrics.left, width: metrics.width, minWidth: '40px' }}
                                        onClick={() => setSelectedEpic(epic)}
                                    >
                                        <span className="truncate">{epic.title}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isCreateModalOpen && <CreateEpicModal onClose={() => setIsCreateModalOpen(false)} />}
            {selectedEpic && <EditEpicModal epic={selectedEpic} onClose={() => setSelectedEpic(null)} />}
        </div>
    );
};

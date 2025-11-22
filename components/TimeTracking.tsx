
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, startTimeLog, stopTimeLog, logManualTime, deleteTimeLog, editTimeLog } from '../store';
import { AppState, TimeLog, Issue } from '../types';
import { Clock, Plus, X, Calendar, Search, Play, Pause, StopCircle, Edit, Trash, Download } from './Icons';
import { formatDate, formatDuration } from '../utils';
import { Avatar, IssueTypeIcon } from './Board';

// Modal for Manual Time Log (Create)
const LogTimeModal = ({ onClose }: { onClose: () => void }) => {
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app as AppState);
    const { issues, currentProjectId } = appState;
    const projectIssues = Object.values(issues).filter(i => i.projectId === currentProjectId);
    
    const [selectedIssueId, setSelectedIssueId] = useState('');
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [search, setSearch] = useState('');

    const filteredIssues = projectIssues.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.id.includes(search));

    const handleSubmit = () => {
        if (!selectedIssueId) return;
        const totalSeconds = (hours * 3600) + (minutes * 60);
        if (totalSeconds <= 0) return;
        
        dispatch(logManualTime({
            issueId: selectedIssueId,
            seconds: totalSeconds,
            date
        }));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white">Log Work</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Issue</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input 
                                className="w-full pl-10 bg-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                                placeholder="Search issue..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            {search && (
                                <div className="absolute w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                                    {filteredIssues.map(issue => (
                                        <div 
                                            key={issue.id} 
                                            onClick={() => { setSelectedIssueId(issue.id); setSearch(issue.title); }}
                                            className="p-2 hover:bg-indigo-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-2 text-sm"
                                        >
                                            <span className="font-mono text-slate-400 text-xs">{issue.id}</span>
                                            <span className="dark:text-white truncate">{issue.title}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {selectedIssueId && (
                             <div className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-1">
                                Selected: {projectIssues.find(i => i.id === selectedIssueId)?.title}
                             </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time Spent</label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <input type="number" min="0" className="w-full bg-white dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg p-2 outline-none" placeholder="0" value={hours} onChange={e => setHours(parseInt(e.target.value) || 0)} />
                                    <span className="text-xs text-slate-400">Hours</span>
                                </div>
                                <div className="flex-1">
                                    <input type="number" min="0" max="59" className="w-full bg-white dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg p-2 outline-none" placeholder="0" value={minutes} onChange={e => setMinutes(parseInt(e.target.value) || 0)} />
                                    <span className="text-xs text-slate-400">Mins</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date Started</label>
                            <input type="date" className="w-full bg-white dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg p-2 outline-none" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                    <button onClick={handleSubmit} disabled={!selectedIssueId} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md disabled:opacity-50">Log Time</button>
                </div>
            </div>
        </div>
    );
};

// Modal for Editing Time Log
const EditTimeLogModal = ({ log, onClose }: { log: TimeLog, onClose: () => void }) => {
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app as AppState);
    const { issues } = appState;
    const issue = issues[log.issueId];

    const [hours, setHours] = useState(Math.floor(log.durationSeconds / 3600));
    const [minutes, setMinutes] = useState(Math.floor((log.durationSeconds % 3600) / 60));
    const [date, setDate] = useState(log.startTime.split('T')[0]);

    const handleSubmit = () => {
        const totalSeconds = (hours * 3600) + (minutes * 60);
        if (totalSeconds <= 0) return;
        
        dispatch(editTimeLog({
            logId: log.id,
            seconds: totalSeconds,
            date
        }));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white">Edit Time Log</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="mb-6 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Issue</div>
                    <div className="font-bold text-slate-800 dark:text-white text-sm">{issue?.title}</div>
                    <div className="text-xs text-slate-400 font-mono">{issue?.id}</div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time Spent</label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <input type="number" min="0" className="w-full bg-white dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg p-2 outline-none" value={hours} onChange={e => setHours(parseInt(e.target.value) || 0)} />
                                    <span className="text-xs text-slate-400">Hours</span>
                                </div>
                                <div className="flex-1">
                                    <input type="number" min="0" max="59" className="w-full bg-white dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg p-2 outline-none" value={minutes} onChange={e => setMinutes(parseInt(e.target.value) || 0)} />
                                    <span className="text-xs text-slate-400">Mins</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                            <input type="date" className="w-full bg-white dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg p-2 outline-none" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md">Update Log</button>
                </div>
            </div>
        </div>
    );
};

// Active Timer Component
const ActiveTimer = () => {
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app as AppState);
    const { timeLogs, user, issues } = appState;
    const activeLog = Object.values(timeLogs).find(log => !log.endTime && log.userId === user?.id);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!activeLog) {
            setElapsed(0);
            return;
        }
        
        const interval = setInterval(() => {
            const start = new Date(activeLog.startTime).getTime();
            const now = new Date().getTime();
            setElapsed(Math.floor((now - start) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [activeLog]);

    if (!activeLog) return null;
    const issue = issues[activeLog.issueId];

    return (
        <div className="fixed bottom-6 right-6 z-40 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-6 animate-in slide-in-from-bottom-5 w-full max-w-md">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tracking Time</span>
                </div>
                <div className="font-bold truncate">{issue?.title || 'Unknown Issue'}</div>
                <div className="text-xs text-slate-400 font-mono">{issue?.id}</div>
            </div>
            <div className="text-3xl font-mono font-bold tracking-widest min-w-[140px] text-center">
                {new Date(elapsed * 1000).toISOString().substr(11, 8)}
            </div>
            <button 
                onClick={() => dispatch(stopTimeLog({ logId: activeLog.id }))}
                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl shadow-lg transition-colors group"
                title="Stop Timer"
            >
                <StopCircle className="w-6 h-6 fill-current text-white group-hover:scale-110 transition-transform" />
            </button>
        </div>
    );
};

export const TimeTrackingView = () => {
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app as AppState);
    const { timeLogs, issues, users, currentProjectId, user } = appState;
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<TimeLog | null>(null);

    // Filter logs for current project issues
    const projectLogs = Object.values(timeLogs)
        .filter(log => issues[log.issueId]?.projectId === currentProjectId)
        .sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    const activeLog = Object.values(timeLogs).find(log => !log.endTime && log.userId === user?.id);

    // Stats
    const today = new Date().toISOString().split('T')[0];
    const secondsToday = projectLogs
        .filter(l => l.startTime.startsWith(today) && l.userId === user?.id)
        .reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
    
    // Calculate week start
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(d.setDate(diff)).toISOString().split('T')[0];

    const secondsWeek = projectLogs
        .filter(l => l.startTime >= monday && l.userId === user?.id)
        .reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);

    // My Issues for quick start
    const myIssues = Object.values(issues).filter(i => i.projectId === currentProjectId && i.assigneeIds.includes(user?.id || '') && i.statusId !== 'c4').slice(0, 5);

    const handleExport = () => {
        const headers = ['Issue Key,Issue Title,User,Date,Duration (Seconds),Duration (Formatted)'];
        const rows = projectLogs.map(log => {
            const issue = issues[log.issueId];
            const u = users[log.userId];
            return `${issue?.id},"${issue?.title}",${u?.name},${log.startTime.split('T')[0]},${log.durationSeconds},${formatDuration(log.durationSeconds)}`;
        });
        
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `timesheet_export_${today}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-black overflow-hidden relative">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-20">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Time Tracking</h1>
                    <p className="text-sm text-slate-500">Monitor workload and track time spent on issues.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleExport}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                    <button 
                        onClick={() => setIsLogModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-md transition-all active:scale-95"
                    >
                        <Plus size={16} /> Log Time
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar pb-24">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-2">My Time Today</div>
                            <div className="text-4xl font-bold">{formatDuration(secondsToday)}</div>
                        </div>
                        <Clock className="absolute right-[-10px] bottom-[-20px] text-white opacity-10 w-32 h-32" />
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                         <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">My Time This Week</div>
                         <div className="text-4xl font-bold text-slate-800 dark:text-white">{formatDuration(secondsWeek)}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* My Assigned Work */}
                    <div className="lg:col-span-1">
                        <h3 className="font-bold text-lg dark:text-white mb-4">My Assigned Work</h3>
                        <div className="space-y-3">
                            {myIssues.length === 0 && <div className="text-slate-500 text-sm">No active issues assigned.</div>}
                            {myIssues.map(issue => {
                                const isRunning = activeLog?.issueId === issue.id;
                                return (
                                    <div key={issue.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-bold text-sm text-slate-800 dark:text-white line-clamp-2">{issue.title}</div>
                                            {isRunning ? (
                                                <button onClick={() => dispatch(stopTimeLog({ logId: activeLog.id }))} className="text-red-500 hover:text-red-600 p-1 bg-red-50 dark:bg-red-900/20 rounded">
                                                    <Pause size={16} fill="currentColor" />
                                                </button>
                                            ) : (
                                                <button onClick={() => dispatch(startTimeLog({ issueId: issue.id }))} className="text-green-500 hover:text-green-600 p-1 bg-green-50 dark:bg-green-900/20 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Play size={16} fill="currentColor" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-500">
                                            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{issue.id}</span>
                                            <span>{formatDuration(issue.timeSpent || 0)} logged</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Timesheet */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                <h3 className="font-bold text-lg dark:text-white">Timesheet</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-6 py-4">Issue</th>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4 text-right">Duration</th>
                                            <th className="px-6 py-4 w-20"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {projectLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No time logs recorded yet.</td>
                                            </tr>
                                        ) : projectLogs.map(log => {
                                            const issue = issues[log.issueId];
                                            const logUser = users[log.userId];
                                            if (!issue || !logUser) return null;

                                            return (
                                                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <IssueTypeIcon type={issue.type} />
                                                            <div className="min-w-0">
                                                                <div className="font-bold text-slate-800 dark:text-white text-sm truncate max-w-[150px]">{issue.title}</div>
                                                                <div className="text-xs text-slate-400 font-mono">{issue.id}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Avatar user={logUser} size={6} />
                                                            <span className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{logUser.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-500">
                                                        {formatDate(log.startTime)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                                                        {log.endTime ? formatDuration(log.durationSeconds) : <span className="text-green-500 animate-pulse">Running...</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => setEditingLog(log)}
                                                                className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                                                                disabled={!log.endTime}
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => { if(window.confirm('Delete this log?')) dispatch(deleteTimeLog(log.id)); }}
                                                                className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                                            >
                                                                <Trash size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ActiveTimer />
            {isLogModalOpen && <LogTimeModal onClose={() => setIsLogModalOpen(false)} />}
            {editingLog && <EditTimeLogModal log={editingLog} onClose={() => setEditingLog(null)} />}
        </div>
    );
};


import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, installPlugin, uninstallPlugin, addNotification } from '../store';
import { AppState, Plugin } from '../types';
import { Search, Grid, DownloadCloud, Box, Star, CheckCircle, X, Download } from './Icons';

const PluginIcon = ({ name, className = '' }: { name: string, className?: string }) => {
    const iconMap: Record<string, React.ReactNode> = {
        'slack': <div className={`text-3xl ${className}`}>💬</div>,
        'github': <div className={`text-3xl ${className}`}>🐙</div>,
        'figma': <div className={`text-3xl ${className}`}>🎨</div>,
        'sentry': <div className={`text-3xl ${className}`}>🔥</div>,
        'zendesk': <div className={`text-3xl ${className}`}>🎧</div>,
    };
    
    if (iconMap[name]) return <>{iconMap[name]}</>;
    
    // Default icons based on category if specific icon not found
    return <div className={`text-3xl ${className}`}>{name.includes('Time') ? '⏱️' : name.includes('Poker') ? '🃏' : '🧩'}</div>;
};

const PluginDetailsModal = ({ plugin, onClose }: { plugin: Plugin; onClose: () => void }) => {
    const dispatch = useDispatch();
    const isInstalled = plugin.isInstalled;

    const handleAction = () => {
        if (isInstalled) {
            if(window.confirm(`Are you sure you want to uninstall ${plugin.name}?`)) {
                dispatch(uninstallPlugin(plugin.id));
                dispatch(addNotification({ title: 'Plugin Uninstalled', message: `${plugin.name} has been removed.`, type: 'info' }));
                onClose();
            }
        } else {
            dispatch(installPlugin(plugin.id));
            dispatch(addNotification({ title: 'Plugin Installed', message: `${plugin.name} is now ready to use.`, type: 'success' }));
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="h-15 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-start justify-end p-4 shrink-0">
                    <button 
                        onClick={onClose} 
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors backdrop-blur-sm"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {/* Content */}
                <div className="px-8 pb-8 pt-8 overflow-y-auto custom-scrollbar">
                    
                    <div className="flex items-start gap-6 -mt-6 mb-8 relative z-10">
                        <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center border-4 border-white dark:border-slate-900 shrink-0 text-5xl">
                             <PluginIcon name={plugin.icon} />
                        </div>
                        
                        <div className="flex-1 pt-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 leading-tight">{plugin.name}</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">by <span className="font-semibold text-indigo-600 dark:text-indigo-400">{plugin.author}</span></p>
                                </div>
                                <button 
                                    onClick={handleAction}
                                    className={`px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-sm
                                        ${isInstalled 
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600' 
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                >
                                    {isInstalled ? 'Uninstall' : 'Install'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-300 mb-8 border-b border-slate-100 dark:border-slate-800 pb-8">
                        <div className="flex items-center gap-1.5">
                            <Star size={16} className="text-yellow-400 fill-yellow-400" />
                            <span className="font-bold text-slate-900 dark:text-white">{plugin.rating}</span>
                            <span className="text-slate-400">rating</span>
                        </div>
                        <div className="w-px h-4 bg-slate-300 dark:bg-slate-700"></div>
                        <div className="flex items-center gap-1.5">
                            <DownloadCloud size={16} className="text-slate-400" />
                            <span className="font-bold text-slate-900 dark:text-white">{plugin.downloads}</span>
                            <span className="text-slate-400">installs</span>
                        </div>
                        <div className="w-px h-4 bg-slate-300 dark:bg-slate-700"></div>
                        <div className="flex items-center gap-1.5">
                            <Box size={16} className="text-slate-400" />
                            <span className="font-bold text-slate-900 dark:text-white">{plugin.version}</span>
                            <span className="text-slate-400">version</span>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">About this app</h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                {plugin.fullDescription}
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Features</h3>
                            <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                                <li className="flex items-start gap-3">
                                    <span className="mt-2 w-1.5 h-1.5 bg-slate-400 rounded-full shrink-0"></span>
                                    Seamless integration with your workflow
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-2 w-1.5 h-1.5 bg-slate-400 rounded-full shrink-0"></span>
                                    Real-time synchronization
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-2 w-1.5 h-1.5 bg-slate-400 rounded-full shrink-0"></span>
                                    Secure and reliable data handling
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MarketplaceView = () => {
    const appState = useSelector((state: RootState) => state.app as AppState);
    const plugins = Object.values(appState.plugins);
    
    const [activeTab, setActiveTab] = useState<'explore' | 'installed'>('explore');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);

    const categories = ['All', 'Productivity', 'Development', 'Design', 'Communication', 'Reporting'];

    const filteredPlugins = plugins.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
        const matchesTab = activeTab === 'explore' ? true : p.isInstalled;
        return matchesSearch && matchesCategory && matchesTab;
    });

    return (
        <div className="h-full flex flex-col bg-white dark:bg-black overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-20">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Marketplace</h1>
                    <p className="text-sm text-slate-500">Discover apps to power up your workflow.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button 
                        onClick={() => setActiveTab('explore')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'explore' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                    >
                        <Grid size={16}/> Explore
                    </button>
                    <button 
                        onClick={() => setActiveTab('installed')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'installed' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                    >
                        <DownloadCloud size={16}/> Installed
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="px-8 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex gap-4 items-center overflow-x-auto">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search apps..." 
                        className="pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-2"></div>
                <div className="flex gap-2">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${categoryFilter === cat ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {filteredPlugins.length === 0 && (
                    <div className="text-center py-20">
                        <Box size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No apps found</h3>
                        <p className="text-slate-500">Try adjusting your search or filters.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPlugins.map(plugin => (
                        <div 
                            key={plugin.id}
                            onClick={() => setSelectedPlugin(plugin)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group relative flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:scale-105 transition-transform">
                                    <PluginIcon name={plugin.icon} className="text-3xl" />
                                </div>
                                {plugin.isInstalled && (
                                    <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-1.5 rounded-full">
                                        <CheckCircle size={16} />
                                    </span>
                                )}
                            </div>
                            
                            <div className="mb-4 flex-1">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">{plugin.name}</h3>
                                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-2">{plugin.category}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{plugin.description}</p>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                <div className="flex items-center gap-1">
                                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                    <span className="font-bold text-slate-600 dark:text-slate-300">{plugin.rating}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <DownloadCloud size={14} />
                                    <span>{plugin.downloads}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedPlugin && <PluginDetailsModal plugin={selectedPlugin} onClose={() => setSelectedPlugin(null)} />}
        </div>
    );
};

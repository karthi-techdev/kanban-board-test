
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, connectIntegration, disconnectIntegration, configureIntegration, syncIntegration, addNotification } from '../store';
import { AppState, Integration } from '../types';
import { Plug, CheckSquare, X, GitBranch, MessageSquare, RefreshCw, ExternalLink, Sliders, CheckCircle, BarChart, Layers, AlertCircle } from './Icons';
import { formatDate, formatTimeAgo } from '../utils';

const IntegrationIcon = ({ name, className = '' }: { name: string, className?: string }) => {
    const iconMap: Record<string, React.ReactNode> = {
        'github': <GitBranch className={className} />,
        'slack': <MessageSquare className={className} />,
        'gitlab': <GitBranch className={className} />,
        'jenkins': <Layers className={className} />,
        'figma': <div className={`font-bold text-xs ${className}`}>Fg</div>,
        'sentry': <AlertCircle className={className} />,
    };
    return <div className="flex items-center justify-center w-full h-full">{iconMap[name.toLowerCase()] || <Plug className={className} />}</div>;
};

const ConfigModal = ({ integration, onClose }: { integration: Integration; onClose: () => void }) => {
    const dispatch = useDispatch();
    const isConnected = integration.isConnected;
    
    // Form States
    const [apiKey, setApiKey] = useState(integration.config?.apiKey || '');
    const [url, setUrl] = useState(integration.config?.url || '');
    const [webhookUrl, setWebhookUrl] = useState(integration.config?.webhookUrl || '');
    const [username, setUsername] = useState(integration.config?.username || '');

    const handleConnect = () => {
        // Provider-specific config logic
        const config: any = {};
        if (apiKey) config.apiKey = apiKey;
        if (url) config.url = url;
        if (webhookUrl) config.webhookUrl = webhookUrl;
        if (username) config.username = username;

        if (isConnected) {
            dispatch(configureIntegration({ id: integration.id, config }));
            dispatch(addNotification({ title: 'Configuration Updated', message: `${integration.name} settings updated.`, type: 'success' }));
        } else {
            dispatch(connectIntegration({ id: integration.id, config }));
            dispatch(addNotification({ title: 'Connected', message: `Successfully connected to ${integration.name}.`, type: 'success' }));
        }
        onClose();
    };

    // Render specific fields based on provider
    const renderFields = () => {
        switch(integration.provider) {
            case 'slack':
                return (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Webhook URL</label>
                        <input className="w-full bg-white dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" 
                            value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://hooks.slack.com/..." />
                    </div>
                );
            case 'jenkins':
                return (
                    <>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Server URL</label>
                            <input className="w-full bg-white dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" 
                                value={url} onChange={e => setUrl(e.target.value)} placeholder="https://jenkins.company.com" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
                                <input className="w-full bg-white dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" 
                                    value={username} onChange={e => setUsername(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">API Token</label>
                                <input type="password" className="w-full bg-white dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" 
                                    value={apiKey} onChange={e => setApiKey(e.target.value)} />
                            </div>
                        </div>
                    </>
                );
            case 'github':
            case 'gitlab':
            case 'sentry':
            default:
                return (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Personal Access Token / API Key</label>
                        <input type="password" className="w-full bg-white dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" 
                            value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder={`Enter ${integration.name} Token`} />
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                            <IntegrationIcon name={integration.icon} />
                        </div>
                        <h2 className="text-xl font-bold dark:text-white">{isConnected ? 'Configure' : 'Connect'} {integration.name}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        {isConnected 
                            ? `Update settings for your ${integration.name} connection.` 
                            : `Enter your credentials to connect ${integration.name} to your workspace.`}
                    </p>

                    {renderFields()}

                    <div className="flex justify-end gap-3 mt-8">
                        <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                        <button onClick={handleConnect} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md">
                            {isConnected ? 'Save Changes' : 'Connect App'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const IntegrationView = () => {
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app as AppState);
    const integrations = Object.values(appState.integrations);
    
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'connected'>('all');
    const [syncingId, setSyncingId] = useState<string | null>(null);

    const filteredIntegrations = activeTab === 'connected' 
        ? integrations.filter(i => i.isConnected) 
        : integrations;

    const handleDisconnect = (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to disconnect ${name}? Data sync will stop immediately.`)) {
            dispatch(disconnectIntegration(id));
            dispatch(addNotification({ title: 'Integration Disconnected', message: `${name} has been disconnected.`, type: 'info' }));
        }
    };

    const handleSync = (id: string) => {
        setSyncingId(id);
        // Simulate network delay
        setTimeout(() => {
            dispatch(syncIntegration(id));
            setSyncingId(null);
            dispatch(addNotification({ title: 'Sync Complete', message: 'Data synchronization finished successfully.', type: 'success' }));
        }, 2000);
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-black overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-20">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Integrations</h1>
                    <p className="text-sm text-slate-500">Connect your favorite tools to streamline your workflow.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button 
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'all' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                    >
                        All Apps
                    </button>
                    <button 
                        onClick={() => setActiveTab('connected')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'connected' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                    >
                        Connected ({integrations.filter(i => i.isConnected).length})
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {filteredIntegrations.length === 0 && (
                    <div className="text-center py-20 text-slate-500">
                        <Plug size={48} className="mx-auto mb-4 text-slate-300" />
                        <p>No integrations found.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredIntegrations.map(int => (
                        <div key={int.id} className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-200 group ${int.isConnected ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/50 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'}`}>
                            
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${int.isConnected ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                                    <IntegrationIcon name={int.icon} />
                                </div>
                                {int.isConnected && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full border border-green-100 dark:border-green-900/30 uppercase tracking-wide">
                                        Active
                                    </span>
                                )}
                            </div>

                            <div className="mb-4 flex-1">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{int.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed min-h-[40px]">
                                    {int.description}
                                </p>
                            </div>

                            {/* Status & Meta */}
                            {int.isConnected && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 mb-4 border border-slate-100 dark:border-slate-800/50">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-500">Sync Status</span>
                                        <span className={`font-bold ${int.syncStatus === 'SUCCESS' ? 'text-green-500' : 'text-slate-500'}`}>
                                            {syncingId === int.id ? 'Syncing...' : int.syncStatus || 'Idle'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Last Synced</span>
                                        <span className="text-slate-700 dark:text-slate-300 font-mono">
                                            {int.lastSynced ? formatTimeAgo(int.lastSynced) : 'Never'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="mt-auto flex gap-2">
                                {int.isConnected ? (
                                    <>
                                        <button 
                                            onClick={() => setSelectedIntegration(int)}
                                            className="flex-1 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                                            title="Configure"
                                        >
                                            <Sliders size={14} /> Configure
                                        </button>
                                        <button 
                                            onClick={() => handleSync(int.id)}
                                            className={`p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors ${syncingId === int.id ? 'animate-spin' : ''}`}
                                            title="Sync Now"
                                            disabled={syncingId === int.id}
                                        >
                                            <RefreshCw size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDisconnect(int.id, int.name)}
                                            className="p-2 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-600 hover:border-red-200 dark:hover:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Disconnect"
                                        >
                                            <Plug size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => setSelectedIntegration(int)}
                                        className="w-full py-2.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl text-sm transition-all shadow-lg shadow-slate-500/20 active:scale-95"
                                    >
                                        Connect
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedIntegration && (
                <ConfigModal integration={selectedIntegration} onClose={() => setSelectedIntegration(null)} />
            )}
        </div>
    );
};

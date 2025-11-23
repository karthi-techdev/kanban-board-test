
import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, updateOrgSettings, restoreBackup, addAuditLog, addNotification } from '../store';
import { AppState, AuditLog } from '../types';
import { Shield, CreditCard, Activity, Download, Upload, FileText, ToggleRight, CheckSquare, X } from './Icons';
import { formatDate, formatTimeAgo } from '../utils';

const AdminTab = ({ icon: Icon, label, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all w-full text-left
            ${active 
            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' 
            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/50 dark:text-slate-400'}`}
    >
        <Icon size={18} />
        {label}
    </button>
);

// --- Modals ---

const UpgradeModal = ({ currentPlan, onClose, onUpgrade }: { currentPlan: string, onClose: () => void, onUpgrade: (plan: 'Pro' | 'Enterprise') => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl p-8 border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Upgrade Plan</h2>
                    <p className="text-slate-500 text-sm">Choose the plan that fits your team size.</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500">
                    <X size={20} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${currentPlan === 'Pro' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`} onClick={() => onUpgrade('Pro')}>
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg dark:text-white">Pro Plan</h3>
                        {currentPlan === 'Pro' && <CheckSquare className="text-indigo-600" size={20} />}
                    </div>
                    <div className="text-3xl font-bold mb-2 dark:text-white">$29 <span className="text-sm font-normal text-slate-500">/user/mo</span></div>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 mb-6">
                        <li className="flex gap-2">✓ Unlimited Boards</li>
                        <li className="flex gap-2">✓ Advanced Reporting</li>
                        <li className="flex gap-2">✓ 10GB Storage</li>
                    </ul>
                    {currentPlan !== 'Pro' && <button className="w-full py-2 rounded-lg border-2 border-indigo-600 text-indigo-600 font-bold text-sm hover:bg-indigo-50 dark:hover:bg-transparent">Select Pro</button>}
                </div>

                <div className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${currentPlan === 'Enterprise' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'}`} onClick={() => onUpgrade('Enterprise')}>
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg dark:text-white">Enterprise</h3>
                        {currentPlan === 'Enterprise' && <CheckSquare className="text-purple-600" size={20} />}
                    </div>
                    <div className="text-3xl font-bold mb-2 dark:text-white">$99 <span className="text-sm font-normal text-slate-500">/user/mo</span></div>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 mb-6">
                        <li className="flex gap-2">✓ SSO & Advanced Security</li>
                        <li className="flex gap-2">✓ Unlimited Storage</li>
                        <li className="flex gap-2">✓ 24/7 Dedicated Support</li>
                    </ul>
                    {currentPlan !== 'Enterprise' && <button className="w-full py-2 rounded-lg bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 shadow-md">Upgrade to Enterprise</button>}
                </div>
            </div>
        </div>
    </div>
);

const PaymentMethodModal = ({ onClose, onSave }: { onClose: () => void, onSave: (details: any) => void }) => {
    const [card, setCard] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    
    const handleSave = () => {
        if (!card || card.length < 4) return;
        onSave({
            last4: card.slice(-4),
            brand: 'VISA', // Mock detection
            expiry
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white">Update Payment Method</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Card Number</label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                className="w-full pl-10 bg-white dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" 
                                placeholder="0000 0000 0000 0000" 
                                value={card}
                                onChange={e => setCard(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expiry Date</label>
                            <input 
                                className="w-full bg-white dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" 
                                placeholder="MM/YY" 
                                value={expiry}
                                onChange={e => setExpiry(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">CVC</label>
                            <input 
                                className="w-full bg-white dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" 
                                placeholder="123" 
                                value={cvc}
                                onChange={e => setCvc(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cardholder Name</label>
                        <input className="w-full bg-white dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="John Doe" />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md">Save Card</button>
                </div>
            </div>
        </div>
    );
};

export const AdminView = () => {
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app as AppState);
    const { orgSettings, auditLogs, user } = appState;
    
    const [activeTab, setActiveTab] = useState<'general' | 'billing' | 'audit' | 'flags' | 'backup'>('general');
    const [orgName, setOrgName] = useState(orgSettings.name);
    const [logoUrl, setLogoUrl] = useState(orgSettings.logoUrl);
    const [primaryColor, setPrimaryColor] = useState(orgSettings.primaryColor);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Audit Log State
    const [auditSearch, setAuditSearch] = useState('');

    // Modal States
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const handleSaveGeneral = () => {
        dispatch(updateOrgSettings({ name: orgName, logoUrl, primaryColor }));
        dispatch(addAuditLog({ action: 'ORG_SETTINGS_UPDATED', details: 'Updated organization branding', userId: user?.id || 'sys' }));
        dispatch(addNotification({ title: 'Settings Saved', message: 'Organization settings updated successfully.', type: 'success' }));
    };

    const handleToggleFlag = (flag: string) => {
        const newFlags = { ...orgSettings.featureFlags, [flag]: !orgSettings.featureFlags[flag as keyof typeof orgSettings.featureFlags] };
        dispatch(updateOrgSettings({ featureFlags: newFlags }));
        dispatch(addAuditLog({ action: 'FEATURE_FLAG_TOGGLED', details: `Toggled ${flag} to ${newFlags[flag as keyof typeof newFlags]}`, userId: user?.id || 'sys' }));
    };

    const handleExportBackup = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `jira_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        dispatch(addAuditLog({ action: 'BACKUP_EXPORTED', details: 'Full system backup exported', userId: user?.id || 'sys' }));
    };

    const handleExportAuditLogs = () => {
        const headers = ['ID,User,Action,Details,Timestamp,IP'];
        const csv = headers.concat(
            auditLogs.map(log => `${log.id},${log.userId},${log.action},"${log.details}",${log.timestamp},${log.ipAddress}`)
        ).join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        dispatch(addNotification({ title: 'Export Complete', message: 'Audit logs exported to CSV.', type: 'success' }));
    };

    const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                // Basic validation
                if (json.projects && json.users && json.issues) {
                    if(window.confirm('WARNING: This will replace all current data. Are you sure?')) {
                        dispatch(restoreBackup(json));
                        dispatch(addNotification({ title: 'Restore Successful', message: 'Application state has been restored.', type: 'success' }));
                    }
                } else {
                    alert('Invalid backup file format.');
                }
            } catch (error) {
                alert('Error parsing JSON file.');
            }
        };
        reader.readAsText(file);
    };

    const handleUpgradePlan = (plan: 'Pro' | 'Enterprise') => {
        if (plan === orgSettings.plan) return;
        dispatch(updateOrgSettings({ plan }));
        dispatch(addAuditLog({ action: 'PLAN_UPDATED', details: `Upgraded plan to ${plan}`, userId: user?.id || 'sys' }));
        dispatch(addNotification({ title: 'Plan Upgraded', message: `Successfully upgraded to ${plan} Plan.`, type: 'success' }));
        setShowUpgradeModal(false);
    };

    const handleUpdatePaymentMethod = (details: any) => {
        dispatch(updateOrgSettings({ 
            paymentMethod: {
                brand: details.brand,
                last4: details.last4,
                expiry: details.expiry
            }
        }));
        dispatch(addAuditLog({ action: 'PAYMENT_METHOD_UPDATED', details: `Credit card ending in ${details.last4} updated`, userId: user?.id || 'sys' }));
        dispatch(addNotification({ title: 'Payment Method Updated', message: 'Your card details have been saved.', type: 'success' }));
        setShowPaymentModal(false);
    };

    const handleDownloadInvoice = (id: string) => {
        dispatch(addNotification({ title: 'Downloading Invoice', message: `Generating PDF for Invoice ${id}...`, type: 'info' }));
        setTimeout(() => {
            dispatch(addNotification({ title: 'Download Complete', message: `Invoice ${id} has been downloaded.`, type: 'success' }));
        }, 1500);
    };

    // Filter logs
    const filteredLogs = auditLogs.filter(log => 
        log.action.toLowerCase().includes(auditSearch.toLowerCase()) || 
        log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
        appState.users[log.userId]?.name.toLowerCase().includes(auditSearch.toLowerCase())
    );

    return (
        <div className="h-full bg-white dark:bg-black flex overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 p-6 flex flex-col gap-2">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-4">Admin Console</h2>
                <AdminTab icon={Shield} label="General Settings" active={activeTab === 'general'} onClick={() => setActiveTab('general')} />
                <AdminTab icon={CreditCard} label="Billing & Plans" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
                <AdminTab icon={Activity} label="Audit Log" active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} />
                <AdminTab icon={ToggleRight} label="Feature Flags" active={activeTab === 'flags'} onClick={() => setActiveTab('flags')} />
                <AdminTab icon={Download} label="Backup & Restore" active={activeTab === 'backup'} onClick={() => setActiveTab('backup')} />
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-10">
                <div className="max-w-4xl mx-auto">
                    
                    {/* GENERAL TAB */}
                    {activeTab === 'general' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">General Settings</h1>
                                <p className="text-slate-500">Manage your organization profile and branding.</p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Organization Name</label>
                                    <input 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Logo URL</label>
                                    <div className="flex gap-4">
                                        <img src={logoUrl} className="w-12 h-12 rounded-lg object-contain border border-slate-200 dark:border-slate-700 bg-white" alt="Logo Preview" />
                                        <input 
                                            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                            value={logoUrl}
                                            onChange={(e) => setLogoUrl(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Primary Brand Color</label>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="color" 
                                            className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                        />
                                        <input 
                                            className="w-32 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button 
                                        onClick={handleSaveGeneral}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BILLING TAB */}
                    {activeTab === 'billing' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Billing & Plans</h1>
                                <p className="text-slate-500">Manage your subscription and invoices.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Current Plan Card */}
                                <div className={`rounded-2xl p-8 text-white shadow-xl bg-gradient-to-br ${orgSettings.plan === 'Enterprise' ? 'from-purple-600 to-pink-700' : 'from-indigo-600 to-purple-700'}`}>
                                    <div className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-2">Current Plan</div>
                                    <div className="text-4xl font-bold mb-6">{orgSettings.plan} Plan</div>
                                    <div className="flex items-center justify-between text-sm text-indigo-100 mb-8">
                                        <span>${orgSettings.plan === 'Enterprise' ? '99' : '29'} / user / month</span>
                                        <span>Next bill: Dec 1, 2024</span>
                                    </div>
                                    <button 
                                        onClick={() => setShowUpgradeModal(true)}
                                        className="bg-white text-indigo-600 w-full py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg"
                                    >
                                        {orgSettings.plan === 'Enterprise' ? 'Manage Subscription' : 'Upgrade to Enterprise'}
                                    </button>
                                </div>

                                {/* Payment Method Card */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Payment Method</h3>
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 mb-6">
                                        <div className="w-10 h-6 bg-slate-300 dark:bg-slate-600 rounded flex items-center justify-center text-white text-xs uppercase font-bold">
                                            {orgSettings.paymentMethod?.brand || 'VISA'}
                                        </div>
                                        <span className="font-mono text-slate-600 dark:text-slate-300">•••• •••• •••• {orgSettings.paymentMethod?.last4 || '4242'}</span>
                                    </div>
                                    <button 
                                        onClick={() => setShowPaymentModal(true)}
                                        className="text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline"
                                    >
                                        Update Payment Method
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                    <h3 className="font-bold text-slate-800 dark:text-white">Invoice History</h3>
                                </div>
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-6 py-4">Invoice ID</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {[1, 2, 3].map(i => (
                                            <tr key={i} className="text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                <td className="px-6 py-4 font-mono">INV-2024-00{i}</td>
                                                <td className="px-6 py-4">Nov {30 - i * 30}, 2024</td>
                                                <td className="px-6 py-4">${orgSettings.plan === 'Enterprise' ? '1980.00' : '580.00'}</td>
                                                <td className="px-6 py-4"><span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded text-xs font-bold">Paid</span></td>
                                                <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer hover:underline" onClick={() => handleDownloadInvoice(`INV-2024-00${i}`)}>PDF</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* AUDIT LOG TAB */}
                    {activeTab === 'audit' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Audit Log</h1>
                                <p className="text-slate-500">Track all system activities and changes.</p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex gap-4">
                                    <input 
                                        placeholder="Search logs..." 
                                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm w-full outline-none dark:text-white" 
                                        value={auditSearch}
                                        onChange={(e) => setAuditSearch(e.target.value)}
                                    />
                                    <button 
                                        onClick={handleExportAuditLogs}
                                        className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                        Export
                                    </button>
                                </div>
                                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-500 uppercase sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3">User</th>
                                                <th className="px-6 py-3">Action</th>
                                                <th className="px-6 py-3">Details</th>
                                                <th className="px-6 py-3">IP Address</th>
                                                <th className="px-6 py-3">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {filteredLogs.length === 0 ? (
                                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No logs found.</td></tr>
                                            ) : filteredLogs.map(log => (
                                                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 text-sm text-slate-600 dark:text-slate-300">
                                                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{appState.users[log.userId]?.name || 'System'}</td>
                                                    <td className="px-6 py-3 font-mono text-xs">{log.action}</td>
                                                    <td className="px-6 py-3">{log.details}</td>
                                                    <td className="px-6 py-3 font-mono text-xs text-slate-400">{log.ipAddress}</td>
                                                    <td className="px-6 py-3 text-slate-400">{formatTimeAgo(log.timestamp)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FEATURE FLAGS TAB */}
                    {activeTab === 'flags' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Feature Flags</h1>
                                <p className="text-slate-500">Toggle system capabilities globally.</p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
                                {Object.entries(orgSettings.featureFlags).map(([key, value]) => (
                                    <div key={key} className="p-6 flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-white capitalize mb-1">{key.replace(/([A-Z])/g, ' $1')}</h3>
                                            <p className="text-sm text-slate-500">Enable or disable this module for all users.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={value} 
                                                onChange={() => handleToggleFlag(key)} 
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* BACKUP TAB */}
                    {activeTab === 'backup' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Backup & Restore</h1>
                                <p className="text-slate-500">Export your data or restore from a previous checkpoint.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center">
                                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Download size={32} />
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Export Data</h3>
                                    <p className="text-sm text-slate-500 mb-6">Download a complete JSON dump of your organization's data, including issues, users, and settings.</p>
                                    <button 
                                        onClick={handleExportBackup}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold w-full transition-all shadow-lg shadow-indigo-500/20"
                                    >
                                        Download Backup
                                    </button>
                                </div>

                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center">
                                    <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Upload size={32} />
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Restore Data</h3>
                                    <p className="text-sm text-slate-500 mb-6">Upload a JSON backup file to replace current data. <span className="text-red-500 font-bold">This cannot be undone.</span></p>
                                    <input 
                                        type="file" 
                                        accept=".json" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={handleImportBackup}
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-white dark:bg-transparent border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white px-6 py-3 rounded-xl font-bold w-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                    >
                                        Upload Backup File
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Global Modals */}
            {showUpgradeModal && (
                <UpgradeModal 
                    currentPlan={orgSettings.plan} 
                    onClose={() => setShowUpgradeModal(false)} 
                    onUpgrade={handleUpgradePlan} 
                />
            )}
            {showPaymentModal && (
                <PaymentMethodModal 
                    onClose={() => setShowPaymentModal(false)} 
                    onSave={handleUpdatePaymentMethod} 
                />
            )}
        </div>
    );
};

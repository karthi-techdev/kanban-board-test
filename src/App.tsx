
import React, { useEffect, useState, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { flushSync } from 'react-dom';
import { RootState, login, logout, toggleTheme, markNotificationAsRead, markAllNotificationsAsRead, clearNotifications } from './store';
import { AppState, Notification } from './types';
import { BoardView } from './components/Board';
import { BacklogView } from './components/Backlog';
import { RoadmapView } from './components/Roadmap';
import { CodeView } from './components/Code';
import { TimeTrackingView } from './components/TimeTracking';
import { TeamView, SettingsView, ProfileView } from './components/Views';
import { IssuesView, ReleasesView, ReportsView, AutomationView } from './components/ExtendedViews';
import { IntegrationView } from './components/IntegrationView';
import { MarketplaceView } from './components/Marketplace';
import { AdminView } from './components/AdminView';
import { HelpCenterView } from './components/HelpCenter';
import { Layout, Users, CheckSquare, Settings, Bell, Search, Moon, Sun, Calendar, ChevronLeft, ChevronRight, List, Rocket, Zap, BarChart, GitBranch, Clock, Shield, Globe, HelpCircle, X, LogOut, Mail, Lock, User, Plug } from './components/Icons';
import { formatTimeAgo } from './utils';

// --- Layout Components ---

const SidebarItem = ({ icon: Icon, label, path, count, collapsed }: any) => {
    const location = useLocation();
    const navigate = useNavigate();
    const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

    return (
        <div 
            onClick={() => navigate(path)}
            title={collapsed ? label : ''}
            className={`
                flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all group mb-1
                ${active 
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}
                ${collapsed ? 'justify-center' : ''}
            `}>
            <Icon size={18} className={`flex-shrink-0 ${active ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`} />
            {!collapsed && <span className="font-medium text-sm flex-1 whitespace-nowrap">{label}</span>}
            {!collapsed && count && <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] px-1.5 rounded font-bold">{count}</span>}
        </div>
    );
};

const NotificationDropdown = () => {
    const dispatch = useDispatch();
    const notifications = useSelector((state: RootState) => (state.app as AppState).notifications || []);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors relative outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-slate-700"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                        <div className="flex gap-2">
                             {unreadCount > 0 && (
                                <button 
                                    onClick={() => dispatch(markAllNotificationsAsRead())}
                                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                >
                                    Mark all read
                                </button>
                             )}
                             <button 
                                onClick={() => dispatch(clearNotifications())}
                                className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <Bell size={24} className="mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div 
                                    key={notif.id} 
                                    onClick={() => dispatch(markNotificationAsRead(notif.id))}
                                    className={`p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative group ${!notif.isRead ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notif.isRead ? 'bg-indigo-500' : 'bg-transparent'}`}></div>
                                        <div className="flex-1">
                                            <p className={`text-sm mb-1 ${!notif.isRead ? 'font-bold text-slate-800 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-300'}`}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-slate-500 leading-relaxed mb-2">
                                                {notif.message}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                                {formatTimeAgo(notif.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl text-center border-t border-slate-100 dark:border-slate-800">
                        <button onClick={() => setIsOpen(false)} className="text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-white py-1">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const Toast = ({ notification, onClose }: { notification: Notification; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeColors = {
      'success': 'bg-green-500',
      'error': 'bg-red-500',
      'warning': 'bg-amber-500',
      'info': 'bg-indigo-500'
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-4 py-4 rounded-xl shadow-2xl flex items-start gap-4 animate-in slide-in-from-right-10 fade-in duration-300 border border-slate-100 dark:border-slate-700 max-w-sm">
       <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${typeColors[notification.type]}`}></div>
       <div className="flex-1 min-w-0">
         <h4 className="font-bold text-sm mb-0.5">{notification.title}</h4>
         <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{notification.message}</p>
       </div>
       <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><X size={16}/></button>
    </div>
  );
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const appState = useSelector((state: RootState) => state.app as AppState);
  const { isDarkMode, user, notifications, orgSettings } = appState;
  const [collapsed, setCollapsed] = useState(false);
  
  // Toast State
  const [showToast, setShowToast] = useState(false);
  const [currentToast, setCurrentToast] = useState<Notification | null>(null);
  const prevNotifCount = useRef(notifications?.length || 0);

  useEffect(() => {
      if (isDarkMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Watch for new notifications to trigger toast
  useEffect(() => {
      if (notifications && notifications.length > prevNotifCount.current) {
          const latest = notifications[0];
          if (!latest.isRead) {
              setCurrentToast(latest);
              setShowToast(true);
          }
      }
      prevNotifCount.current = notifications?.length || 0;
  }, [notifications]);

  const handleToggleTheme = async (e: React.MouseEvent) => {
    // Fallback for browsers that don't support View Transitions
    if (!(document as any).startViewTransition) {
        dispatch(toggleTheme());
        return;
    }

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    // Center of the button
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Calculate distance to furthest corner
    const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
    );

    // Capture the transition
    const transition = (document as any).startViewTransition(() => {
        // Use flushSync to ensure DOM updates synchronously
        flushSync(() => {
            dispatch(toggleTheme());
        });
    });

    transition.ready.then(() => {
        const clipPath = [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
        ];

        // Animate the "new" view (which is either the dark mode view or light mode view depending on switch)
        // The logic here assumes we are "revealing" the new state.
        // If we are switching TO Dark Mode: The new view is Dark. We animate the clip path of ::view-transition-new from 0 to full.
        // If we are switching TO Light Mode: The new view is Light. We animate the clip path of ::view-transition-new from 0 to full.
        document.documentElement.animate(
            {
                clipPath: clipPath,
            },
            {
                duration: 500,
                easing: 'ease-in-out',
                // The pseudo-element is always ::view-transition-new(root) because we want to reveal the *new* state
                pseudoElement: '::view-transition-new(root)',
            }
        );
    });
  };

  const handleLogout = () => {
      if (window.confirm('Are you sure you want to log out?')) {
          dispatch(logout());
      }
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className={`${collapsed ? 'w-20' : 'w-64'} flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col transition-all duration-300 z-20 relative`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className={`flex items-center ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0" style={{ backgroundColor: orgSettings?.primaryColor }}>
              {orgSettings?.logoUrl ? (
                  <img src={orgSettings.logoUrl} className="w-full h-full object-contain rounded-sm" alt="Logo" />
              ) : (
                  <Layout className="text-white" size={18} />
              )}
            </div>
            {!collapsed && <span className="font-bold text-lg tracking-tight text-slate-800 dark:text-white ml-3 whitespace-nowrap">{orgSettings?.name || 'JiraClone'}</span>}
          </div>
        </div>
        
        <button 
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 shadow-sm z-30"
        >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 custom-scrollbar">
          <div className="mb-6">
             {!collapsed && <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap transition-opacity duration-200">Planning</div>}
             <SidebarItem icon={Layout} label="Board" path="/" collapsed={collapsed} />
             <SidebarItem icon={CheckSquare} label="Backlog" path="/backlog" collapsed={collapsed} />
             <SidebarItem icon={Calendar} label="Roadmap" path="/roadmap" collapsed={collapsed} />
             <SidebarItem icon={List} label="Issues" path="/issues" collapsed={collapsed} />
             <SidebarItem icon={Rocket} label="Releases" path="/releases" collapsed={collapsed} />
          </div>
          
          <div className="mb-6">
            {!collapsed && <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap transition-opacity duration-200">Development</div>}
            <SidebarItem icon={GitBranch} label="Code" path="/code" collapsed={collapsed} />
            <SidebarItem icon={Clock} label="Time Tracking" path="/time" collapsed={collapsed} />
            <SidebarItem icon={Plug} label="Integration" path="/integrations" collapsed={collapsed} />
            <SidebarItem icon={Users} label="Team" path="/team" collapsed={collapsed} />
          </div>

          <div className="mb-6">
            {!collapsed && <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap transition-opacity duration-200">Operations</div>}
            <SidebarItem icon={BarChart} label="Reports" path="/reports" collapsed={collapsed} />
            <SidebarItem icon={Zap} label="Automation" path="/automation" collapsed={collapsed} />
          </div>

           <div>
            {!collapsed && <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap transition-opacity duration-200">Settings</div>}
            <SidebarItem icon={Settings} label="Project Settings" path="/settings" collapsed={collapsed} />
            <SidebarItem icon={Shield} label="Admin" path="/admin" collapsed={collapsed} />
            <SidebarItem icon={Globe} label="Marketplace" path="/apps" collapsed={collapsed} />
          </div>
        </div>
        
        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
            <div 
                onClick={() => navigate('/help')}
                className="flex items-center px-3 py-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-md cursor-pointer transition-colors group"
            >
                <HelpCircle size={18} className="group-hover:text-indigo-600"/>
                {!collapsed && <span className="ml-3 text-sm font-medium">Help Center</span>}
            </div>
            <div 
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md cursor-pointer transition-colors group"
            >
                <LogOut size={18} className="group-hover:text-red-600"/>
                {!collapsed && <span className="ml-3 text-sm font-medium group-hover:text-red-600">Log Out</span>}
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-black relative">
        
        {/* Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center text-slate-500 text-sm">
                <span className="font-medium dark:text-slate-400">{orgSettings?.name || 'Acme Corp'}</span>
                <span className="mx-2">/</span>
                <span className="font-medium text-slate-800 dark:text-white">Engineering</span>
            </div>

            <div className="flex items-center gap-4">
                <button 
                    onClick={handleToggleTheme} 
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors overflow-hidden relative"
                >
                    {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
                </button>
                
                <NotificationDropdown />

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                <div 
                    className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
                    onClick={() => navigate('/profile')}
                >
                    <img src={user?.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 object-cover" />
                    <div className="hidden md:block">
                        <div className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{user?.name}</div>
                    </div>
                </div>
            </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden relative">
            {children}
        </main>

        {/* Global Toast */}
        {showToast && currentToast && (
            <Toast notification={currentToast} onClose={() => setShowToast(false)} />
        )}
      </div>
    </div>
  );
};

const AuthPage = () => {
  const dispatch = useDispatch();
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
        if (isRegister && !name.trim()) {
            setError('Full name is required');
            setIsLoading(false);
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            setError('Please enter a valid email address');
            setIsLoading(false);
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        // Success Logic (Mock)
        const user = {
            id: isRegister ? `u-${Date.now()}` : 'u1',
            name: isRegister ? name : 'Alex Johnson',
            email: email,
            avatarUrl: `https://picsum.photos/seed/${email}/200`,
            role: 'Admin' as const,
            inviteStatus: 'approved' as const
        };
        
        dispatch(login(user));
        setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-slate-100 dark:border-slate-800">
            <div className="text-center mb-8">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/30">
                    <Layout className="text-white" size={28} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                    {isRegister ? 'Create Account' : 'Welcome back'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {isRegister ? 'Get started with your free workspace.' : 'Enter your credentials to access your account.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-xs font-bold rounded-xl text-center animate-in fade-in">
                        {error}
                    </div>
                )}

                {isRegister && (
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 text-slate-400" size={18}/>
                            <input 
                                type="text" 
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                                placeholder="John Doe"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-slate-400" size={18}/>
                        <input 
                            type="email" 
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                            placeholder="name@company.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                        {!isRegister && <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">Forgot password?</a>}
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-slate-400" size={18}/>
                        <input 
                            type="password" 
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95 disabled:opacity-70 flex justify-center items-center"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        isRegister ? 'Create Account' : 'Sign In'
                    )}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {isRegister ? 'Already have an account?' : "Don't have an account?"} 
                    <button 
                        onClick={() => { setIsRegister(!isRegister); setError(''); }}
                        className="ml-1 font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 outline-none hover:underline"
                    >
                        {isRegister ? 'Sign In' : 'Register'}
                    </button>
                </p>
            </div>
        </div>
    </div>
  );
};

const App = () => {
  const isAuthenticated = useSelector((state: RootState) => (state.app as AppState).isAuthenticated);

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <AuthPage />} />
        <Route path="/*" element={
          isAuthenticated ? (
            <MainLayout>
                <Routes>
                    <Route index element={<BoardView />} />
                    <Route path="backlog" element={<BacklogView />} />
                    <Route path="roadmap" element={<RoadmapView />} />
                    <Route path="issues" element={<IssuesView />} />
                    <Route path="releases" element={<ReleasesView />} />
                    <Route path="reports" element={<ReportsView />} />
                    <Route path="automation" element={<AutomationView />} />
                    <Route path="team" element={<TeamView />} />
                    <Route path="code" element={<CodeView />} />
                    <Route path="time" element={<TimeTrackingView />} />
                    <Route path="integrations" element={<IntegrationView />} />
                    <Route path="apps" element={<MarketplaceView />} />
                    <Route path="settings" element={<SettingsView />} />
                    <Route path="admin" element={<AdminView />} />
                    <Route path="profile" element={<ProfileView />} />
                    <Route path="help" element={<HelpCenterView />} />
                    {/* Placeholders for other routes to prevent crashes */}
                    <Route path="*" element={<div className="p-10 text-slate-500">Module under construction</div>} />
                </Routes>
            </MainLayout>
          ) : <Navigate to="/login" />
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;

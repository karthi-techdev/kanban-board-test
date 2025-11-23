
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addNotification } from '../store';
import { Search, HelpCircle, BookOpen, MessageCircle, PlayCircle, ChevronDown, ChevronUp, ExternalLink, Mail } from './Icons';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-3 transition-all">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
                <span className="font-bold text-slate-800 dark:text-white text-sm">{question}</span>
                {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
            </button>
            {isOpen && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {answer}
                </div>
            )}
        </div>
    );
};

export const HelpCenterView = () => {
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const [supportForm, setSupportForm] = useState({ subject: '', message: '' });

    const faqs = [
        { q: "How do I create a new project?", a: "You can create a new project from the 'Projects' dashboard or by asking your administrator. Currently, this demo supports single-project views." },
        { q: "Can I integrate with GitHub?", a: "Yes! Go to the 'Integration' tab in the sidebar, select GitHub, and enter your Personal Access Token." },
        { q: "How does the sprint planning work?", a: "Navigate to the 'Backlog' view. You can drag issues from the backlog into a Sprint. Once planned, click 'Start Sprint' to activate it on the Board." },
        { q: "Is my data saved?", a: "Yes, all data is persisted locally in your browser's LocalStorage. Clearing your browser cache will reset the data." },
        { q: "How do I change my theme?", a: "Click the Moon/Sun icon in the top navigation bar to toggle between Light and Dark modes." }
    ];

    const filteredFaqs = faqs.filter(f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleSupportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!supportForm.subject || !supportForm.message) return;
        
        // Mock API call
        setTimeout(() => {
            dispatch(addNotification({
                title: 'Support Request Sent',
                message: 'We have received your message and will get back to you shortly.',
                type: 'success'
            }));
            setSupportForm({ subject: '', message: '' });
        }, 800);
    };

    return (
        <div className="h-full bg-slate-50/50 dark:bg-black overflow-y-auto p-10">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">How can we help you?</h1>
                    <div className="max-w-xl mx-auto relative">
                        <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search for help articles..." 
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer group">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <BookOpen size={24} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Documentation</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Browse detailed guides and API references for developers.</p>
                        <span className="text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center gap-1">Read Docs <ExternalLink size={14}/></span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-300 dark:hover:border-purple-700 transition-colors cursor-pointer group">
                        <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <PlayCircle size={24} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Video Tutorials</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Watch step-by-step videos to master the platform.</p>
                        <span className="text-purple-600 dark:text-purple-400 text-sm font-bold flex items-center gap-1">Watch Now <ExternalLink size={14}/></span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-green-300 dark:hover:border-green-700 transition-colors cursor-pointer group">
                        <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <MessageCircle size={24} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Community Forum</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Connect with other users and share best practices.</p>
                        <span className="text-green-600 dark:text-green-400 text-sm font-bold flex items-center gap-1">Join Community <ExternalLink size={14}/></span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <HelpCircle size={20} className="text-indigo-600" /> Frequently Asked Questions
                        </h2>
                        <div className="space-y-2">
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((faq, i) => <FAQItem key={i} question={faq.q} answer={faq.a} />)
                            ) : (
                                <div className="text-center py-10 text-slate-500">No results found for "{searchQuery}"</div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-6">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <Mail size={18} className="text-indigo-600"/> Contact Support
                            </h3>
                            <form onSubmit={handleSupportSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
                                    <input 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="I need help with..."
                                        value={supportForm.subject}
                                        onChange={e => setSupportForm({...supportForm, subject: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message</label>
                                    <textarea 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
                                        placeholder="Describe your issue..."
                                        value={supportForm.message}
                                        onChange={e => setSupportForm({...supportForm, message: e.target.value})}
                                        required
                                    />
                                </div>
                                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg shadow-md transition-all active:scale-95">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

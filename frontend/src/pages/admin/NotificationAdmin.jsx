import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { Send, BellRing, Info, ShieldAlert, ChevronDown } from 'lucide-react';

const NotificationAdmin = () => {
  const { fetchJson } = useAuth();
  const [draft, setDraft] = useState({
    recipientEmails: [],
    title: '',
    message: '',
    category: 'SYSTEM',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  
  // States for searchable dropdown
  const [users, setUsers] = useState([]);
  const [emailSearch, setEmailSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Fetch users for the dropdown
    const loadUsers = async () => {
      try {
        const data = await userService.getAllUsers();
        setUsers(data || []);
      } catch (err) {
        console.error("Failed to load users for dropdown", err);
      }
    };
    loadUsers();
  }, []);

  const toggleEmail = (email) => {
    setDraft(prev => {
      const isSelected = prev.recipientEmails.includes(email);
      return {
        ...prev,
        recipientEmails: isSelected 
          ? prev.recipientEmails.filter(e => e !== email)
          : [...prev.recipientEmails, email]
      };
    });
  };

  async function sendAdminNotification(event) {
    event.preventDefault();
    setStatus({ type: 'loading', message: 'Sending notification...' });
    
    try {
      await fetchJson('/api/notifications', {
        method: 'POST',
        body: JSON.stringify(draft),
      });
      
      setStatus({ type: 'success', message: 'Notification broadcasted successfully!' });
      setDraft({
        recipientEmails: [],
        title: '',
        message: '',
        category: 'SYSTEM',
      });
      setEmailSearch('');
      
      setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to send notification. Please try again.' });
    }
  }

  // Filter users based on search text
  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(emailSearch.toLowerCase()) || 
    u.name?.toLowerCase().includes(emailSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Notification Center</h1>
        <p className="text-slate-400 mt-2">Broadcast alerts and messages to campus personnel.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="md:col-span-2">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-700/50">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <BellRing className="text-indigo-400 w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Compose Broadcast</h2>
            </div>

            {status.message && (
              <div className={`p-4 mb-6 rounded-2xl border text-sm font-bold flex items-center gap-3 ${
                status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 
                'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
              }`}>
                {status.type === 'success' && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                {status.type === 'error' && <ShieldAlert size={16} />}
                {status.message}
              </div>
            )}

            <form onSubmit={sendAdminNotification} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Category</label>
                  <select
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="SYSTEM">System Alert (Global)</option>
                    <option value="BOOKING">Booking Update</option>
                    <option value="TICKET">Maintenance Ticket</option>
                  </select>
                </div>
                <div className="space-y-2 relative">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Recipient Emails (Multi-Select)</label>
                  
                  {draft.recipientEmails.length > 0 && (
                    <div className="flex flex-wrap gap-2 pb-1">
                      {draft.recipientEmails.map(email => (
                        <span key={email} className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
                          {email}
                          <button type="button" onClick={() => toggleEmail(email)} className="hover:text-white hover:bg-indigo-500/30 rounded-full p-0.5 transition-colors">&times;</button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="text"
                      placeholder={draft.recipientEmails.length === 0 ? "Search users (leave blank for ALL)" : "Search to add more..."}
                      value={emailSearch}
                      onChange={(e) => {
                        setEmailSearch(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                  </div>
                  
                  {/* Searchable Multi-Select Dropdown */}
                  {showDropdown && filteredUsers.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
                      {filteredUsers.map(u => {
                        const isSelected = draft.recipientEmails.includes(u.email);
                        return (
                          <div
                            key={u.id}
                            className={`px-4 py-3 hover:bg-slate-700/50 cursor-pointer transition-colors border-b border-slate-700/50 last:border-0 flex items-center gap-3 ${isSelected ? 'bg-indigo-500/10' : ''}`}
                            onMouseDown={(e) => {
                              // Prevent onBlur from firing before click
                              e.preventDefault();
                            }}
                            onClick={() => {
                              toggleEmail(u.email);
                              setEmailSearch(''); // Clear search after picking
                              // Do not close dropdown to allow multi-select
                            }}
                          >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-500'}`}>
                              {isSelected && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm">{u.name}</div>
                              <div className="text-slate-400 text-xs">{u.email}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Alert Title</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Emergency Network Maintenance"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Message Content</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Enter the full details of your announcement here..."
                  value={draft.message}
                  onChange={(e) => setDraft({ ...draft, message: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={status.type === 'loading'}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                <Send size={18} />
                {status.type === 'loading' ? 'Broadcasting...' : 'Send Notification'}
              </button>
            </form>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4 text-indigo-400">
              <Info size={18} />
              <h3 className="font-bold">Usage Guidelines</h3>
            </div>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                <p>Leaving the recipient email blank will send the notification to <strong>everyone</strong> on campus.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                <p>Search by name or email to quickly find a specific recipient.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                <p>System alerts are prioritized and visually highlighted in the user's notification tray.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationAdmin;

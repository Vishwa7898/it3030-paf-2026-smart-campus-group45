import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { Send, BellRing, Info, ShieldAlert, ChevronDown, Trash2, Edit2, History } from 'lucide-react';

const NotificationAdmin = () => {
  const { fetchJson } = useAuth();
  const [draft, setDraft] = useState({
    recipientEmails: [],
    title: '',
    message: '',
    category: 'SYSTEM',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [editId, setEditId] = useState(null);
  
  // States for searchable dropdown
  const [users, setUsers] = useState([]);
  const [emailSearch, setEmailSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // States for all notifications
  const [notifications, setNotifications] = useState([]);

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
    loadAllNotifications();
  }, []);

  const loadAllNotifications = async () => {
    try {
      const data = await fetchJson('/api/notifications/all');
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  const toggleEmail = (email) => {
    if (editId) return; // Disable recipient change during edit
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
    setStatus({ type: 'loading', message: editId ? 'Updating notification...' : 'Sending notification...' });
    
    try {
      if (editId) {
        await fetchJson(`/api/notifications/${editId}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: draft.title,
            message: draft.message,
            category: draft.category
          }),
        });
        setStatus({ type: 'success', message: 'Notification updated successfully!' });
      } else {
        await fetchJson('/api/notifications', {
          method: 'POST',
          body: JSON.stringify(draft),
        });
        setStatus({ type: 'success', message: 'Notification broadcasted successfully!' });
      }
      
      setDraft({
        recipientEmails: [],
        title: '',
        message: '',
        category: 'SYSTEM',
      });
      setEmailSearch('');
      setEditId(null);
      loadAllNotifications();
      
      setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    } catch (err) {
      setStatus({ type: 'error', message: `Failed to ${editId ? 'update' : 'send'} notification. Please try again.` });
    }
  }

  const handleEdit = (notif) => {
    setEditId(notif.id);
    setDraft({
      recipientEmails: notif.recipientEmail ? [notif.recipientEmail] : [],
      title: notif.title,
      message: notif.message,
      category: notif.category,
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;
    try {
      await fetchJson(`/api/notifications/${id}`, { method: 'DELETE' });
      loadAllNotifications();
    } catch (err) {
      console.error("Failed to delete", err);
      alert("Failed to delete notification.");
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setDraft({
      recipientEmails: [],
      title: '',
      message: '',
      category: 'SYSTEM',
    });
  };

  // Filter users based on search text
  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(emailSearch.toLowerCase()) || 
    u.name?.toLowerCase().includes(emailSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Notification Center</h1>
        <p className="text-slate-400 mt-2">Broadcast alerts and manage sent messages.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Form Section */}
        <div className="md:col-span-2">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-xl transition-all">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editId ? 'bg-amber-500/20' : 'bg-indigo-500/20'}`}>
                  {editId ? <Edit2 className="text-amber-400 w-5 h-5" /> : <BellRing className="text-indigo-400 w-5 h-5" />}
                </div>
                <h2 className="text-xl font-bold text-white">
                  {editId ? 'Edit Broadcast' : 'Compose Broadcast'}
                </h2>
              </div>
              {editId && (
                <button 
                  onClick={cancelEdit}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancel Edit
                </button>
              )}
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
                <div className={`space-y-2 relative ${editId ? 'opacity-50 pointer-events-none' : ''}`}>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    {editId ? 'Recipient (Cannot be changed)' : 'Recipient Emails (Multi-Select)'}
                  </label>
                  
                  {draft.recipientEmails.length > 0 && (
                    <div className="flex flex-wrap gap-2 pb-1">
                      {draft.recipientEmails.map(email => (
                        <span key={email} className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
                          {email}
                          {!editId && <button type="button" onClick={() => toggleEmail(email)} className="hover:text-white hover:bg-indigo-500/30 rounded-full p-0.5 transition-colors">&times;</button>}
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
                  {!editId && showDropdown && filteredUsers.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
                      {filteredUsers.map(u => {
                        const isSelected = draft.recipientEmails.includes(u.email);
                        return (
                          <div
                            key={u.id}
                            className={`px-4 py-3 hover:bg-slate-700/50 cursor-pointer transition-colors border-b border-slate-700/50 last:border-0 flex items-center gap-3 ${isSelected ? 'bg-indigo-500/10' : ''}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                            }}
                            onClick={() => {
                              toggleEmail(u.email);
                              setEmailSearch(''); 
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
                className={`w-full text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 ${
                  editId 
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20' 
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
                }`}
              >
                {editId ? <Edit2 size={18} /> : <Send size={18} />}
                {status.type === 'loading' 
                  ? (editId ? 'Updating...' : 'Broadcasting...') 
                  : (editId ? 'Update Notification' : 'Send Notification')}
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
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <p>Click the Edit button on a recent broadcast to update its content without changing recipients.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Broadcasts Section */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/50">
          <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center">
            <History className="text-slate-400 w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">Recent Broadcasts</h2>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No notifications have been broadcasted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-900/50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 rounded-l-xl">Title / Message</th>
                  <th className="px-6 py-4">Recipient</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notif) => (
                  <tr key={notif.id} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white mb-1">{notif.title}</div>
                      <div className="text-xs text-slate-400 line-clamp-1 max-w-md">{notif.message}</div>
                    </td>
                    <td className="px-6 py-4">
                      {notif.recipientEmail ? (
                        <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-xs font-bold">
                          {notif.recipientEmail}
                        </span>
                      ) : (
                        <span className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded text-xs font-bold">
                          ALL USERS
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs font-bold">
                        {notif.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(notif)}
                          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(notif.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationAdmin;

import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { Shield, User, Wrench, Search, Loader2 } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setSavingId(userId);
      // We pass the new role as a Set (Array)
      await userService.updateUserRoles(userId, [newRole]);
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, roles: [newRole] } : u
      ));
    } catch (err) {
      console.error('Failed to update role', err);
      alert('Failed to update user role');
    } finally {
      setSavingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-indigo-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">User Management</h1>
        <p className="text-slate-400 mt-2">Manage roles and permissions for campus personnel.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-800/40 border border-slate-700/50 p-4 rounded-3xl backdrop-blur-xl">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700/50 pl-11 pr-4 py-3 rounded-2xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
        <div className="text-sm font-bold text-slate-400">
          Total Users: <span className="text-white bg-slate-700 px-2 py-1 rounded-lg ml-2">{filteredUsers.length}</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/50 text-xs uppercase font-black tracking-widest text-slate-500 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Current Role</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-medium">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const currentRole = u.roles && u.roles.length > 0 ? u.roles[0] : 'USER';
                  const isSaving = savingId === u.id;
                  
                  return (
                    <tr key={u.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-white">{u.name}</div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold capitalize">
                          {u.provider?.toLowerCase() || 'Google'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {currentRole === 'ADMIN' ? (
                            <Shield className="text-amber-400" size={16} />
                          ) : currentRole === 'TECHNICIAN' ? (
                            <Wrench className="text-emerald-400" size={16} />
                          ) : (
                            <User className="text-blue-400" size={16} />
                          )}
                          <span className={`font-bold ${
                            currentRole === 'ADMIN' ? 'text-amber-400' :
                            currentRole === 'TECHNICIAN' ? 'text-emerald-400' :
                            'text-blue-400'
                          }`}>
                            {currentRole}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {isSaving && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
                          <select
                            value={currentRole}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={isSaving}
                            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
                          >
                            <option value="USER">Student / User</option>
                            <option value="TECHNICIAN">Technician</option>
                            <option value="ADMIN">Administrator</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { TableSkeleton } from '../components/LoaderSkeletons';
import { Trash2, UserCheck, ShieldAlert } from 'lucide-react';

const AdminUsers = ({ onToast }) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      console.error(err.message);
      onToast('Failed to load accounts list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (user) => {
    if (user._id === currentUser._id) {
      return onToast('You cannot change your own administrative role!');
    }

    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    if (!window.confirm(`Change ${user.name}'s role to ${newRole}?`)) return;

    try {
      await api.put(`/admin/users/${user._id}/role`, { role: newRole });
      onToast(`Role successfully updated to ${newRole}!`);
      fetchUsers();
    } catch (err) {
      onToast('Failed to update account role');
    }
  };

  const handleDeleteUser = async (user) => {
    if (user._id === currentUser._id) {
      return onToast('You cannot delete your own administrative account!');
    }
    if (user.role === 'admin') {
      return onToast('Administrative accounts cannot be deleted directly');
    }

    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) return;

    try {
      await api.delete(`/admin/users/${user._id}`);
      onToast('User account successfully deleted');
      fetchUsers();
    } catch (err) {
      onToast('Failed to delete account');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Manage Users</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">View user account directories, update roles, and manage credentials</p>
      </div>

      {loading && users.length === 0 ? (
        <TableSkeleton cols={4} />
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-750 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-semibold text-left text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-750 text-gray-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4">Role status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-750">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-750/30 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      {u.profilePic ? (
                        <img src={u.profilePic} alt="" className="w-8.5 h-8.5 rounded-full object-cover border" />
                      ) : (
                        <div className="w-8.5 h-8.5 rounded-full bg-primary-50 dark:bg-slate-900 border flex items-center justify-center font-bold text-primary-500">
                          {u.name.substring(0, 1)}
                        </div>
                      )}
                      <div>
                        <p className="font-extrabold text-gray-900 dark:text-white">{u.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{u.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-450">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        u.role === 'admin' 
                          ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100 dark:border-rose-900/50' 
                          : 'bg-primary-50 dark:bg-primary-950/20 text-primary-500 border border-primary-100 dark:border-primary-900/50'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleRole(u)}
                        disabled={u._id === currentUser._id}
                        className="p-2 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 rounded-lg text-gray-500 disabled:opacity-40"
                        title="Toggle Admin/Customer role"
                      >
                        <UserCheck className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u)}
                        disabled={u._id === currentUser._id || u.role === 'admin'}
                        className="p-2 border border-red-200 dark:border-slate-700 hover:bg-red-50 rounded-lg text-red-500 disabled:opacity-40"
                        title="Delete Account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsers;

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { toast } from '../store/toastStore';
import { ShieldCheck, UserX, UserCheck, Trash2 } from 'lucide-react';

export default function AdminUsers() {
  const queryClient = useQueryClient();

  // Fetch all users query
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data.users;
    },
  });

  // Toggle user block status mutation
  const blockUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.put(`/admin/users/block/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'User status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      toast.error('Failed to change user blocking status');
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/users/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('User account deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      toast.error('Failed to delete user');
    },
  });

  const handleToggleBlock = (id: string) => {
    blockUserMutation.mutate(id);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this user account? This cannot be undone.')) {
      deleteUserMutation.mutate(id);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 bg-slate-950">
        <div>
          <h1 className="text-3xl font-black font-display text-white">Manage Customers</h1>
          <p className="text-slate-400 text-sm mt-1">Review registered client stats, verify emails, and manage active session blocks.</p>
        </div>

        {isLoading ? (
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"></div>
        ) : (
          <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 p-4 text-slate-500 font-bold uppercase">
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Email Verification</th>
                    <th className="p-4 text-center">Orders Placed</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {users?.map((user: any) => (
                    <tr key={user.id} className="hover:bg-slate-950/20 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-200">{user.name}</div>
                        <div className="text-[10px] text-slate-500">{user.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          user.isVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          <ShieldCheck size={10} />
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 text-center text-slate-300 font-semibold">{user.orderCount} orders</td>
                      <td className="p-4 text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right space-x-3">
                        {/* Block/Unblock toggle */}
                        <button
                          onClick={() => handleToggleBlock(user.id)}
                          className={`p-1.5 rounded-lg border transition ${
                            user.isBlocked
                              ? 'bg-rose-500/10 border-rose-500/25 text-rose-400 hover:bg-rose-500 hover:text-white'
                              : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                          }`}
                          title={user.isBlocked ? 'Unblock user' : 'Block user'}
                        >
                          {user.isBlocked ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-500 hover:border-rose-500/30 transition"
                          title="Delete user profile"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

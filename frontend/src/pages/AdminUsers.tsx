import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { toast } from '../store/toastStore';
import { ShieldCheck, UserX, UserCheck, Trash2 } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

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
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)] bg-[#FAF9F6] dark:bg-[#0D0D0E] text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 animate-page-enter">
        <ScrollReveal direction="up" distance={20} duration={0.6}>
          <div className="pb-4 border-b border-neutral-200/80 dark:border-neutral-800">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
              Client Accounts
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
              Manage Customers
            </h1>
            <p className="text-neutral-500 text-xs sm:text-sm mt-1">Review registered client stats, email verification statuses, and manage active session blocks.</p>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-3xl animate-pulse"></div>
        ) : (
          <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-soft-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-[#F4F3EF]/60 dark:bg-[#1C1C20]/60 p-4 text-neutral-400 font-bold uppercase text-[10px]">
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Email Verification</th>
                    <th className="p-4 text-center">Orders Placed</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  {users?.map((user: any) => (
                    <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition">
                      <td className="p-4">
                        <div className="font-bold text-neutral-900 dark:text-white">{user.name}</div>
                        <div className="text-[10px] text-neutral-400">{user.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          user.isVerified 
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                        }`}>
                          <ShieldCheck size={11} />
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 text-center text-neutral-700 dark:text-neutral-300 font-semibold">{user.orderCount} orders</td>
                      <td className="p-4 text-neutral-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right space-x-2">
                        {/* Block/Unblock toggle */}
                        <button
                          onClick={() => handleToggleBlock(user.id)}
                          className={`p-2 rounded-xl border transition ${
                            user.isBlocked
                              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white'
                          }`}
                          title={user.isBlocked ? 'Unblock user' : 'Block user'}
                        >
                          {user.isBlocked ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-900/40 transition"
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

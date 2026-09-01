import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { toast } from '../store/toastStore';
import api from '../services/api';
import {
  User as UserIcon,
  MapPin,
  Lock,
  Bell,
  Camera,
  Plus,
  Trash,
  CheckCircle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from '../components/ScrollReveal';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'security' | 'notifications'>('profile');

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    if (user?.avatar) {
      const avatarUrl = user.avatar.startsWith('/uploads')
        ? `http://localhost:5000${user.avatar}`
        : user.avatar;
      setAvatarPreview(avatarUrl);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'addresses') {
      fetchAddresses();
    } else if (activeTab === 'notifications') {
      fetchNotifications();
    }
  }, [activeTab]);

  // Profile update handler
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser(res.data.user);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error updating profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setIsChangingPassword(true);
    try {
      await api.put('/auth/change-password', { oldPassword, newPassword });
      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error updating password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Address Actions
  const fetchAddresses = async () => {
    try {
      const res = await api.get('/orders/addresses');
      setAddresses(res.data.addresses);
    } catch (err) {
      toast.error('Error fetching addresses');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/orders/addresses', addressForm);
      toast.success('Address added successfully!');
      setShowAddressForm(false);
      setAddressForm({
        name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
      });
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (window.confirm('Delete this address?')) {
      try {
        await api.delete(`/orders/addresses/${id}`);
        toast.success('Address removed');
        fetchAddresses();
      } catch (err) {
        toast.error('Error deleting address');
      }
    }
  };

  // Notifications Actions
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/admin/notifications');
      setNotifications(res.data.notifications);
    } catch (err) {
      toast.error('Error fetching notifications');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/admin/notifications/read');
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (err) {
      toast.error('Error clearing inbox');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-page-enter space-y-8">
      <ScrollReveal direction="up" distance={20} duration={0.6}>
        <div className="pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
            Account Management
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            My Account
          </h1>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Sidebar Tabs Navigation */}
        <aside className="space-y-2 lg:col-span-1">
          <ScrollReveal direction="right" distance={20} duration={0.6} className="space-y-1.5">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs uppercase tracking-wider font-bold transition ${
                activeTab === 'profile'
                  ? 'bg-[#121212] text-white dark:bg-white dark:text-neutral-950 shadow-soft-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <UserIcon size={16} /> Profile Details
            </button>
            
            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs uppercase tracking-wider font-bold transition ${
                activeTab === 'addresses'
                  ? 'bg-[#121212] text-white dark:bg-white dark:text-neutral-950 shadow-soft-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <MapPin size={16} /> Address Book
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs uppercase tracking-wider font-bold transition ${
                activeTab === 'security'
                  ? 'bg-[#121212] text-white dark:bg-white dark:text-neutral-950 shadow-soft-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Lock size={16} /> Security
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs uppercase tracking-wider font-bold transition ${
                activeTab === 'notifications'
                  ? 'bg-[#121212] text-white dark:bg-white dark:text-neutral-950 shadow-soft-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Bell size={16} /> Notifications
            </button>
          </ScrollReveal>
        </aside>

        {/* Right Side: Tab Viewports */}
        <main className="lg:col-span-3 bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 rounded-3xl shadow-soft-sm">
          
          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <ScrollReveal direction="up" distance={25} duration={0.6}>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <h3 className="font-editorial text-xl font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                  Personal Information
                </h3>

                {/* Avatar Upload */}
                <div className="flex items-center gap-5">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-[#F4F3EF] dark:bg-[#1E1E22]">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <UserIcon size={32} />
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition">
                      <Camera size={18} />
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                  </div>
                  <div className="text-xs text-neutral-500">
                    <p className="font-bold text-neutral-900 dark:text-white">Profile Photo</p>
                    <p className="mt-0.5">Click photo to update. PNG, JPG up to 5MB.</p>
                  </div>
                </div>

                {/* Name & Email Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">Full Name</span>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#F4F3EF] dark:bg-[#1F1F24] border border-neutral-300/80 dark:border-neutral-700 rounded-2xl p-3 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">Email Address</span>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#F4F3EF] dark:bg-[#1F1F24] border border-neutral-300/80 dark:border-neutral-700 rounded-2xl p-3 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="btn-pill-arrow group justify-between px-6 py-3 shadow-soft-sm disabled:opacity-50"
                >
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </span>
                  <div className="arrow-circle">
                    <ArrowUpRight size={14} />
                  </div>
                </button>
              </form>
            </ScrollReveal>
          )}

          {/* TAB 2: ADDRESS BOOK */}
          {activeTab === 'addresses' && (
            <ScrollReveal direction="up" distance={25} duration={0.6} className="space-y-6">
              <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <h3 className="font-editorial text-xl font-bold text-neutral-900 dark:text-white">Shipping Address Book</h3>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-bold py-2 px-4 rounded-full flex items-center gap-1 uppercase tracking-wider transition"
                >
                  <Plus size={14} /> Add Address
                </button>
              </div>

              {/* Add Address Form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="bg-[#F4F3EF] dark:bg-[#1E1E22] p-5 border border-neutral-300/80 dark:border-neutral-700 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Full Name</span>
                    <input
                      required
                      type="text"
                      placeholder="Your full name"
                      value={addressForm.name}
                      onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                      className="w-full bg-white dark:bg-[#161618] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Phone Number</span>
                    <input
                      required
                      type="text"
                      placeholder="+91 98765 43210"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      className="w-full bg-white dark:bg-[#161618] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Street Address</span>
                    <input
                      required
                      type="text"
                      placeholder="Flat, House no., Building, Street / Area"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      className="w-full bg-white dark:bg-[#161618] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">City</span>
                    <input
                      required
                      type="text"
                      placeholder="City / Town"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full bg-white dark:bg-[#161618] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">State</span>
                    <input
                      required
                      type="text"
                      placeholder="State / Province"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="w-full bg-white dark:bg-[#161618] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Postal Code</span>
                    <input
                      required
                      type="text"
                      placeholder="PIN / Postal Code"
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                      className="w-full bg-white dark:bg-[#161618] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Country</span>
                    <input
                      required
                      type="text"
                      placeholder="Country"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="w-full bg-white dark:bg-[#161618] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="sm:col-span-2 bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold py-2.5 rounded-full text-xs uppercase tracking-wider transition"
                  >
                    Save Address
                  </button>
                </form>
              )}

              {/* Saved Addresses list */}
              {addresses.length === 0 ? (
                <p className="text-neutral-500 text-xs py-2">No saved addresses. Click Add Address above to add one.</p>
              ) : (
                <ScrollRevealGroup staggerDelay={0.06} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <ScrollRevealItem key={addr.id} direction="up" distance={20}>
                      <div className="p-5 border border-neutral-200/80 dark:border-neutral-800 bg-[#F4F3EF] dark:bg-[#1E1E22] rounded-2xl flex justify-between items-start gap-4 shadow-soft-sm">
                        <div className="text-xs text-neutral-500 space-y-1">
                          <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                            {addr.name}
                            {addr.isDefault && (
                              <span className="bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-[9px] px-2 py-0.5 rounded uppercase">
                                Default
                              </span>
                            )}
                          </div>
                          <div>{addr.phone}</div>
                          <div>{addr.street}</div>
                          <div>{addr.city}, {addr.state} - {addr.postalCode}</div>
                          <div>{addr.country}</div>
                        </div>

                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-neutral-400 hover:text-rose-500 transition p-1"
                          title="Delete Address"
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    </ScrollRevealItem>
                  ))}
                </ScrollRevealGroup>
              )}
            </ScrollReveal>
          )}

          {/* TAB 3: ACCOUNT SECURITY */}
          {activeTab === 'security' && (
            <ScrollReveal direction="up" distance={25} duration={0.6}>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <h3 className="font-editorial text-xl font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                  Password Security
                </h3>

                <div className="space-y-1 max-w-md">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">Current Password</span>
                  <input
                    required
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-[#F4F3EF] dark:bg-[#1F1F24] border border-neutral-300/80 dark:border-neutral-700 rounded-2xl p-3 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
                  />
                </div>

                <div className="space-y-1 max-w-md">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">New Password</span>
                  <input
                    required
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#F4F3EF] dark:bg-[#1F1F24] border border-neutral-300/80 dark:border-neutral-700 rounded-2xl p-3 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
                  />
                </div>

                <div className="space-y-1 max-w-md">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">Confirm New Password</span>
                  <input
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#F4F3EF] dark:bg-[#1F1F24] border border-neutral-300/80 dark:border-neutral-700 rounded-2xl p-3 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold py-3 px-8 rounded-full text-xs uppercase tracking-wider transition shadow-soft-sm"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </ScrollReveal>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <ScrollReveal direction="up" distance={25} duration={0.6} className="space-y-6">
              <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <h3 className="font-editorial text-xl font-bold text-neutral-900 dark:text-white">Notifications Inbox</h3>
                {notifications.some((n) => !n.isRead) && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-bold text-neutral-900 dark:text-white underline underline-offset-2 hover:opacity-75"
                  >
                    Mark All As Read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className="text-neutral-500 text-xs py-2">Your notifications inbox is empty.</p>
              ) : (
                <ScrollRevealGroup staggerDelay={0.06} className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {notifications.map((notif) => (
                    <ScrollRevealItem key={notif.id} direction="up" distance={20}>
                      <div
                        className={`p-4 border rounded-2xl flex gap-3.5 transition ${
                          notif.isRead
                            ? 'border-neutral-200/80 dark:border-neutral-800 bg-[#F4F3EF] dark:bg-[#1E1E22] text-neutral-400'
                            : 'border-neutral-900 dark:border-white bg-white dark:bg-[#161618] text-neutral-900 dark:text-white shadow-soft-sm'
                        }`}
                      >
                        <div className="mt-0.5">
                          {notif.isRead ? (
                            <Clock size={16} className="text-neutral-400" />
                          ) : (
                            <CheckCircle size={16} className="text-emerald-500" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-xs uppercase tracking-wider">{notif.title}</h4>
                          <p className="text-xs leading-relaxed">{notif.message}</p>
                          <span className="text-[10px] text-neutral-400 block">
                            {new Date(notif.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </ScrollRevealItem>
                  ))}
                </ScrollRevealGroup>
              )}
            </ScrollReveal>
          )}

        </main>
      </div>
    </div>
  );
}

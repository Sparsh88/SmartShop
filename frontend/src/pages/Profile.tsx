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
} from 'lucide-react';

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
    const file = e.target.files?.[0];
    if (file) {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-page-enter">
      <h1 className="text-3xl font-black font-display text-white mb-8">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Sidebar Tabs Navigation */}
        <aside className="space-y-2 lg:col-span-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'profile'
                ? 'bg-indigo-650 bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <UserIcon size={18} /> Profile Details
          </button>
          
          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'addresses'
                ? 'bg-indigo-650 bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <MapPin size={18} /> Address Book
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'security'
                ? 'bg-indigo-650 bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Lock size={18} /> Account Security
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'notifications'
                ? 'bg-indigo-650 bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Bell size={18} /> Notifications
          </button>
        </aside>

        {/* Right Side: Tab Viewports */}
        <main className="lg:col-span-3 bg-slate-900 border border-slate-850 p-6 sm:p-8 rounded-3xl shadow-sm">
          
          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <h3 className="text-xl font-bold font-display text-white border-b border-slate-800 pb-3">
                Profile Information
              </h3>

              {/* Avatar Upload */}
              <div className="flex items-center gap-5">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border border-slate-800 bg-slate-950">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <UserIcon size={32} />
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition">
                    <Camera size={18} />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
                <div className="text-xs text-slate-500">
                  <p className="font-bold text-slate-300">Upload profile image</p>
                  <p className="mt-1">Supports PNG, JPG, GIF up to 5MB.</p>
                </div>
              </div>

              {/* Name & Email Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 font-bold mb-1.5">Full Name</span>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 font-bold mb-1.5">Email Address</span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition"
              >
                {isUpdatingProfile ? 'Saving Details...' : 'Save Profile Changes'}
              </button>
            </form>
          )}

          {/* TAB 2: ADDRESS BOOK */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-xl font-bold font-display text-white">Address Book</h3>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition"
                >
                  <Plus size={14} /> Add Address
                </button>
              </div>

              {/* Add Address Form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="bg-slate-950 p-5 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-bold mb-1">Full Name</span>
                    <input
                      required
                      type="text"
                      value={addressForm.name}
                      onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-bold mb-1">Phone Number</span>
                    <input
                      required
                      type="text"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col sm:col-span-2">
                    <span className="text-xs text-slate-500 font-bold mb-1">Street Address</span>
                    <input
                      required
                      type="text"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-bold mb-1">City</span>
                    <input
                      required
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-bold mb-1">State</span>
                    <input
                      required
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-bold mb-1">ZIP / Postal Code</span>
                    <input
                      required
                      type="text"
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-bold mb-1">Country</span>
                    <input
                      required
                      type="text"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="sm:col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    Save Address
                  </button>
                </form>
              )}

              {/* Saved Addresses list */}
              {addresses.length === 0 ? (
                <p className="text-slate-500 text-sm">No saved addresses. Click Add Address to include shipping details.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-4 border border-slate-800 bg-slate-950/20 rounded-2xl flex justify-between items-start gap-4"
                    >
                      <div className="text-xs text-slate-400 space-y-1">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {addr.name}
                          {addr.isDefault && (
                            <span className="bg-indigo-500/10 text-indigo-400 font-bold text-[9px] px-2 py-0.5 rounded uppercase">
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
                        className="text-slate-600 hover:text-red-500 transition"
                        title="Delete Address"
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACCOUNT SECURITY */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <h3 className="text-xl font-bold font-display text-white border-b border-slate-800 pb-3">
                Update Password
              </h3>

              <div className="flex flex-col max-w-md">
                <span className="text-xs text-slate-500 font-bold mb-1.5">Current Password</span>
                <input
                  required
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col max-w-md">
                <span className="text-xs text-slate-500 font-bold mb-1.5">New Password</span>
                <input
                  required
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col max-w-md">
                <span className="text-xs text-slate-500 font-bold mb-1.5">Confirm New Password</span>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition"
              >
                {isChangingPassword ? 'Updating Password...' : 'Change Password'}
              </button>
            </form>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-xl font-bold font-display text-white">Notifications Inbox</h3>
                {notifications.some((n) => !n.isRead) && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    Mark All As Read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className="text-slate-500 text-sm">Your notifications inbox is empty.</p>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 border rounded-2xl flex gap-3.5 transition ${
                        notif.isRead
                          ? 'border-slate-800 bg-slate-950/20 text-slate-400'
                          : 'border-indigo-500/30 bg-indigo-950/10 text-slate-200'
                      }`}
                    >
                      <div className="mt-1">
                        {notif.isRead ? (
                          <Clock size={16} className="text-slate-600" />
                        ) : (
                          <CheckCircle size={16} className="text-indigo-400" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs uppercase tracking-wider">{notif.title}</h4>
                        <p className="text-sm leading-relaxed">{notif.message}</p>
                        <span className="text-[10px] text-slate-500 block">
                          {new Date(notif.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

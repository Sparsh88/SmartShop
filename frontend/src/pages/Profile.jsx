import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Camera, Save, Trash2, Mail, ShieldCheck } from 'lucide-react';

const Profile = ({ onToast }) => {
  const { user, updateProfile } = useAuth();

  // Local state edit fields
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.profilePic || '');
  const [avatarFile, setAvatarFile] = useState(null);

  // Address add form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setUpdating(true);
    const formData = new FormData();
    formData.append('name', name.trim());
    if (password.trim()) formData.append('password', password.trim());
    if (avatarFile) formData.append('profilePic', avatarFile);

    try {
      await updateProfile(formData);
      onToast('Profile updated successfully! ✨');
      setPassword('');
    } catch (error) {
      onToast(error || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !zipCode) return;

    try {
      const newAddress = { street, city, state, zipCode, country: 'India', isDefault: false };
      const updatedAddresses = [...(user.addresses || []), newAddress];

      await updateProfile({ addresses: JSON.stringify(updatedAddresses) });
      user.addresses = updatedAddresses; // sync context manually if needed

      onToast('Address saved successfully! 📍');
      setStreet('');
      setCity('');
      setState('');
      setZipCode('');
      setShowAddressForm(false);
    } catch (error) {
      onToast('Failed to add address');
    }
  };

  const handleDeleteAddress = async (idx) => {
    try {
      const updatedAddresses = user.addresses.filter((_, i) => i !== idx);
      await updateProfile({ addresses: JSON.stringify(updatedAddresses) });
      user.addresses = updatedAddresses;

      onToast('Address deleted');
    } catch (error) {
      onToast('Failed to delete address');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Account Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Settings Left */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm space-y-6 h-fit">
          <div className="flex flex-col items-center text-center space-y-4">
            
            {/* Avatar upload panel */}
            <div className="relative group">
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt={user.name} 
                  className="h-28 w-28 rounded-full border-2 border-primary-500 object-cover" 
                />
              ) : (
                <div className="h-28 w-28 rounded-full bg-primary-50 dark:bg-slate-900 border-2 border-dashed border-primary-500 flex items-center justify-center text-primary-500">
                  <User className="h-10 w-10" />
                </div>
              )}
              
              <label className="absolute bottom-0 right-0 bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all">
                <Camera className="h-4 w-4" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                />
              </label>
            </div>

            <div>
              <h2 className="font-extrabold text-lg text-gray-900 dark:text-white">{user.name}</h2>
              <span className="bg-primary-50 dark:bg-primary-950/45 text-primary-600 dark:text-primary-400 font-bold px-3 py-0.5 rounded-full text-[10px] uppercase tracking-wider mt-1.5 inline-block">
                {user.role} Member
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-slate-700 pt-4 space-y-3.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <div className="flex items-center gap-2">
              <Mail className="h-4.5 w-4.5 text-gray-450" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-gray-450" />
              <span>Verified Account login status</span>
            </div>
          </div>
        </div>

        {/* Edit Fields Right */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Details edit form */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm flex items-center gap-2">
              <User className="h-5 w-5 text-primary-500" /> Account Settings
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-3.5 py-2.5 rounded-xl text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold">Change Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password (optional)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-3.5 py-2.5 rounded-xl text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" /> {updating ? 'Saving changes...' : 'Save Details'}
              </button>
            </form>
          </div>

          {/* Saved addresses lists */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary-500" /> Saved Addresses
            </h3>

            {user.addresses && user.addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses.map((addr, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-150 dark:border-slate-700 relative flex justify-between items-start">
                    <div>
                      <p className="text-xs font-black capitalize text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                        {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(idx)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No addresses saved yet.</p>
            )}

            {!showAddressForm ? (
              <button
                onClick={() => setShowAddressForm(true)}
                className="text-xs font-bold text-primary-500 hover:text-primary-600"
              >
                + Add Address
              </button>
            ) : (
              <form onSubmit={handleAddAddress} className="border border-gray-100 dark:border-slate-750 p-4 rounded-2xl space-y-3">
                <input
                  type="text"
                  placeholder="Street / Locality"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-3.5 py-2.5 rounded-xl"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-3.5 py-2.5 rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-3.5 py-2.5 rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-3.5 py-2.5 rounded-xl"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="text-xs font-semibold px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold px-4 py-2 rounded-lg"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;

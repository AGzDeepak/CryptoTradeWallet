import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { X, User, Mail, Phone, Lock, Camera, Check, ShieldCheck } from 'lucide-react';

export const EditAccountModal = () => {
  const { closeModal, addNotification, user, setUser } = useCrypto();

  const [fullName, setFullName] = useState(user?.name || 'Deepak Quant Trader');
  const [email, setEmail] = useState(user?.email || 'deepak.quant@tradebot.io');
  const [phone, setPhone] = useState('+1 (555) 019-2834');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      addNotification('New passwords do not match!', 'error');
      return;
    }

    // Save user profile state
    setUser((prev) => ({
      ...prev,
      name: fullName,
      email: email,
      avatar: avatarUrl
    }));

    addNotification('Account profile updated successfully!', 'success');
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
      <div className="w-full max-w-xl bg-[#14161d] border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#facc15] text-slate-950 flex items-center justify-center font-bold">
              <User className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white font-sans tracking-tight">EDIT ACCOUNT PROFILE</h3>
              <p className="text-xs text-slate-400 font-mono">Update personal information, avatar, and security passwords.</p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 rounded-xl bg-[#0b0c10] border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Picture Preview */}
        <div className="flex items-center space-x-5 p-4 rounded-2xl bg-[#0b0c10] border border-slate-800">
          <div className="w-16 h-16 rounded-full border-2 border-[#facc15] overflow-hidden shrink-0">
            <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 space-y-1.5 font-mono text-xs">
            <label className="text-slate-400 block font-bold">Avatar Image URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full bg-[#14161d] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-[#facc15]"
              required
            />
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveProfile} className="space-y-4 font-mono text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 block mb-1 font-bold">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0b0c10] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white outline-none focus:border-[#facc15]"
                />
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-bold">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0b0c10] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white outline-none focus:border-[#facc15]"
                />
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-bold">Phone Number *</label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#0b0c10] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white outline-none focus:border-[#facc15]"
              />
              <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            </div>
          </div>

          {/* Password Change Divider */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-[#facc15] block mb-3 uppercase flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Security Password Change (Optional)
            </span>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1 font-bold">New Password</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#0b0c10] border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#facc15]"
                />
              </div>

              {newPassword && (
                <div>
                  <label className="text-slate-400 block mb-1 font-bold">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#0b0c10] border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#facc15]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-3 rounded-xl bg-[#0b0c10] border border-slate-800 text-slate-300 font-bold hover:bg-slate-900 transition"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#facc15] text-slate-950 font-extrabold hover:brightness-110 shadow-lg transition"
            >
              SAVE ACCOUNT CHANGES
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

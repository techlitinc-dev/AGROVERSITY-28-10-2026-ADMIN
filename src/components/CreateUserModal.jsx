import React, { useState } from 'react';
import { UserPlus, X, Check, Shield } from 'lucide-react';
import { usersApi } from '../api/usersApi';

const AVAILABLE_ROLES = [
  { id: 'farmer', label: 'Farmer (Kisan)', color: 'emerald' },
  { id: 'transporter', label: 'Transporter (Vahan)', color: 'blue' },
  { id: 'seller', label: 'Produce Seller / Agri-Input', color: 'amber' },
  { id: 'nursery', label: 'Plant Nursery', color: 'purple' },
  { id: 'vyapari', label: 'Vyapari / Commission Agent', color: 'indigo' },
  { id: 'equipmentRental', label: 'Equipment Rental', color: 'cyan' },
  { id: 'farmLandlord', label: 'Farmland Landlord', color: 'orange' },
];

export const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    primary_role: 'farmer',
    roles: ['farmer'],
    state: '',
    district: '',
    status: 'ACTIVE',
    kyc_status: 'PENDING',
    mpin: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRoleToggle = (roleId) => {
    setFormData((prev) => {
      const exists = prev.roles.includes(roleId);
      const nextRoles = exists
        ? prev.roles.filter((r) => r !== roleId)
        : [...prev.roles, roleId];
      if (nextRoles.length === 0) return prev; // Keep at least one
      return {
        ...prev,
        roles: nextRoles,
        primary_role: nextRoles.includes(prev.primary_role) ? prev.primary_role : nextRoles[0],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setError('Name and Phone are required.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim().startsWith('+91')
          ? formData.phone.trim()
          : `+91${formData.phone.trim()}`,
        email: formData.email ? formData.email.trim() : null,
        primary_role: formData.primary_role,
        roles: formData.roles,
        state: formData.state.trim() || undefined,
        district: formData.district.trim() || undefined,
        status: formData.status,
        kyc_status: formData.kyc_status,
        mpin: formData.mpin,
      };

      const res = await usersApi.createUser(payload);
      onUserCreated(res);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || err.response?.data?.detail?.message || err.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl p-6 text-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Direct Create System User</h3>
            <p className="text-xs text-slate-400">Pre-configure personas, compliance state, and direct Firestore registration</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number (10 digits) *</label>
              <input
                type="text"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                placeholder="Enter email address (optional)"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Default MPIN</label>
              <input
                type="password"
                maxLength={4}
                placeholder="••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                value={formData.mpin}
                onChange={(e) => setFormData({ ...formData, mpin: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">State</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                placeholder="Enter state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">District</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                placeholder="Enter district"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              />
            </div>
          </div>

          {/* Persona Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Assigned Persona Roles (Select all that apply)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AVAILABLE_ROLES.map((role) => {
                const isSelected = formData.roles.includes(role.id);
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleToggle(role.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{role.label}</span>
                    <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                      isSelected ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Initial Status</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="LOCKED">LOCKED</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">KYC Initial State</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                value={formData.kyc_status}
                onChange={(e) => setFormData({ ...formData, kyc_status: e.target.value })}
              >
                <option value="PENDING">PENDING</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="UNVERIFIED">UNVERIFIED</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition-all flex items-center space-x-1.5"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  X, User, Shield, MapPin, Phone, Mail, Award, Layers, 
  Map as MapIcon, Loader2, Check, AlertCircle, RefreshCw, Plus, Trash2 
} from 'lucide-react';
import { usersApi } from '../api/usersApi';
import { securityApi } from '../api/securityApi';

const AVAILABLE_PERSONAS = [
  'farmer',
  'transporter',
  'seller',
  'equipmentRental',
  'broker',
  'instructor',
  'farmLandlord',
  'dairyManager',
  'admin'
];

export const UserDetailDrawer = ({ uid, isOpen, onClose, onRefreshList, onRequestAuditAction }) => {
  const [data, setData] = useState(null);
  const [farmMap, setFarmMap] = useState(null);
  const [roleProfiles, setRoleProfiles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState('');
  
  // Persona management state
  const [selectedPersonas, setSelectedPersonas] = useState([]);
  const [savingPersonas, setSavingPersonas] = useState(false);

  useEffect(() => {
    if (!uid || !isOpen) return;

    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const [userRes, farmRes, rolesRes] = await Promise.allSettled([
          usersApi.getUserDetails(uid),
          usersApi.getFarmMap(uid),
          usersApi.getRoleProfiles(uid),
        ]);

        if (userRes.status === 'fulfilled') {
          setData(userRes.value);
          const currentPersonas = userRes.value?.linkedProfiles || 
            (userRes.value?.profile?.linkedProfiles) || [];
          setSelectedPersonas(currentPersonas);
        } else {
          setError('Failed to fetch user details');
        }

        if (farmRes.status === 'fulfilled') {
          setFarmMap(farmRes.value);
        }
        if (rolesRes.status === 'fulfilled') {
          setRoleProfiles(rolesRes.value);
        }
      } catch (err) {
        setError(err.message || 'Error loading details');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [uid, isOpen]);

  if (!isOpen) return null;

  const profile = data?.profile || data || {};

  const handleTogglePersona = (persona) => {
    setSelectedPersonas((prev) =>
      prev.includes(persona) ? prev.filter((p) => p !== persona) : [...prev, persona]
    );
  };

  const handleSavePersonas = () => {
    const original = data?.linkedProfiles || profile?.linkedProfiles || [];
    const add = selectedPersonas.filter((p) => !original.includes(p));
    const remove = original.filter((p) => !selectedPersonas.includes(p));

    onRequestAuditAction({
      title: `Update Personas for ${profile.name || uid}`,
      message: `Adding [${add.join(', ') || 'none'}], Removing [${remove.join(', ') || 'none'}]`,
      action: async (reason) => {
        setSavingPersonas(true);
        try {
          await usersApi.managePersonas(uid, { add, remove }, reason);
          // Refresh user data
          const updated = await usersApi.getUserDetails(uid);
          setData(updated);
          onRefreshList?.();
        } finally {
          setSavingPersonas(false);
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
              {(profile.name || uid).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">{profile.name || 'Unnamed User'}</h2>
                <span className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider ${
                  profile.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  profile.status === 'suspended' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {profile.status || 'unknown'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">UID: {uid}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 space-x-6 text-sm bg-slate-950/40">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 font-medium transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'profile'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Demographics</span>
          </button>
          <button
            onClick={() => setActiveTab('personas')}
            className={`py-3 font-medium transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'personas'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Persona Engine</span>
          </button>
          <button
            onClick={() => setActiveTab('farm-map')}
            className={`py-3 font-medium transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'farm-map'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Farm Boundary & Plots</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-sm">Fetching real-time records from 65.20.92.22:8000...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Primary Attributes */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-750">
                      <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Registered Mobile</span>
                      </div>
                      <p className="text-sm font-semibold text-white font-mono">{profile.phone || 'N/A'}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-750">
                      <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                        <Mail className="w-3.5 h-3.5 text-blue-400" />
                        <span>Email Address</span>
                      </div>
                      <p className="text-sm font-semibold text-white">{profile.email || 'None on record'}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-750">
                      <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>Village / Tehsil / District</span>
                      </div>
                      <p className="text-sm font-semibold text-white">
                        {[profile.village, profile.district, profile.state].filter(Boolean).join(', ') || 'Unspecified'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-750">
                      <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                        <Award className="w-3.5 h-3.5 text-purple-400" />
                        <span>Krishi Ratna Tier</span>
                      </div>
                      <p className="text-sm font-semibold text-white">
                        Level {profile.krishiRatnaLevel || 1} — {profile.krishiRatnaTitle || 'Krishi Shishya'}
                      </p>
                    </div>
                  </div>

                  {/* Agricultural Profile */}
                  <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Agricultural Profile Details</h4>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-xs text-slate-400 block">Land Area</span>
                        <span className="font-semibold text-white">{profile.landAreaAcres || 0} Acres</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">Soil Classification</span>
                        <span className="font-semibold text-white">{profile.soilType || 'Not Assayed'}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">Irrigation Type</span>
                        <span className="font-semibold text-white">{profile.irrigationType || 'Rainfed / None'}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">AgriCoins Balance</span>
                        <span className="font-semibold text-emerald-400">{profile.agriCoins || 0} Coins</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">KCC Credit Limit</span>
                        <span className="font-semibold text-white">₹{profile.kccLimit?.toLocaleString() || 0}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">Active Persona</span>
                        <span className="font-semibold text-indigo-400 uppercase text-xs">{profile.activeProfile || profile.primaryProfile || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Administrative Actions */}
                  <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Administrative Governance</h4>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={() => {
                          const nextStatus = profile.status === 'active' ? 'suspended' : 'active';
                          onRequestAuditAction({
                            title: `Change status to ${nextStatus}`,
                            message: `Update account status for ${profile.name || uid} to "${nextStatus}" via /v1/admin/users/{target_uid}/status`,
                            danger: nextStatus === 'suspended',
                            action: async (reason) => {
                              await usersApi.updateUserStatus(uid, nextStatus, reason);
                              const updated = await usersApi.getUserDetails(uid);
                              setData(updated);
                              onRefreshList?.();
                            },
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          profile.status === 'active'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                      >
                        {profile.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                      </button>

                      <button
                        onClick={() => {
                          onRequestAuditAction({
                            title: `Revoke All Sessions for ${profile.name || uid}`,
                            message: `Force logs out this user across all mobile & web instances via /v1/admin/auth/users/{uid}/revoke-sessions`,
                            danger: true,
                            action: async (reason) => {
                              await securityApi.revokeUserSessions(uid, reason);
                            },
                          });
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                      >
                        Revoke Active Sessions
                      </button>

                      <button
                        onClick={() => {
                          onRequestAuditAction({
                            title: `Reset MPIN for ${profile.name || uid}`,
                            message: `Trigger administrative MPIN reset via /v1/admin/auth/users/{uid}/reset-mpin`,
                            action: async (reason) => {
                              await securityApi.resetUserMpin(uid, reason);
                            },
                          });
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 bg-slate-800 text-amber-400 hover:bg-amber-500/10 transition-colors"
                      >
                        Reset User MPIN
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'personas' && (
                <div className="space-y-6">
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-sm font-semibold text-white mb-1">Multi-Persona Assignment</h4>
                    <p className="text-xs text-slate-400">
                      In AGROVERCITY, users can operate across multiple rural personas (e.g. Farmer, Transporter, Vyapari).
                      Modifying personas updates permissions immediately on the mobile app via <code className="text-slate-300">PUT /v1/admin/users/{'{uid}'}/personas</code>.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {AVAILABLE_PERSONAS.map((persona) => {
                      const isSelected = selectedPersonas.includes(persona);
                      return (
                        <div
                          key={persona}
                          onClick={() => handleTogglePersona(persona)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-800/50 border-slate-750 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <span className="font-medium capitalize text-sm">{persona}</span>
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            isSelected ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-800">
                    <button
                      onClick={handleSavePersonas}
                      disabled={savingPersonas}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold flex items-center space-x-2 transition-colors disabled:opacity-50"
                    >
                      {savingPersonas && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Save Persona Assignments</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'farm-map' && (
                <div className="space-y-6">
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-sm font-semibold text-white mb-1">Geographic Land Boundary (Farm Map)</h4>
                    <p className="text-xs text-slate-400">
                      Live data fetched directly from <code className="text-slate-300">GET /v1/admin/users/{'{uid}'}/farm-map</code>.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-750 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Registered Area</span>
                      <span className="text-base font-bold text-white font-mono">
                        {farmMap?.farmBoundary?.landAreaAcres || profile.landAreaAcres || 0} Acres
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Khasra / Survey Number</span>
                      <span className="text-sm font-mono text-emerald-400">
                        {farmMap?.farmBoundary?.khasraNumber || 'Not recorded'}
                      </span>
                    </div>

                    {farmMap?.farmBoundary?.polygon?.length > 0 ? (
                      <div className="space-y-2">
                        <span className="text-xs text-slate-400 block">Polygon GPS Coordinates ({farmMap.farmBoundary.polygon.length} vertices)</span>
                        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 max-h-40 overflow-y-auto font-mono text-xs text-slate-300 space-y-1">
                          {farmMap.farmBoundary.polygon.map((pt, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="text-slate-500">P{idx + 1}:</span>
                              <span>{pt.lat || pt[0]}, {pt.lng || pt[1]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 rounded-lg bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-xs">
                        No polygon boundary coordinates recorded yet for this landholder.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

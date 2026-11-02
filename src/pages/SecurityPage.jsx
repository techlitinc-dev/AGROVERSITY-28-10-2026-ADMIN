import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Users, KeyRound, LogOut, RefreshCw, 
  Save, AlertTriangle, CheckCircle2, Loader2, Clock, ShieldAlert, Sliders 
} from 'lucide-react';
import { securityApi } from '../api/securityApi';
import { AuditReasonModal } from '../components/AuditReasonModal';

export const SecurityPage = () => {
  // Security Policy State
  const [policy, setPolicy] = useState(null);
  const [loadingPolicy, setLoadingPolicy] = useState(true);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [policySuccess, setPolicySuccess] = useState(false);

  // Auth Users State
  const [authUsers, setAuthUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState('');

  // Audit Modal State
  const [auditModal, setAuditModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
    danger: false,
  });

  const fetchPolicy = async () => {
    setLoadingPolicy(true);
    try {
      const res = await securityApi.getSecurityPolicy();
      if (res) {
        setPolicy(res);
      }
    } catch (err) {
      console.error('Failed to load security policy:', err);
    } finally {
      setLoadingPolicy(false);
    }
  };

  const fetchAuthUsers = async () => {
    setLoadingUsers(true);
    setUsersError('');
    try {
      const res = await securityApi.listAuthUsers();
      setAuthUsers(res?.data || []);
    } catch (err) {
      setUsersError(err.response?.data?.error?.message || err.message || 'Failed to list auth users');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
    fetchAuthUsers();
  }, []);

  const handleSavePolicy = () => {
    setAuditModal({
      isOpen: true,
      title: 'Update Global Security Policy',
      message: 'Committing modified authentication and lockout thresholds to PUT /v1/admin/auth/security-policy.',
      danger: true,
      action: async (reason) => {
        setSavingPolicy(true);
        try {
          await securityApi.updateSecurityPolicy(policy, reason);
          setPolicySuccess(true);
          setTimeout(() => setPolicySuccess(false), 3000);
          fetchPolicy();
        } catch (err) {
          alert('Failed to update policy: ' + (err.response?.data?.error?.message || err.message));
        } finally {
          setSavingPolicy(false);
        }
      },
    });
  };

  const handleRevokeSessions = (uid, name) => {
    setAuditModal({
      isOpen: true,
      title: `Revoke Sessions for ${name || uid}`,
      message: `Terminating active JWT/Firebase sessions via POST /v1/admin/auth/users/{uid}/revoke-sessions`,
      danger: true,
      action: async (reason) => {
        await securityApi.revokeUserSessions(uid, reason);
        fetchAuthUsers();
      },
    });
  };

  const handleResetMpin = (uid, name) => {
    setAuditModal({
      isOpen: true,
      title: `Reset MPIN for ${name || uid}`,
      message: `Initiating MPIN reset dispatch via POST /v1/admin/auth/users/{uid}/reset-mpin`,
      danger: false,
      action: async (reason) => {
        await securityApi.resetUserMpin(uid, reason);
        fetchAuthUsers();
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Authentication & Security Center</h2>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
            /v1/admin/auth/*
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          SecOps governance: Global authentication policy, session revocation, and security posture enforcement.
        </p>
      </div>

      {/* Global Security Policy Configuration */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Platform Security Policy</h3>
              <p className="text-xs text-slate-400">
                Governs MPIN enforcement, session validity TTL, and brute-force lockout rules.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {policySuccess && (
              <span className="text-xs text-emerald-400 flex items-center space-x-1 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Policy Updated</span>
              </span>
            )}
            <button
              onClick={handleSavePolicy}
              disabled={loadingPolicy || savingPolicy}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              {savingPolicy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Policy Changes</span>
            </button>
          </div>
        </div>

        {loadingPolicy || !policy ? (
          <div className="py-8 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Toggle 1: Enforce MPIN */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-750 flex items-center justify-between">
              <div>
                <span className="font-semibold text-xs text-white block">Enforce MPIN Onboarding</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Mandatory for all rural app users</span>
              </div>
              <input
                type="checkbox"
                checked={!!policy.enforceMpin}
                onChange={(e) => setPolicy({ ...policy, enforceMpin: e.target.checked })}
                className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900"
              />
            </div>

            {/* Toggle 2: Enforce 2FA */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-750 flex items-center justify-between">
              <div>
                <span className="font-semibold text-xs text-white block">Enforce 2FA Authentication</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">SMS OTP + MPIN dual-factor</span>
              </div>
              <input
                type="checkbox"
                checked={!!policy.enforce2fa}
                onChange={(e) => setPolicy({ ...policy, enforce2fa: e.target.checked })}
                className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900"
              />
            </div>

            {/* Input 1: Session TTL */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-750 space-y-1.5">
              <label className="text-xs font-semibold text-white block">
                Session TTL (Hours)
              </label>
              <input
                type="number"
                min={1}
                max={720}
                value={policy.sessionTtlHours ?? 168}
                onChange={(e) => setPolicy({ ...policy, sessionTtlHours: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-500 block">Default: 168 hrs (7 days)</span>
            </div>

            {/* Input 2: Max Failed MPIN */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-750 space-y-1.5">
              <label className="text-xs font-semibold text-white block">
                Max Failed MPIN Attempts
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={policy.maxFailedMpinAttempts ?? 5}
                onChange={(e) => setPolicy({ ...policy, maxFailedMpinAttempts: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-500 block">Threshold before account lock</span>
            </div>

            {/* Input 3: Lockout Duration */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-750 space-y-1.5">
              <label className="text-xs font-semibold text-white block">
                Lockout Duration (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={1440}
                value={policy.lockoutDurationMinutes ?? 30}
                onChange={(e) => setPolicy({ ...policy, lockoutDurationMinutes: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-500 block">Cooling period for locked accounts</span>
            </div>
          </div>
        )}
      </div>

      {/* Auth Users & Session Revocation Directory */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Active Authentication Accounts</h3>
              <p className="text-xs text-slate-400">
                Directory of credentialed users from <code className="text-slate-300 font-mono">GET /v1/admin/auth/users</code>.
              </p>
            </div>
          </div>

          <button
            onClick={fetchAuthUsers}
            disabled={loadingUsers}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {usersError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{usersError}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">UID</th>
                <th className="py-3 px-4">Identifier / Phone</th>
                <th className="py-3 px-4">Credential Status</th>
                <th className="py-3 px-4">Last Authentication</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loadingUsers ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-emerald-500" />
                    Fetching auth registry...
                  </td>
                </tr>
              ) : authUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No dedicated auth entries returned by <code className="font-mono">/v1/admin/auth/users</code> (Use Users Management roster).
                  </td>
                </tr>
              ) : (
                authUsers.map((u) => (
                  <tr key={u.id || u.uid} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-white">{u.id || u.uid}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{u.phone || u.email || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                        {u.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleResetMpin(u.id || u.uid, u.name)}
                          className="px-2.5 py-1 rounded bg-amber-600/15 hover:bg-amber-600/25 text-amber-400 border border-amber-500/30 text-xs flex items-center space-x-1"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Reset MPIN</span>
                        </button>
                        <button
                          onClick={() => handleRevokeSessions(u.id || u.uid, u.name)}
                          className="px-2.5 py-1 rounded bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-500/30 text-xs flex items-center space-x-1"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Revoke Sessions</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Audit Reason Modal */}
      <AuditReasonModal
        isOpen={auditModal.isOpen}
        title={auditModal.title}
        message={auditModal.message}
        danger={auditModal.danger}
        onClose={() => setAuditModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={async (reason) => {
          if (auditModal.action) {
            await auditModal.action(reason);
          }
          setAuditModal((prev) => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
};

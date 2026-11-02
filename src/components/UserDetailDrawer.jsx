import React, { useState, useEffect } from 'react';
import {
  X, User, Shield, Phone, Mail, MapPin, Calendar, Clock,
  FileCheck2, AlertTriangle, CheckCircle2, XCircle, ArrowUpRight,
  TrendingUp, Truck, Package, ShoppingBag, Star, RefreshCw, Key,
  Copy, Check, FileText, Ban, Lock, Unlock, DollarSign, Layers,
  ExternalLink, Eye, ChevronRight, Activity, Terminal, BadgeCheck, Fingerprint
} from 'lucide-react';
import { usersApi } from '../api/usersApi';
import { AuditReasonModal } from './AuditReasonModal';

export const UserDetailDrawer = ({ userId, isOpen, onClose, onUserUpdated }) => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'activity' | 'content' | 'governance'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Real data state
  const [summary, setSummary] = useState(null);
  const [personasData, setPersonasData] = useState(null);
  const [kycData, setKycData] = useState(null);
  const [kycDocs, setKycDocs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [logins, setLogins] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [contentSummary, setContentSummary] = useState(null);
  const [contentTab, setContentTab] = useState('lots'); // 'lots' | 'orders' | 'trips' | 'uploads' | 'reviews'
  const [contentItems, setContentItems] = useState([]);
  const [contentLoading, setContentLoading] = useState(false);

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({});

  // Image zoom modal
  const [zoomedImage, setZoomedImage] = useState(null);

  // Payload inspect state
  const [inspectedPayload, setInspectedPayload] = useState(null);

  // Wallet adjustment form
  const [walletAmount, setWalletAmount] = useState('');
  const [walletType, setWalletType] = useState('CREDIT');
  const [walletReason, setWalletReason] = useState('');
  const [walletSuccess, setWalletSuccess] = useState('');

  // Persona manage state
  const [selectedPersonas, setSelectedPersonas] = useState([]);
  const [personaSuccess, setPersonaSuccess] = useState('');

  // Impersonation state
  const [impersonateToken, setImpersonateToken] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Audit modal for governance actions
  const [auditModal, setAuditModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
    danger: false,
  });

  const loadUser360 = async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const [sumRes, perRes, kycRes, actRes, logRes, sessRes, cntSumRes] = await Promise.all([
        usersApi.fetchUser360(userId),
        usersApi.fetchUserPersonas(userId).catch(() => null),
        usersApi.fetchUserKyc(userId).catch(() => ({ documents: [] })),
        usersApi.fetchUserActivities(userId).catch(() => ({ activities: [] })),
        usersApi.fetchUserLogins(userId).catch(() => ({ logins: [] })),
        usersApi.fetchUserSessions(userId).catch(() => ({ sessions: [] })),
        usersApi.fetchUserContentSummary(userId).catch(() => null),
      ]);

      setSummary(sumRes);
      setPersonasData(perRes);
      setKycData(kycRes);
      setKycDocs(kycRes.documents || []);
      setActivities(actRes.activities || []);
      setLogins(logRes.logins || []);
      setSessions(sessRes.sessions || []);
      setContentSummary(cntSumRes);

      // Prepopulate edit form
      setEditProfileForm({
        full_name: sumRes.full_name || '',
        phone: sumRes.phone || '',
        email: sumRes.email || '',
        state: perRes?.farmer?.state || '',
        district: perRes?.farmer?.district || '',
        address: '',
      });

      // Prepopulate personas list
      const roles = (sumRes.personas || []).map((p) => p.role.toLowerCase());
      setSelectedPersonas(roles);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to load User 360 data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      loadUser360();
    }
  }, [isOpen, userId]);

  // Load content entities when tab changes
  useEffect(() => {
    if (!userId || activeTab !== 'content') return;
    const loadContentItems = async () => {
      setContentLoading(true);
      try {
        if (contentTab === 'lots') {
          const res = await usersApi.fetchUserLots(userId);
          setContentItems(res.lots || []);
        } else if (contentTab === 'orders') {
          const res = await usersApi.fetchUserOrders(userId);
          setContentItems(res.orders || []);
        } else if (contentTab === 'trips') {
          const res = await usersApi.fetchUserTransportTrips(userId);
          setContentItems(res.trips || []);
        } else if (contentTab === 'uploads') {
          const res = await usersApi.fetchUserUploads(userId);
          setContentItems(res.uploads || []);
        } else if (contentTab === 'reviews') {
          const res = await usersApi.fetchUserReviews(userId);
          setContentItems(res.reviews || []);
        }
      } catch (err) {
        console.error('Error loading content items:', err);
      } finally {
        setContentLoading(false);
      }
    };
    loadContentItems();
  }, [userId, activeTab, contentTab]);

  if (!isOpen) return null;

  // Handle Profile Update
  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await usersApi.updateUserProfile(userId, editProfileForm);
      setIsEditingProfile(false);
      await loadUser360();
      if (onUserUpdated) onUserUpdated();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Profile update failed');
    }
  };

  // Handle KYC Decision Override
  const handleKycOverride = (newStatus, docId = null) => {
    setAuditModal({
      isOpen: true,
      title: `Override KYC: ${newStatus}`,
      message: `Set KYC status to ${newStatus} for user ${userId}. Provide administrative justification.`,
      danger: newStatus === 'REJECTED',
      action: async (reason) => {
        await usersApi.overrideUserKyc(userId, { status: newStatus, remarks: reason, document_id: docId });
        await loadUser360();
        if (onUserUpdated) onUserUpdated();
      },
    });
  };

  // Handle Account Status Change
  const handleStatusChange = (newStatus) => {
    const isDangerous = newStatus === 'SUSPENDED' || newStatus === 'BANNED';
    setAuditModal({
      isOpen: true,
      title: `Account Status Governance: ${newStatus}`,
      message: isDangerous
        ? `Marking this account as ${newStatus} will instantly revoke all open JWT sessions and blacklist active tokens in Redis.`
        : `Reactivate account status to ${newStatus}.`,
      danger: isDangerous,
      action: async (reason) => {
        await usersApi.updateUserStatus(userId, newStatus, reason);
        await loadUser360();
        if (onUserUpdated) onUserUpdated();
      },
    });
  };

  // Handle Session Revoke
  const handleRevokeSessions = () => {
    setAuditModal({
      isOpen: true,
      title: 'Revoke All User Sessions',
      message: 'This will terminate all mobile, tablet, and web sessions for this account immediately.',
      danger: true,
      action: async (reason) => {
        await usersApi.revokeUserSessions(userId, 'all', reason);
        await loadUser360();
      },
    });
  };

  // Handle Wallet Adjustment
  const handleWalletSubmit = async (e) => {
    e.preventDefault();
    if (!walletAmount || !walletReason) return;
    try {
      await usersApi.adjustUserWallet(userId, {
        amount: walletAmount,
        type: walletType,
        reason: walletReason,
      });
      setWalletSuccess(`Successfully adjusted wallet with ${walletType} ₹${walletAmount}`);
      setWalletAmount('');
      setWalletReason('');
      setTimeout(() => setWalletSuccess(''), 4000);
      await loadUser360();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Wallet adjustment failed');
    }
  };

  // Handle Persona Assignment
  const handlePersonaSave = async () => {
    try {
      await usersApi.assignUserPersonas(userId, selectedPersonas);
      setPersonaSuccess('Personas updated successfully!');
      setTimeout(() => setPersonaSuccess(''), 3000);
      await loadUser360();
      if (onUserUpdated) onUserUpdated();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to assign personas');
    }
  };

  // Handle Impersonation
  const handleImpersonate = async () => {
    try {
      const res = await usersApi.impersonateUser(userId);
      setImpersonateToken(res.token);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Impersonation failed');
    }
  };

  // Handle Content Takedown
  const handleContentDelete = (entityType, entityId) => {
    setAuditModal({
      isOpen: true,
      title: `Takedown ${entityType}`,
      message: `Confirm moderation takedown of entity #${entityId}. This action is permanent and logged in compliance audit trail.`,
      danger: true,
      action: async (reason) => {
        await usersApi.deleteUserContent(userId, entityType, entityId, reason);
        // Refresh content
        const res = await usersApi.fetchUserLots(userId);
        setContentItems(res.lots || []);
      },
    });
  };

  // Handle Export
  const handleExportDossier = async (format) => {
    try {
      const data = await usersApi.exportUserDossier(userId, format);
      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `user_${userId}_dossier.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonStr);
        downloadAnchor.setAttribute('download', `user_${userId}_dossier.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    } catch (err) {
      alert('Failed to export dossier');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-3xl bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl">
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-emerald-950/50">
                {(summary?.full_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h2 className="text-lg font-bold text-white">{summary?.full_name || 'Unnamed User'}</h2>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                    summary?.status === 'ACTIVE'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : summary?.status === 'SUSPENDED'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      : 'bg-red-500/15 border-red-500/30 text-red-400'
                  }`}>
                    {summary?.status || 'ACTIVE'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                    (kycData?.kycStatus || summary?.kyc_status)?.toUpperCase() === 'VERIFIED'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : (kycData?.kycStatus || summary?.kyc_status)?.toUpperCase() === 'REJECTED'
                      ? 'bg-red-500/15 border-red-500/30 text-red-400'
                      : (kycData?.kycStatus || summary?.kyc_status)?.toUpperCase() === 'RESUBMISSION_REQUESTED'
                      ? 'bg-sky-500/15 border-sky-500/30 text-sky-400'
                      : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  }`}>
                    KYC: {kycData?.kycStatus || summary?.kyc_status || 'PENDING'}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1 font-mono">
                  <span>ID: <code className="text-emerald-400">{userId}</code></span>
                  <span>&bull;</span>
                  <span>{summary?.phone || 'No phone'}</span>
                  <span>&bull;</span>
                  <span>Trust Score: <strong className="text-white">{summary?.trust_score !== undefined ? `${summary.trust_score}/100` : 'N/A'}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={`/users/${userId}`}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-semibold transition-all flex items-center space-x-1"
                title="Open Full Single User Dashboard"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </a>
              <button
                onClick={loadUser360}
                title="Reload User 360 data"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-6">
            {[
              { id: 'profile', label: '1. Profile & Identity', icon: User },
              { id: 'activity', label: '2. Activity Log', icon: Activity },
              { id: 'content', label: '3. Content & Commercials', icon: Package },
              { id: 'governance', label: '4. Governance & Security', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-3.5 px-4 text-xs font-semibold border-b-2 transition-all ${
                    isActive
                      ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3 font-mono text-xs">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
                <span>Aggregating User 360° Profile from Live Firestore...</span>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-400">
                {error}
              </div>
            ) : (
              <>
                {/* ============================================================== */}
                {/* TAB 1: PROFILE & IDENTITY */}
                {/* ============================================================== */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    {/* Personas Chips */}
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                        Active Personas Matrix
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(summary?.personas || []).map((p) => (
                          <div
                            key={p.role}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-750 flex items-center space-x-2 text-xs"
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="font-bold text-white">{p.role}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {p.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Profile Information & Inline Edit */}
                    <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                          Identity Metadata
                        </h4>
                        <button
                          onClick={() => setIsEditingProfile(!isEditingProfile)}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                        >
                          {isEditingProfile ? 'Cancel' : 'Edit Metadata'}
                        </button>
                      </div>

                      {isEditingProfile ? (
                        <form onSubmit={handleProfileSave} className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">Full Name</label>
                              <input
                                type="text"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                                value={editProfileForm.full_name}
                                onChange={(e) => setEditProfileForm({ ...editProfileForm, full_name: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">Phone</label>
                              <input
                                type="text"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                                value={editProfileForm.phone}
                                onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">Email</label>
                              <input
                                type="email"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                                value={editProfileForm.email}
                                onChange={(e) => setEditProfileForm({ ...editProfileForm, email: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">State</label>
                              <input
                                type="text"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                                value={editProfileForm.state}
                                onChange={(e) => setEditProfileForm({ ...editProfileForm, state: e.target.value })}
                              />
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-white"
                          >
                            Save Profile Corrections
                          </button>
                        </form>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Full Name</span>
                            <span className="font-semibold text-white">{summary?.full_name || '—'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Registered Phone</span>
                            <span className="font-mono text-emerald-400">{summary?.phone || '—'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Email</span>
                            <span className="text-white">{summary?.email || 'Not linked'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Registered Date</span>
                            <span className="text-white font-mono">
                              {summary?.created_at ? new Date(summary.created_at).toLocaleString() : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Last Active / Login</span>
                            <span className="text-white font-mono">
                              {summary?.last_login ? new Date(summary.last_login).toLocaleString() : 'Never logged in'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Linked Bank Account</span>
                            <span className="text-emerald-400 font-mono">
                              {summary?.bank_account || summary?.bankName ? `${summary.bankName || 'Bank'} (${summary.bank_account || 'Linked'})` : 'No bank linked'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* DigiLocker & National Identity Verification Card */}
                    <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Fingerprint className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-1.5">
                              <span>DigiLocker & Identity Verification</span>
                              {(kycData?.kycStatus || summary?.kyc_status)?.toUpperCase() === 'VERIFIED' && (
                                <BadgeCheck className="w-4 h-4 text-emerald-400 inline" />
                              )}
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              Direct verification via Sandbox.co.in / UIDAI DigiLocker Gateway
                            </p>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          (kycData?.kycStatus || summary?.kyc_status)?.toUpperCase() === 'VERIFIED'
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : (kycData?.kycStatus || summary?.kyc_status)?.toUpperCase() === 'REJECTED'
                            ? 'bg-red-500/15 border-red-500/30 text-red-400'
                            : (kycData?.kycStatus || summary?.kyc_status)?.toUpperCase() === 'RESUBMISSION_REQUESTED'
                            ? 'bg-sky-500/15 border-sky-500/30 text-sky-400'
                            : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                        }`}>
                          {kycData?.kycStatus || summary?.kyc_status || 'PENDING'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Masked Aadhaar</span>
                          <span className="font-mono text-emerald-400 font-semibold">
                            {kycData?.maskedAadhaar || summary?.masked_aadhaar || 'Not Linked'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Verified Name</span>
                          <span className="text-white font-medium">
                            {kycData?.verifiedName || summary?.verified_name || 'Not Verified'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Verification Mode</span>
                          <span className="font-mono text-slate-300 uppercase">
                            {(() => {
                              const mode = kycData?.verificationMode || summary?.verification_mode;
                              if (!mode || mode.toLowerCase() === 'mock') return '—';
                              return mode;
                            })()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Verified At</span>
                          <span className="font-mono text-slate-300">
                            {kycData?.kycVerifiedAt || summary?.kyc_verified_at
                              ? new Date(kycData?.kycVerifiedAt || summary?.kyc_verified_at).toLocaleString()
                              : 'Pending'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Digital Signature</span>
                          <span className="text-slate-300 font-mono">
                            {(kycData?.signatureVerified || summary?.signature_verified) ? 'Cryptographically Verified' : 'Standard'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Reviewer Remarks</span>
                          <span className="text-slate-300 truncate block">
                            {kycData?.kycRemarks || summary?.kyc_remarks || 'None'}
                          </span>
                        </div>
                      </div>

                      {/* Sessions History if available */}
                      {kycData?.sessions && kycData.sessions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-800/80">
                          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-2">
                            Recorded KYC Sessions ({kycData.sessions.length})
                          </span>
                          <div className="space-y-1.5">
                            {kycData.sessions.map((sess) => (
                              <div
                                key={sess.id}
                                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-[11px]"
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono text-emerald-400">{sess.id}</span>
                                  <span className="text-slate-500">&bull;</span>
                                  <span className="text-slate-300 capitalize">{sess.method && sess.method.toLowerCase() !== 'mock' ? sess.method : '—'} {sess.provider ? `(${sess.provider})` : ''}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-slate-400 font-mono">
                                    {sess.completedAt ? new Date(sess.completedAt).toLocaleDateString() : 'In Progress'}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                    sess.status === 'verified'
                                      ? 'bg-emerald-500/20 text-emerald-400'
                                      : sess.status === 'denied' || sess.status === 'failed'
                                      ? 'bg-red-500/20 text-red-400'
                                      : 'bg-amber-500/20 text-amber-400'
                                  }`}>
                                    {sess.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* KYC Document Vault & Decision Controls */}
                    <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                            Document Vault & Verification Controls
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Review identity proofs (Aadhaar, 7/12 Land Record, Mandi License, RC)
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleKycOverride('VERIFIED')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve KYC</span>
                          </button>
                          <button
                            onClick={() => handleKycOverride('REJECTED')}
                            className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-semibold transition-all flex items-center space-x-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                          <button
                            onClick={() => handleKycOverride('RESUBMISSION_REQUESTED')}
                            className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 text-xs font-semibold transition-all"
                          >
                            Request Re-upload
                          </button>
                        </div>
                      </div>

                      {kycDocs.length === 0 ? (
                        <div className="py-8 px-4 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/40">
                          <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                          <p className="text-xs text-slate-300 font-medium">No document files attached</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Documents pulled from DigiLocker or uploaded via case pipeline will appear here.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {kycDocs.map((doc) => (
                            <div
                              key={doc.id || doc.docId}
                              className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-3 relative group"
                            >
                              {doc.fileUrl ? (
                                <div className="h-32 rounded-lg overflow-hidden bg-slate-950 relative border border-slate-800">
                                  <img
                                    src={doc.fileUrl}
                                    alt={doc.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                                    onClick={() => setZoomedImage(doc.fileUrl)}
                                  />
                                </div>
                              ) : (
                                <div className="h-20 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                                  <FileText className="w-6 h-6 mr-2 text-slate-400" />
                                  <span className="text-xs">Document record</span>
                                </div>
                              )}

                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-semibold text-white truncate max-w-[170px]">{doc.name}</span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                    doc.status === 'VERIFIED'
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : doc.status === 'REJECTED'
                                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                      : doc.status === 'RESUBMISSION_REQUESTED'
                                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  }`}>
                                    {doc.status}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                                  <span className="capitalize">{doc.source ? doc.source.replace('_', ' ') : 'Upload'}</span>
                                  <span>{doc.submittedAt ? new Date(doc.submittedAt).toLocaleDateString() : '—'}</span>
                                </div>

                                {doc.reason && (
                                  <p className="text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded mt-1">
                                    <strong>Note:</strong> {doc.reason}
                                  </p>
                                )}
                              </div>

                              {/* Per-document decision buttons */}
                              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleKycOverride('VERIFIED', doc.id || doc.docId)}
                                  className="px-2 py-1 rounded bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white text-[11px] font-medium transition-colors"
                                >
                                  Verify
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleKycOverride('REJECTED', doc.id || doc.docId)}
                                  className="px-2 py-1 rounded bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white text-[11px] font-medium transition-colors"
                                >
                                  Reject
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleKycOverride('RESUBMISSION_REQUESTED', doc.id || doc.docId)}
                                  className="px-2 py-1 rounded bg-amber-600/15 hover:bg-amber-600 text-amber-400 hover:text-white text-[11px] font-medium transition-colors"
                                >
                                  Resubmit
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ============================================================== */}
                {/* TAB 2: ACTIVITY LOG */}
                {/* ============================================================== */}
                {activeTab === 'activity' && (
                  <div className="space-y-6">
                    {/* Active Sessions Overview */}
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-white">Active Sessions & Devices</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {sessions.length} active JWT tokens recorded in Redis cache
                        </p>
                      </div>
                      <button
                        onClick={handleRevokeSessions}
                        className="px-3 py-1.5 rounded-xl bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 text-xs font-semibold transition-all"
                      >
                        Revoke All Sessions
                      </button>
                    </div>

                    {/* Chronological Activity Feed */}
                    <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Chronological Telemetry Feed
                      </h4>

                      <div className="space-y-3">
                        {activities.map((act) => (
                          <div
                            key={act.id}
                            className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-start justify-between text-xs"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Activity className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-white font-mono">{act.eventType}</span>
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">
                                    {act.category || 'auth'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1">
                                  <span>IP: <code className="text-slate-300">{act.ipAddress}</code></span>
                                  <span>&bull;</span>
                                  <span>{new Date(act.timestamp).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>

                            {act.payload && (
                              <button
                                onClick={() => setInspectedPayload(act.payload)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-[11px] text-slate-300 flex items-center space-x-1"
                              >
                                <Terminal className="w-3 h-3 text-emerald-400" />
                                <span>Inspect</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Historical Login Log */}
                    <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Historical Login Records
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px]">
                              <th className="py-2">TIMESTAMP</th>
                              <th className="py-2">IP ADDRESS</th>
                              <th className="py-2">DEVICE / OS</th>
                              <th className="py-2">GEO LOCATION</th>
                              <th className="py-2">METHOD</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {logins.map((lg) => (
                              <tr key={lg.id}>
                                <td className="py-2 font-mono text-slate-300">{new Date(lg.timestamp).toLocaleString()}</td>
                                <td className="py-2 font-mono text-emerald-400">{lg.ipAddress}</td>
                                <td className="py-2 text-slate-300">{lg.device}</td>
                                <td className="py-2 text-slate-300">{lg.geoLocation}</td>
                                <td className="py-2 font-mono text-slate-400">{lg.authMethod}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ============================================================== */}
                {/* TAB 3: CONTENT & COMMERCIALS */}
                {/* ============================================================== */}
                {activeTab === 'content' && (
                  <div className="space-y-6">
                    {/* Content Metric Counters */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Produce Lots</span>
                        <p className="text-xl font-black text-white mt-0.5">{contentSummary?.lotsCount || 0}</p>
                      </div>
                      <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Orders Completed</span>
                        <p className="text-xl font-black text-emerald-400 mt-0.5">{contentSummary?.ordersCount || 0}</p>
                      </div>
                      <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Transport Trips</span>
                        <p className="text-xl font-black text-blue-400 mt-0.5">{contentSummary?.tripsCount || 0}</p>
                      </div>
                      <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Media Uploads</span>
                        <p className="text-xl font-black text-purple-400 mt-0.5">{contentSummary?.uploadsCount || 0}</p>
                      </div>
                    </div>

                    {/* Sub-Tabs for Entities */}
                    <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                      {['lots', 'orders', 'trips', 'uploads', 'reviews'].map((cTab) => (
                        <button
                          key={cTab}
                          onClick={() => setContentTab(cTab)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                            contentTab === cTab
                              ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {cTab}
                        </button>
                      ))}
                    </div>

                    {/* Content Items List */}
                    <div className="space-y-3">
                      {contentLoading ? (
                        <div className="py-10 text-center text-xs text-slate-400 font-mono">
                          Loading {contentTab} from Firestore...
                        </div>
                      ) : contentItems.length === 0 ? (
                        <div className="py-10 text-center text-xs text-slate-500 font-mono bg-slate-950/40 rounded-2xl border border-slate-800/80">
                          No {contentTab} records registered under user UID {userId}
                        </div>
                      ) : (
                        contentItems.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div className="space-y-1">
                              <span className="font-semibold text-white block">
                                {item.title || item.crop || item.fileName || item.id}
                              </span>
                              <span className="text-slate-400 block text-[11px]">
                                {item.status && <strong className="text-emerald-400 uppercase">{item.status} &bull; </strong>}
                                {item.price && `Price: ₹${item.price} • `}
                                {item.createdAt && new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <button
                              onClick={() => handleContentDelete(contentTab, item.id || idx)}
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 text-xs font-semibold transition-all"
                            >
                              Takedown / Flag
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* ============================================================== */}
                {/* TAB 4: GOVERNANCE & SECURITY */}
                {/* ============================================================== */}
                {activeTab === 'governance' && (
                  <div className="space-y-6">
                    {/* Account Health & Status Toggles */}
                    <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-semibold text-white">Account Status Controls</h4>
                          <p className="text-[11px] text-slate-400">
                            Current Status: <strong className="text-emerald-400 font-mono">{summary?.status || 'ACTIVE'}</strong>
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleStatusChange('ACTIVE')}
                            disabled={summary?.status === 'ACTIVE'}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold"
                          >
                            Set ACTIVE
                          </button>
                          <button
                            onClick={() => handleStatusChange('SUSPENDED')}
                            disabled={summary?.status === 'SUSPENDED'}
                            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold"
                          >
                            Suspend Account
                          </button>
                          <button
                            onClick={() => handleStatusChange('BANNED')}
                            disabled={summary?.status === 'BANNED'}
                            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold"
                          >
                            Permanent Ban
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Manual Ledger Adjustment Form */}
                    <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Manual Ledger Adjustment (Disputes / Payouts / Credits)
                      </h4>
                      {walletSuccess && (
                        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs">
                          {walletSuccess}
                        </div>
                      )}
                      <form onSubmit={handleWalletSubmit} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Adjustment Type</label>
                            <select
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                              value={walletType}
                              onChange={(e) => setWalletType(e.target.value)}
                            >
                              <option value="CREDIT">CREDIT (+)</option>
                              <option value="DEBIT">DEBIT (-)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Amount in INR (₹)</label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              placeholder="500.00"
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                              value={walletAmount}
                              onChange={(e) => setWalletAmount(e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Mandatory Audit Reason</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Escrow settlement for lot #4901"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                            value={walletReason}
                            onChange={(e) => setWalletReason(e.target.value)}
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-white"
                        >
                          Execute Ledger Adjustment
                        </button>
                      </form>
                    </div>

                    {/* Persona Management Checkboxes */}
                    <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                          Assign / Strip Persona Roles
                        </h4>
                        {personaSuccess && <span className="text-xs text-emerald-400">{personaSuccess}</span>}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {['farmer', 'transporter', 'seller', 'nursery', 'vyapari', 'equipmentRental', 'farmLandlord'].map((role) => {
                          const isChecked = selectedPersonas.includes(role);
                          return (
                            <label
                              key={role}
                              className={`flex items-center space-x-2 p-2.5 rounded-xl border cursor-pointer text-xs transition-colors ${
                                isChecked
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-400'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="rounded text-emerald-500 focus:ring-0 bg-slate-950 border-slate-800"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPersonas([...selectedPersonas, role]);
                                  } else {
                                    setSelectedPersonas(selectedPersonas.filter((r) => r !== role));
                                  }
                                }}
                              />
                              <span className="capitalize">{role}</span>
                            </label>
                          );
                        })}
                      </div>

                      <button
                        onClick={handlePersonaSave}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-semibold border border-slate-700"
                      >
                        Save Persona Assignments
                      </button>
                    </div>

                    {/* Impersonation Token Generator */}
                    <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Scoped Administrative Impersonation
                      </h4>
                      <p className="text-xs text-slate-400">
                        Generate a short-lived (15 min) JWT containing claim <code className="text-emerald-400">impersonated_by: superadmin</code>.
                        Logged in the immutable audit trail for GDPR compliance.
                      </p>

                      {impersonateToken ? (
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                          <span className="text-[10px] text-emerald-400 font-mono font-bold">15-MIN TOKEN GENERATED</span>
                          <textarea
                            readOnly
                            rows={3}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-[10px] text-slate-300"
                            value={impersonateToken}
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(impersonateToken);
                              setCopiedToken(true);
                              setTimeout(() => setCopiedToken(false), 2000);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 rounded-lg text-xs font-semibold text-white flex items-center space-x-1"
                          >
                            {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedToken ? 'Copied' : 'Copy Token'}</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleImpersonate}
                          className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Generate Impersonation Token</span>
                        </button>
                      )}
                    </div>

                    {/* Export Dossier */}
                    <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-white">Export Full User Dossier</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Download compliance archive for GDPR / State Agriculture audit
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleExportDossier('json')}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold border border-slate-700"
                        >
                          JSON Archive
                        </button>
                        <button
                          onClick={() => handleExportDossier('csv')}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold border border-slate-700"
                        >
                          CSV Sheet
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-red-400"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={zoomedImage} alt="Zoomed document" className="max-w-full max-h-[85vh] rounded-xl object-contain" />
          </div>
        </div>
      )}

      {/* Payload Inspector Drawer */}
      {inspectedPayload && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-mono text-emerald-400">TELEMETRY PAYLOAD INSPECTOR</h3>
              <button onClick={() => setInspectedPayload(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 max-h-96 overflow-y-auto">
              {JSON.stringify(inspectedPayload, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Mandatory Audit Reason Modal */}
      <AuditReasonModal
        isOpen={auditModal.isOpen}
        onClose={() => setAuditModal({ ...auditModal, isOpen: false })}
        onConfirm={auditModal.action}
        title={auditModal.title}
        message={auditModal.message}
        danger={auditModal.danger}
      />
    </div>
  );
};

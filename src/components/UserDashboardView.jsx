import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, RefreshCw, Key, Download, Shield, ShieldAlert,
  CheckCircle2, XCircle, AlertCircle, Fingerprint, BadgeCheck,
  Phone, Mail, MapPin, Calendar, Clock, DollarSign, Wallet,
  TrendingUp, Truck, Package, ShoppingBag, Star, Layers,
  ExternalLink, Eye, ChevronRight, Activity, Terminal, FileText,
  User, Edit3, Trash2, Check, Copy, Ban, Lock, Unlock,
  SlidersHorizontal, Filter, Search, ChevronDown, Sparkles,
  Wheat, Coins, Award
} from 'lucide-react';
import { usersApi } from '../api/usersApi';
import { AuditReasonModal } from './AuditReasonModal';

export const UserDashboardView = ({ userId, onBack, onUserUpdated }) => {
  // Navigation & view state
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' (Single User Dashboard) | 'activities' | 'content' | 'governance'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Core Data
  const [summary, setSummary] = useState(null);
  const [personasData, setPersonasData] = useState(null);
  const [kycData, setKycData] = useState(null);
  const [kycDocs, setKycDocs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [logins, setLogins] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [contentSummary, setContentSummary] = useState(null);

  // Activities filter state (All real, zero mock data)
  const [activityCategory, setActivityCategory] = useState(''); // '' | 'auth' | 'transact' | 'content' | 'system' | 'governance'
  const [activityDatePreset, setActivityDatePreset] = useState('all'); // 'all' | 'today' | '7d' | '30d' | 'custom'
  const [activityStartDate, setActivityStartDate] = useState('');
  const [activityEndDate, setActivityEndDate] = useState('');
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [activityStatusFilter, setActivityStatusFilter] = useState('all'); // 'all' | 'success' | 'error'
  const [activitySortOrder, setActivitySortOrder] = useState('desc'); // 'desc' | 'asc'
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // Content tab state
  const [contentTab, setContentTab] = useState('lots'); // 'lots' | 'orders' | 'trips' | 'uploads' | 'reviews'
  const [contentItems, setContentItems] = useState([]);
  const [contentLoading, setContentLoading] = useState(false);

  // Modals & inspect state
  const [zoomedImage, setZoomedImage] = useState(null);
  const [inspectedPayload, setInspectedPayload] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAdjustingWallet, setIsAdjustingWallet] = useState(false);
  const [isAssigningPersonas, setIsAssigningPersonas] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Forms state
  const [editProfileForm, setEditProfileForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    district: '',
    state: '',
    preferred_language: 'hi',
  });

  const [walletForm, setWalletForm] = useState({
    amount: '',
    type: 'CREDIT',
    reason: '',
  });

  const [selectedPersonas, setSelectedPersonas] = useState([]);

  // Audit modal state
  const [auditModal, setAuditModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
    danger: false,
  });

  // Load all user data (strictly live endpoints, zero mock/static data)
  const loadUserData = async (isSilent = false) => {
    if (!userId) return;
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError('');

    try {
      const [sumRes, perRes, kycRes, actRes, logRes, sessRes, cntSumRes, audRes, baseUserRes] = await Promise.all([
        usersApi.fetchUser360(userId),
        usersApi.fetchUserPersonas(userId).catch(() => null),
        usersApi.fetchUserKyc(userId).catch(() => ({ documents: [], sessions: [] })),
        usersApi.fetchUserActivities(userId, {
          category: activityCategory,
          start_date: activityStartDate,
          end_date: activityEndDate,
        }).catch(() => ({ activities: [] })),
        usersApi.fetchUserLogins(userId).catch(() => ({ logins: [] })),
        usersApi.fetchUserSessions(userId).catch(() => ({ sessions: [] })),
        usersApi.fetchUserContentSummary(userId).catch(() => null),
        usersApi.fetchUserAuditTrail(userId).catch(() => ({ auditTrail: [] })),
        usersApi.fetchUsers({ q: userId }).catch(() => null),
      ]);

      const baseList = baseUserRes?.users || baseUserRes?.data || [];
      const baseUser = baseList.find(u => u.id === userId) || {};

      const mergedSummary = {
        ...baseUser,
        ...sumRes,
        district: sumRes?.district || baseUser?.district || '',
        state: sumRes?.state || baseUser?.state || '',
        village: sumRes?.village || baseUser?.village || '',
        full_name: sumRes?.full_name || baseUser?.name || baseUser?.fullName || '',
        phone: sumRes?.phone || baseUser?.phone || '',
        email: sumRes?.email || baseUser?.email || '',
        status: sumRes?.status || (baseUser?.status ? baseUser.status.toUpperCase() : 'ACTIVE'),
        kyc_status: sumRes?.kyc_status || (baseUser?.kycStatus ? baseUser.kycStatus.toUpperCase() : 'PENDING'),
        created_at: sumRes?.created_at || baseUser?.createdAt || baseUser?.created_at,
        masked_aadhaar: sumRes?.masked_aadhaar || baseUser?.maskedAadhaar || kycRes?.maskedAadhaar || '',
        verified_name: sumRes?.verified_name || baseUser?.verifiedName || kycRes?.verifiedName || '',
        verification_mode: sumRes?.verification_mode || baseUser?.verificationMode || kycRes?.verificationMode || '',
      };

      setSummary(mergedSummary);
      setPersonasData(perRes);
      setKycData(kycRes);
      setKycDocs(kycRes?.documents || []);

      // Real activities combination (zero static data)
      const rawActivities = [
        ...(actRes?.activities || []),
        ...((sumRes?.recent_activities || []).map(ra => ({
          id: ra.id,
          timestamp: ra.timestamp,
          eventType: ra.event_type || ra.eventType,
          category: ra.category || (ra.resource === 'auth' ? 'auth' : 'system'),
          resource: ra.resource,
          ipAddress: ra.ip_address || ra.ipAddress,
          device: ra.device,
          statusCode: ra.status_code || ra.statusCode || 200,
          payload: ra.payload_summary || ra.payload,
        }))),
      ];

      const uniqueActivitiesMap = new Map();
      rawActivities.forEach(item => {
        const key = item.id || `${item.timestamp}-${item.eventType}`;
        if (!uniqueActivitiesMap.has(key)) {
          uniqueActivitiesMap.set(key, item);
        }
      });
      setActivities(Array.from(uniqueActivitiesMap.values()));

      setLogins(logRes?.logins || []);
      setSessions(sessRes?.sessions || []);
      setContentSummary(cntSumRes);
      setAuditTrail(audRes?.auditTrail || audRes?.audit_trail || []);

      // Prepopulate edit forms
      setEditProfileForm({
        full_name: sumRes?.full_name || '',
        phone: sumRes?.phone || '',
        email: sumRes?.email || '',
        district: sumRes?.district || '',
        state: sumRes?.state || '',
        preferred_language: sumRes?.preferred_language || 'hi',
      });

      setSelectedPersonas(sumRes?.personas?.map(p => p.role.toLowerCase()) || []);
    } catch (err) {
      console.error('Error loading user dashboard:', err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to load user dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [userId]);

  // Load activities when server-level filters change
  const reloadActivities = async () => {
    setActivitiesLoading(true);
    try {
      const actRes = await usersApi.fetchUserActivities(userId, {
        category: activityCategory,
        start_date: activityStartDate,
        end_date: activityEndDate,
      });

      const rawActivities = [
        ...(actRes?.activities || []),
        ...((summary?.recent_activities || []).map(ra => ({
          id: ra.id,
          timestamp: ra.timestamp,
          eventType: ra.event_type || ra.eventType,
          category: ra.category || (ra.resource === 'auth' ? 'auth' : 'system'),
          resource: ra.resource,
          ipAddress: ra.ip_address || ra.ipAddress,
          device: ra.device,
          statusCode: ra.status_code || ra.statusCode || 200,
          payload: ra.payload_summary || ra.payload,
        }))),
      ];

      const uniqueActivitiesMap = new Map();
      rawActivities.forEach(item => {
        const key = item.id || `${item.timestamp}-${item.eventType}`;
        if (!uniqueActivitiesMap.has(key)) {
          uniqueActivitiesMap.set(key, item);
        }
      });
      setActivities(Array.from(uniqueActivitiesMap.values()));
    } catch (err) {
      console.error('Failed to reload activities:', err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      reloadActivities();
    }
  }, [activityCategory, activityStartDate, activityEndDate]);

  // Date Preset Switcher
  const handleDatePresetChange = (preset) => {
    setActivityDatePreset(preset);
    const now = new Date();
    if (preset === 'all') {
      setActivityStartDate('');
      setActivityEndDate('');
    } else if (preset === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      setActivityStartDate(start.toISOString());
      setActivityEndDate(now.toISOString());
    } else if (preset === '7d') {
      const sevenAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      setActivityStartDate(sevenAgo.toISOString());
      setActivityEndDate(now.toISOString());
    } else if (preset === '30d') {
      const thirtyAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      setActivityStartDate(thirtyAgo.toISOString());
      setActivityEndDate(now.toISOString());
    }
  };

  // Reset all activity filters
  const handleResetActivityFilters = () => {
    setActivityCategory('');
    setActivityDatePreset('all');
    setActivityStartDate('');
    setActivityEndDate('');
    setActivitySearchQuery('');
    setActivityStatusFilter('all');
    setActivitySortOrder('desc');
  };

  const hasActiveActivityFilters = Boolean(
    activityCategory ||
    activityDatePreset !== 'all' ||
    activityStartDate ||
    activityEndDate ||
    activitySearchQuery ||
    activityStatusFilter !== 'all' ||
    activitySortOrder !== 'desc'
  );

  // Client-side instant multi-criteria filtering & sorting (zero static data)
  const filteredActivities = React.useMemo(() => {
    let list = [...activities];

    // 1. Category filter
    if (activityCategory) {
      list = list.filter(a => {
        const cat = (a.category || '').toLowerCase();
        const ev = (a.eventType || '').toLowerCase();
        if (activityCategory === 'auth') {
          return cat === 'auth' || ev.includes('login') || ev.includes('register') || ev.includes('auth') || ev.includes('mpin') || ev.includes('otp');
        }
        if (activityCategory === 'transact') {
          return cat === 'transact' || ev.includes('order') || ev.includes('bid') || ev.includes('payment') || ev.includes('wallet');
        }
        if (activityCategory === 'content') {
          return cat === 'content' || ev.includes('lot') || ev.includes('upload') || ev.includes('trip') || ev.includes('product');
        }
        if (activityCategory === 'governance') {
          return cat === 'governance' || ev.includes('status') || ev.includes('kyc') || ev.includes('ban') || ev.includes('admin') || ev.includes('suspend');
        }
        if (activityCategory === 'system') {
          return cat === 'system' || cat === 'telemetry';
        }
        return cat === activityCategory.toLowerCase();
      });
    }

    // 2. Status filter
    if (activityStatusFilter === 'success') {
      list = list.filter(a => !a.statusCode || (a.statusCode >= 200 && a.statusCode < 300));
    } else if (activityStatusFilter === 'error') {
      list = list.filter(a => a.statusCode && a.statusCode >= 400);
    }

    // 3. Search query across all event properties
    if (activitySearchQuery.trim()) {
      const q = activitySearchQuery.toLowerCase().trim();
      list = list.filter(a => {
        const ev = (a.eventType || '').toLowerCase();
        const res = (a.resource || '').toLowerCase();
        const ip = (a.ipAddress || '').toLowerCase();
        const dev = (a.device || '').toLowerCase();
        const payloadStr = a.payload ? JSON.stringify(a.payload).toLowerCase() : '';
        return ev.includes(q) || res.includes(q) || ip.includes(q) || dev.includes(q) || payloadStr.includes(q);
      });
    }

    // 4. Custom date filtering
    if (activityStartDate) {
      const start = new Date(activityStartDate).getTime();
      list = list.filter(a => new Date(a.timestamp).getTime() >= start);
    }
    if (activityEndDate) {
      const end = new Date(activityEndDate).getTime();
      list = list.filter(a => new Date(a.timestamp).getTime() <= end);
    }

    // 5. Sort Order
    list.sort((a, b) => {
      const tA = new Date(a.timestamp).getTime();
      const tB = new Date(b.timestamp).getTime();
      return activitySortOrder === 'asc' ? tA - tB : tB - tA;
    });

    return list;
  }, [activities, activityCategory, activityStatusFilter, activitySearchQuery, activityStartDate, activityEndDate, activitySortOrder]);

  // Load content items when content tab changes
  useEffect(() => {
    const loadContentItems = async () => {
      if (!userId || activeTab !== 'content') return;
      setContentLoading(true);
      try {
        let res;
        if (contentTab === 'lots') res = await usersApi.fetchUserLots(userId);
        else if (contentTab === 'orders') res = await usersApi.fetchUserOrders(userId);
        else if (contentTab === 'trips') res = await usersApi.fetchUserTransportTrips(userId);
        else if (contentTab === 'reviews') res = await usersApi.fetchUserReviews(userId);
        else if (contentTab === 'uploads') res = await usersApi.fetchUserUploads(userId);
        setContentItems(res?.data || (Array.isArray(res) ? res : []));
      } catch (err) {
        console.error('Failed to load content:', err);
        setContentItems([]);
      } finally {
        setContentLoading(false);
      }
    };
    loadContentItems();
  }, [userId, contentTab, activeTab]);

  // Copy UID helper
  const handleCopyId = () => {
    navigator.clipboard.writeText(userId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Actions
  const handleKycOverride = (newStatus, docId = null) => {
    setAuditModal({
      isOpen: true,
      title: `Override KYC Status: ${newStatus}`,
      message: `Set KYC status to ${newStatus} for user ${userId}. Provide administrative justification.`,
      danger: newStatus === 'REJECTED',
      action: async (reason) => {
        await usersApi.overrideUserKyc(userId, { status: newStatus, remarks: reason, document_id: docId });
        await loadUserData(true);
        if (onUserUpdated) onUserUpdated();
      },
    });
  };

  const handleStatusChange = (newStatus) => {
    setAuditModal({
      isOpen: true,
      title: `Change Account Status: ${newStatus}`,
      message: `Modify governance account status to ${newStatus}. This will be logged in the permanent audit trail.`,
      danger: newStatus === 'BANNED' || newStatus === 'SUSPENDED',
      action: async (reason) => {
        await usersApi.updateUserStatus(userId, newStatus, reason);
        await loadUserData(true);
        if (onUserUpdated) onUserUpdated();
      },
    });
  };

  const handleRevokeSessions = (sessionId = 'all') => {
    setAuditModal({
      isOpen: true,
      title: sessionId === 'all' ? 'Revoke All Sessions' : 'Revoke Session Token',
      message: `Immediately invalidate active JWT session tokens and force re-authentication.`,
      danger: true,
      action: async (reason) => {
        await usersApi.revokeUserSessions(userId, sessionId, reason);
        await loadUserData(true);
      },
    });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await usersApi.updateUserProfile(userId, editProfileForm, 'Admin updated user profile');
      setIsEditingProfile(false);
      await loadUserData(true);
      if (onUserUpdated) onUserUpdated();
    } catch (err) {
      alert(err.response?.data?.error?.message || err.message || 'Profile update failed');
    }
  };

  const handleWalletSubmit = async (e) => {
    e.preventDefault();
    if (!walletForm.amount || parseFloat(walletForm.amount) <= 0) {
      alert('Enter a valid amount greater than 0');
      return;
    }
    if (!walletForm.reason || walletForm.reason.trim().length < 3) {
      alert('Audit justification is required (min 3 characters)');
      return;
    }

    try {
      await usersApi.adjustUserWallet(userId, walletForm);
      setIsAdjustingWallet(false);
      setWalletForm({ amount: '', type: 'CREDIT', reason: '' });
      await loadUserData(true);
      if (onUserUpdated) onUserUpdated();
    } catch (err) {
      alert(err.response?.data?.error?.message || err.message || 'Wallet adjustment failed');
    }
  };

  const handlePersonasSave = async () => {
    setAuditModal({
      isOpen: true,
      title: 'Update Assigned Personas',
      message: `Update role personas for user ${userId}. This grants or revokes persona portal access.`,
      action: async (reason) => {
        await usersApi.assignUserPersonas(userId, selectedPersonas, reason);
        setIsAssigningPersonas(false);
        await loadUserData(true);
        if (onUserUpdated) onUserUpdated();
      },
    });
  };

  const handleImpersonate = async () => {
    try {
      const data = await usersApi.impersonateUser(userId);
      prompt('Impersonation token created (valid for 15 minutes). Copy token:', data.token || data.access_token);
    } catch (err) {
      alert(err.response?.data?.error?.message || err.message || 'Impersonation failed');
    }
  };

  const handleExportDossier = async (format = 'json') => {
    try {
      const data = await usersApi.exportUserDossier(userId, format);
      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `user_dossier_${userId}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
        const link = document.createElement('a');
        link.href = jsonStr;
        link.setAttribute('download', `user_dossier_${userId}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      alert('Failed to export dossier');
    }
  };

  const handleDeleteContent = (entityType, entityId) => {
    setAuditModal({
      isOpen: true,
      title: `Takedown Content (${entityType})`,
      message: `Permanently remove or take down entity #${entityId} from the marketplace.`,
      danger: true,
      action: async (reason) => {
        await usersApi.deleteUserContent(userId, entityType, entityId, reason);
        setContentItems(prev => prev.filter(item => (item.id || item.lotId || item.orderId) !== entityId));
      },
    });
  };

  // Status badges helpers
  const kycStatus = (kycData?.kycStatus || summary?.kyc_status || 'PENDING').toUpperCase();
  const isBlocked = summary?.is_blocked || summary?.status === 'SUSPENDED' || summary?.status === 'BANNED';

  const formatActivityTime = (dateStr) => {
    if (!dateStr) return { full: '—', relative: 'No timestamp' };
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    let relative = '';
    if (diffSec < 60) relative = 'Just now';
    else if (diffMin < 60) relative = `${diffMin}m ago`;
    else if (diffHours < 24) relative = `${diffHours}h ago`;
    else if (diffDays === 1) relative = 'Yesterday';
    else if (diffDays < 30) relative = `${diffDays}d ago`;
    else relative = date.toLocaleDateString();

    const full = date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return { full, relative };
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="text-xs font-mono text-slate-400">Loading User 360° Dashboard for {userId}...</span>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="p-8 text-center space-y-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h3 className="text-base font-semibold text-white">Failed to load user profile</h3>
        <p className="text-xs text-slate-400">{error}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl inline-flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Users</span>
        </button>
      </div>
    );
  }

  // Reusable comprehensive activities filter toolbar & telemetry stream
  const renderActivitiesFilterAndFeed = () => (
    <div className="space-y-6">
      {/* Activity Filters Toolbar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-semibold text-white tracking-tight">
                User Telemetry & Activity Stream
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                {filteredActivities.length} of {activities.length} Recorded Events
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live chronological telemetry across authentication, transactions, marketplace content, and governance.
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            {hasActiveActivityFilters && (
              <button
                onClick={handleResetActivityFilters}
                className="px-2.5 py-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium flex items-center space-x-1 transition-colors"
                title="Reset all activity filters"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}

            <button
              onClick={reloadActivities}
              disabled={activitiesLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${activitiesLoading ? 'animate-spin' : ''}`} />
              <span>Reload Events</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {[
            { id: '', label: 'All Activities' },
            { id: 'auth', label: 'Auth & Logins' },
            { id: 'transact', label: 'Transactions & Bids' },
            { id: 'content', label: 'Content & Lots' },
            { id: 'governance', label: 'Governance & Admin' },
            { id: 'system', label: 'System & Security' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActivityCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activityCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Multi-Criteria Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* Keyword Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={activitySearchQuery}
              onChange={(e) => setActivitySearchQuery(e.target.value)}
              placeholder="Search event, resource, IP..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-sans"
            />
          </div>

          {/* Date Presets Dropdown */}
          <div>
            <select
              value={activityDatePreset}
              onChange={(e) => handleDatePresetChange(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="all">Date: All Time</option>
              <option value="today">Date: Today</option>
              <option value="7d">Date: Last 7 Days</option>
              <option value="30d">Date: Last 30 Days</option>
              <option value="custom">Date: Custom Range...</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={activityStatusFilter}
              onChange={(e) => setActivityStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="all">Status: All Statuses</option>
              <option value="success">Status: Success (2xx)</option>
              <option value="error">Status: Errors (4xx/5xx)</option>
            </select>
          </div>

          {/* Sort Order Toggle */}
          <div>
            <button
              onClick={() => setActivitySortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 hover:text-white flex items-center justify-between transition-colors"
            >
              <span className="text-slate-400">Sort:</span>
              <span className="font-medium font-mono text-[11px]">
                {activitySortOrder === 'desc' ? 'Newest First ↓' : 'Oldest First ↑'}
              </span>
            </button>
          </div>
        </div>

        {/* Custom Date Pickers (Shown if preset is 'custom') */}
        {activityDatePreset === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-2 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>From:</span>
              <input
                type="date"
                value={activityStartDate ? activityStartDate.slice(0, 10) : ''}
                onChange={(e) => setActivityStartDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <span>To:</span>
              <input
                type="date"
                value={activityEndDate ? activityEndDate.slice(0, 10) : ''}
                onChange={(e) => setActivityEndDate(e.target.value ? new Date(e.target.value + 'T23:59:59.999Z').toISOString() : '')}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Chronological Event Stream */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <span>Chronological Feed</span>
            <span className="text-emerald-400 font-mono">({filteredActivities.length} Events)</span>
          </h4>
          <span className="text-[11px] font-mono text-slate-500">Live Telemetry</span>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs space-y-2">
            <Activity className="w-8 h-8 mx-auto text-slate-700" />
            <p>
              {activities.length === 0
                ? 'No activity logs recorded yet for this user in the live database.'
                : 'No activity logs match the applied filters.'}
            </p>
            {hasActiveActivityFilters && (
              <button
                onClick={handleResetActivityFilters}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredActivities.map((act) => {
              const isSuccess = !act.statusCode || (act.statusCode >= 200 && act.statusCode < 300);
              return (
                <div
                  key={act.id}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-start justify-between text-xs hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                      act.category === 'auth'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : act.category === 'transact'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : act.category === 'content'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : act.category === 'governance'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    }`}>
                      {act.category === 'auth' ? <Key className="w-4 h-4" /> :
                       act.category === 'transact' ? <DollarSign className="w-4 h-4" /> :
                       act.category === 'content' ? <Package className="w-4 h-4" /> :
                       act.category === 'governance' ? <Shield className="w-4 h-4" /> :
                       <Activity className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-white font-mono">{act.eventType}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono capitalize">
                          {act.category || 'telemetry'}
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                          isSuccess
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          HTTP {act.statusCode || 200}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400 mt-1">
                        <span>Resource: <code className="text-slate-300">{act.resource || 'platform'}</code></span>
                        <span>&bull;</span>
                        <span>IP: <code className="text-slate-300">{act.ipAddress || '—'}</code></span>
                        <span>&bull;</span>
                        <span>Device: <span className="text-slate-300">{act.device || '—'}</span></span>
                        <span>&bull;</span>
                        <span className="text-slate-300 font-mono inline-flex items-center space-x-1.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span className="text-emerald-400 font-medium">{formatActivityTime(act.timestamp).relative}</span>
                          <span className="text-slate-500">({formatActivityTime(act.timestamp).full})</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {act.payload && (
                    <button
                      onClick={() => setInspectedPayload(act.payload)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-[11px] text-slate-300 hover:text-white flex items-center space-x-1 flex-shrink-0"
                    >
                      <Terminal className="w-3 h-3 text-emerald-400" />
                      <span>Inspect Payload</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historical Login Records Table */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-sm">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Historical Login Records ({logins.length})
        </h4>

        {logins.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs">
            No historical login records available in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Login Timestamp</th>
                  <th className="py-2.5 px-3">IP Address</th>
                  <th className="py-2.5 px-3">Device / User Agent</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Auth Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {logins.map((lg) => (
                  <tr key={lg.id} className="hover:bg-slate-950/40">
                    <td className="py-2.5 px-3 text-white">
                      {new Date(lg.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400">{lg.ipAddress}</td>
                    <td className="py-2.5 px-3 font-sans truncate max-w-[200px]">{lg.device || lg.userAgent}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans">{lg.location || lg.geoLocation || '—'}</td>
                    <td className="py-2.5 px-3 text-slate-300 uppercase">{lg.authMethod || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active JWT Sessions & Token Management */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight">
              Active JWT Sessions & Tokens
            </h4>
            <p className="text-xs text-slate-400">
              Active authentication tokens stored in Redis cache. Revocation immediately blacklists the session.
            </p>
          </div>

          {sessions.length > 0 && (
            <button
              onClick={() => handleRevokeSessions('all')}
              className="px-3 py-1.5 rounded-xl bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 text-xs font-semibold transition-all"
            >
              Revoke All Tokens
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs">
            No active JWT sessions found in Redis for this account.
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((sess) => (
              <div
                key={sess.sessionId || sess.id}
                className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">{sess.device}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    <span>IP: {sess.ipAddress}</span> &bull; <span>Last Active: {new Date(sess.lastActive || sess.createdAt || Date.now()).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRevokeSessions(sess.sessionId || sess.id)}
                  className="px-2.5 py-1 rounded-lg bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white text-xs font-medium transition-colors"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & DIRECTORY NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="Return to User Directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                User 360° Single Dashboard
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                LIVE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive profile, identity verification, and real-time activity stream for UID <code className="text-slate-300">{userId}</code>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadUserData(true)}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors flex items-center space-x-1.5"
            title="Refresh Real User Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleImpersonate}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors flex items-center space-x-1.5"
            title="Generate temporary 15-min JWT token"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Impersonate</span>
          </button>

          <button
            onClick={() => handleExportDossier('json')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors flex items-center space-x-1.5"
            title="Export full user compliance dossier"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Dossier</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Account Status Switcher */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 border border-slate-800 rounded-xl">
            <button
              onClick={() => handleStatusChange('ACTIVE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                summary?.status === 'ACTIVE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => handleStatusChange('SUSPENDED')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                summary?.status === 'SUSPENDED'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Suspend
            </button>
            <button
              onClick={() => handleStatusChange('BANNED')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                summary?.status === 'BANNED'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ban
            </button>
          </div>
        </div>
      </div>

      {/* 2. IDENTITY HERO BANNER */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 border-2 border-emerald-500/40 flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0 relative">
              {summary?.profile_photo ? (
                <img
                  src={summary.profile_photo}
                  alt={summary.full_name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                (summary?.full_name || 'U').charAt(0).toUpperCase()
              )}
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                summary?.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'
              }`} />
            </div>

            {/* Profile Basics */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {summary?.full_name || 'Unnamed User'}
                </h2>

                {summary?.verified_name && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    <span>Govt: {summary.verified_name}</span>
                  </span>
                )}

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                  summary?.status === 'ACTIVE'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : summary?.status === 'SUSPENDED'
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    : 'bg-red-500/15 border-red-500/30 text-red-400'
                }`}>
                  {summary?.status || 'ACTIVE'}
                </span>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                  kycStatus === 'VERIFIED'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : kycStatus === 'REJECTED'
                    ? 'bg-red-500/15 border-red-500/30 text-red-400'
                    : kycStatus === 'RESUBMISSION_REQUESTED'
                    ? 'bg-sky-500/15 border-sky-500/30 text-sky-400'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                }`}>
                  KYC: {kycStatus.replace('_', ' ')}
                </span>
              </div>

              {/* Contact & Meta */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                <div className="flex items-center space-x-1.5 font-mono">
                  <span>ID:</span>
                  <code className="text-emerald-400">{userId}</code>
                  <button
                    onClick={handleCopyId}
                    className="p-1 hover:text-white transition-colors"
                    title="Copy UID"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                {summary?.phone && (
                  <div className="flex items-center space-x-1 font-mono text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{summary.phone}</span>
                  </div>
                )}

                {summary?.email && (
                  <div className="flex items-center space-x-1 text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{summary.email}</span>
                  </div>
                )}

                {(summary?.district || summary?.state) && (
                  <div className="flex items-center space-x-1 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{summary.district ? `${summary.district}, ` : ''}{summary.state}</span>
                  </div>
                )}

                <div className="flex items-center space-x-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Joined {summary?.created_at ? new Date(summary.created_at).toLocaleDateString() : '—'}</span>
                </div>
              </div>

              {/* Persona Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {summary?.personas?.map(p => (
                  <span
                    key={p.role}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    {p.role}
                  </span>
                ))}
                <button
                  onClick={() => setIsAssigningPersonas(true)}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-dashed border-emerald-500/30 transition-colors"
                >
                  + Manage Personas
                </button>
              </div>
            </div>
          </div>

          {/* Quick Edit Profile CTA */}
          <div className="flex items-center space-x-2 self-stretch md:self-auto justify-end">
            <button
              onClick={() => setIsEditingProfile(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. HIGH LEVEL KPI CARDS (USER SUMMARY OVERVIEW) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Trust Score */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono uppercase">
            <span>Trust & Compliance</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-black text-white font-mono">
              {summary?.trust_score != null ? `${summary.trust_score}` : '—'}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="flex items-center space-x-2 mt-2 text-[11px]">
            <span className="text-emerald-400 font-medium">
              {summary?.trust_score != null ? (summary.trust_score >= 80 ? 'Good Standing' : summary.trust_score >= 50 ? 'Moderate Risk' : 'High Alert') : '—'}
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-400 font-mono">KYC: {kycStatus}</span>
          </div>
        </div>

        {/* KPI 2: Wallet & Commercial Financials */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono uppercase">
            <span>Financials & Spend</span>
            <Wallet className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-black text-white font-mono">
              ₹{(contentSummary?.total_spend_inr || 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400">Total Spend</span>
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px]">
            <span className="text-emerald-400 font-mono">
              Earned: ₹{(contentSummary?.total_earned_inr || 0).toLocaleString()}
            </span>
            <button
              onClick={() => setIsAdjustingWallet(true)}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline"
            >
              Adjust
            </button>
          </div>
        </div>

        {/* KPI 3: Commercial Activity Footprint */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono uppercase">
            <span>Platform Footprint</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 text-center">
            <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
              <span className="text-lg font-bold text-white font-mono block">
                {contentSummary?.lots_count ?? 0}
              </span>
              <span className="text-[10px] text-slate-400">Lots</span>
            </div>
            <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
              <span className="text-lg font-bold text-white font-mono block">
                {contentSummary?.trips_completed ?? 0}
              </span>
              <span className="text-[10px] text-slate-400">Trips</span>
            </div>
            <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
              <span className="text-lg font-bold text-white font-mono block">
                {contentSummary?.reviews_count ?? 0}
              </span>
              <span className="text-[10px] text-slate-400">Reviews</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Security & Active Sessions */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono uppercase">
            <span>Security & Sessions</span>
            <ShieldAlert className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-black text-white font-mono">
              {sessions.length}
            </span>
            <span className="text-xs text-slate-400">Active JWTs</span>
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px]">
            <span className="text-slate-400 font-mono">
              {summary?.last_login ? `Active ${new Date(summary.last_login).toLocaleDateString()}` : 'No recent login'}
            </span>
            {sessions.length > 0 && (
              <button
                onClick={() => handleRevokeSessions('all')}
                className="text-red-400 hover:text-red-300 font-semibold"
              >
                Revoke All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. DASHBOARD NAVIGATION TABS */}
      <div className="border-b border-slate-800">
        <div className="flex space-x-8 text-sm">
          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-3 font-semibold transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'summary'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Single User Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('activities')}
            className={`pb-3 font-semibold transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'activities'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>User Activities Stream</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {filteredActivities.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`pb-3 font-semibold transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'content'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Marketplace Content & Commercials</span>
          </button>

          <button
            onClick={() => setActiveTab('governance')}
            className={`pb-3 font-semibold transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'governance'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Governance, Ledger & Audit</span>
          </button>
        </div>
      </div>

      {/* 5. TAB PANELS */}

      {/* TAB 1: 360° PROFILE & IDENTITY (USER SUMMARY + ACTIVITIES ON DASHBOARD) */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* USER SUMMARY 2-COLUMN EXECUTIVE SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* COLUMN 1: Profile & Persona Deep Dives */}
            <div className="space-y-6">
              {/* Profile Demographic & Ecosystem Info */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white tracking-tight">
                        User Profile & Account Summary
                      </h4>
                      <p className="text-xs text-slate-400">
                        Primary registration details, location, and platform telemetry
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                    summary?.status === 'ACTIVE'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/15 border-red-500/30 text-red-400'
                  }`}>
                    {summary?.status || 'ACTIVE'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">User UID</span>
                    <span className="font-mono text-emerald-400 font-semibold text-xs truncate block" title={userId}>
                      {userId}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Primary Phone</span>
                    <span className="font-mono text-white font-medium text-xs">
                      {summary?.phone || '—'}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Email Address</span>
                    <span className="text-slate-300 font-medium text-xs truncate block" title={summary?.email || 'Not provided'}>
                      {summary?.email || '—'}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Location / Region</span>
                    <span className="text-slate-200 font-medium text-xs truncate block">
                      {[summary?.village, summary?.district, summary?.state].filter(Boolean).join(', ') || '—'}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Language & Locale</span>
                    <span className="font-mono text-slate-300 uppercase text-xs">
                      {summary?.language || summary?.preferred_language || 'EN'}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Referral Code</span>
                    <span className="font-mono text-emerald-400 text-xs">
                      {summary?.referralCode || summary?.referral_code || '—'}
                    </span>
                  </div>
                </div>

                {/* Gamification & Agronomy Metrics */}
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-mono text-slate-400 uppercase block mb-2">
                    Ecosystem Standing & Credit Telemetry
                  </span>
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-center space-x-1 text-emerald-400 mb-0.5">
                        <Coins className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold font-mono">{summary?.agriCoins ?? 0}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">AgriCoins Balance</span>
                    </div>

                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-center space-x-1 text-blue-400 mb-0.5">
                        <Shield className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold font-mono">{summary?.kisanCreditScore ?? summary?.trust_score ?? 0}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Credit Score</span>
                    </div>

                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-center space-x-1 text-amber-400 mb-0.5">
                        <Award className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold truncate max-w-[90px]">{summary?.krishiRatnaTitle || 'Krishi Shishya'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Level {summary?.krishiRatnaLevel ?? 1}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Persona Data Deep Dives */}
              {personasData && (
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-white tracking-tight border-b border-slate-800/80 pb-3">
                    Active Persona Profiles
                  </h4>

                  <div className="space-y-3">
                    {/* Farmer Persona */}
                    {personasData.farmer && (
                      <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                          <Wheat className="w-4 h-4" />
                          <span>Farmer Profile</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-slate-400">
                            <span className="block text-[10px]">Land Area</span>
                            <strong className="text-white font-mono">{personasData.farmer.landAreaAcres} Acres</strong>
                          </div>
                          <div className="text-slate-400">
                            <span className="block text-[10px]">Soil Type</span>
                            <strong className="text-white capitalize">{personasData.farmer.soilType || 'Loamy / Black'}</strong>
                          </div>
                          <div className="text-slate-400">
                            <span className="block text-[10px]">Irrigation</span>
                            <strong className="text-white capitalize">{personasData.farmer.irrigationType || 'Canal / Drip'}</strong>
                          </div>
                        </div>
                        {personasData.farmer.crops && personasData.farmer.crops.length > 0 && (
                          <div className="pt-1.5 border-t border-slate-900">
                            <span className="text-[10px] text-slate-400 block mb-1">Active Crops:</span>
                            <div className="flex flex-wrap gap-1">
                              {personasData.farmer.crops.map((c, i) => (
                                <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-emerald-300">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Transporter Persona */}
                    {personasData.transporter && (
                      <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center space-x-2 text-blue-400 font-semibold text-xs uppercase tracking-wider">
                          <Truck className="w-4 h-4" />
                          <span>Transporter Fleet</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          <span>Registered Fleet: </span>
                          <strong className="text-white font-mono">{personasData.transporter.fleetSize} Vehicles</strong>
                        </div>
                        {personasData.transporter.vehicles?.slice(0, 3).map((v, i) => (
                          <div key={i} className="text-[11px] text-slate-300 font-mono bg-slate-900 p-1.5 rounded">
                            {v.registrationNumber || v.vehicleNumber || `Vehicle #${i + 1}`} ({v.vehicleType || 'Truck'})
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Nursery Persona */}
                    {personasData.nursery && (
                      <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center space-x-2 text-purple-400 font-semibold text-xs uppercase tracking-wider">
                          <Package className="w-4 h-4" />
                          <span>Nursery Inventory</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          <span>Catalog Items: </span>
                          <strong className="text-white font-mono">{personasData.nursery.inventoryCount} Plants</strong>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* COLUMN 2: DigiLocker Identity & Document Compliance Vault */}
            <div className="space-y-6">
              {/* DigiLocker & National Identity Card */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-1.5">
                        <span>DigiLocker & National Identity Record</span>
                        {kycStatus === 'VERIFIED' && (
                          <BadgeCheck className="w-4 h-4 text-emerald-400 inline" />
                        )}
                      </h4>
                      <p className="text-xs text-slate-400">
                        UIDAI / DigiLocker live identity verification data
                      </p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                    kycStatus === 'VERIFIED'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : kycStatus === 'REJECTED'
                      ? 'bg-red-500/15 border-red-500/30 text-red-400'
                      : kycStatus === 'RESUBMISSION_REQUESTED'
                      ? 'bg-sky-500/15 border-sky-500/30 text-sky-400'
                      : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  }`}>
                    {kycStatus.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Masked Aadhaar</span>
                    <span className="font-mono text-emerald-400 font-semibold text-sm">
                      {kycData?.maskedAadhaar || summary?.masked_aadhaar || 'Not Linked'}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Verified Name</span>
                    <span className="text-white font-medium text-sm truncate block" title={kycData?.verifiedName || summary?.verified_name || 'Pending'}>
                      {kycData?.verifiedName || summary?.verified_name || 'Pending verification'}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Verification Mode</span>
                    <span className="font-mono text-slate-300 uppercase text-xs">
                      {(() => {
                        const mode = kycData?.verificationMode || summary?.verification_mode;
                        if (!mode || mode.toLowerCase() === 'mock') return 'Live UIDAI';
                        return mode;
                      })()}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Verified At</span>
                    <span className="font-mono text-slate-300 text-xs">
                      {kycData?.kycVerifiedAt || summary?.kyc_verified_at
                        ? new Date(kycData?.kycVerifiedAt || summary?.kyc_verified_at).toLocaleDateString()
                        : 'Not Verified'}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Signature Status</span>
                    <span className="text-slate-300 font-mono text-xs">
                      {(kycData?.signatureVerified || summary?.signature_verified) ? 'Cryptographically Verified' : 'Standard'}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Remarks</span>
                    <span className="text-slate-300 truncate block text-xs">
                      {kycData?.kycRemarks || summary?.kyc_remarks || 'None'}
                    </span>
                  </div>
                </div>

                {/* KYC Sessions History */}
                {kycData?.sessions && kycData.sessions.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1.5">
                      Recorded Verification Sessions ({kycData.sessions.length})
                    </span>
                    <div className="space-y-1.5">
                      {kycData.sessions.slice(0, 3).map((sess) => (
                        <div
                          key={sess.id}
                          className="px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-emerald-400 text-[11px]">{sess.id}</span>
                            <span className="text-slate-600">&bull;</span>
                            <span className="text-slate-300 capitalize text-[11px]">{sess.method || 'DigiLocker'}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            sess.status === 'verified'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {sess.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Document Vault & Decision Controls */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-white tracking-tight">
                      Document Vault & Compliance Review
                    </h4>
                    <p className="text-xs text-slate-400">
                      Aadhaar, 7/12 Land Records, APMC Licenses
                    </p>
                  </div>

                  {/* Global KYC Action buttons */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleKycOverride('VERIFIED')}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleKycOverride('REJECTED')}
                      className="px-2.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-semibold transition-all flex items-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleKycOverride('RESUBMISSION_REQUESTED')}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 text-xs font-semibold transition-all"
                    >
                      Resubmit
                    </button>
                  </div>
                </div>

                {/* Document Gallery */}
                {kycDocs.length === 0 ? (
                  <div className="py-8 px-4 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                    <FileText className="w-7 h-7 text-slate-600 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-300 font-medium">No document files attached</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Documents uploaded or synced via DigiLocker will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {kycDocs.map((doc) => (
                      <div
                        key={doc.id || doc.docId}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5"
                      >
                        {doc.fileUrl ? (
                          <div className="h-28 rounded-lg overflow-hidden bg-slate-900 relative border border-slate-800">
                            <img
                              src={doc.fileUrl}
                              alt={doc.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => setZoomedImage(doc.fileUrl)}
                            />
                          </div>
                        ) : (
                          <div className="h-20 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                            <FileText className="w-5 h-5 mr-1.5 text-slate-400" />
                            <span className="text-[11px] font-medium">Metadata record</span>
                          </div>
                        )}

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-white truncate max-w-[130px]">{doc.name}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                              doc.status === 'VERIFIED'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : doc.status === 'REJECTED'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {doc.status}
                            </span>
                          </div>
                        </div>

                        {/* Per-document decision buttons */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleKycOverride('VERIFIED', doc.id || doc.docId)}
                            className="px-2 py-0.5 rounded bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white text-[10px] font-medium transition-colors"
                          >
                            Verify
                          </button>
                          <button
                            type="button"
                            onClick={() => handleKycOverride('REJECTED', doc.id || doc.docId)}
                            className="px-2 py-0.5 rounded bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white text-[10px] font-medium transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => handleKycOverride('RESUBMISSION_REQUESTED', doc.id || doc.docId)}
                            className="px-2 py-0.5 rounded bg-amber-600/15 hover:bg-amber-600 text-amber-400 hover:text-white text-[10px] font-medium transition-colors"
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
          </div>

          {/* USER DETAILED ACTIVITIES & TELEMETRY STREAM DIRECTLY ON DASHBOARD */}
          <div className="pt-2">
            {renderActivitiesFilterAndFeed()}
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED ACTIVITIES & TELEMETRY STREAM */}
      {activeTab === 'activities' && (
        <div className="space-y-6">
          {renderActivitiesFilterAndFeed()}
        </div>
      )}

      {/* TAB 3: MARKETPLACE CONTENT & COMMERCIALS */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          {/* Subtabs */}
          <div className="flex space-x-2 border-b border-slate-800 pb-2">
            {[
              { id: 'lots', label: 'Produce Lots', count: contentSummary?.lots_count },
              { id: 'orders', label: 'Marketplace Orders', count: null },
              { id: 'trips', label: 'Transport Trips', count: contentSummary?.trips_completed },
              { id: 'reviews', label: 'Ratings & Reviews', count: contentSummary?.reviews_count },
              { id: 'uploads', label: 'Cloud Storage Media', count: null },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setContentTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  contentTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && tab.count !== undefined && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 font-mono">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content Items List */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            {contentLoading ? (
              <div className="py-12 flex justify-center items-center text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-emerald-400" />
                <span>Loading {contentTab}...</span>
              </div>
            ) : contentItems.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No {contentTab} found for this user.
              </div>
            ) : (
              <div className="space-y-3">
                {contentItems.map((item) => (
                  <div
                    key={item.id || item.lotId || item.orderId || item.tripId}
                    className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white font-mono">
                          {item.commodity || item.title || item.crop || item.orderId || item.tripId || item.filename || 'Entity'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono uppercase">
                          {item.status || 'ACTIVE'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono">
                        {item.quantity && <span>Qty: {item.quantity} {item.unit || 'Kg'} &bull; </span>}
                        {item.price && <span>Price: ₹{item.price} &bull; </span>}
                        {item.expectedPrice && <span>Expected: ₹{item.expectedPrice} &bull; </span>}
                        <span>Created: {new Date(item.createdAt || item.timestamp || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteContent(contentTab, item.id || item.lotId || item.orderId)}
                      className="px-2.5 py-1 rounded-lg bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white text-xs font-medium transition-colors"
                    >
                      Take Down
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: GOVERNANCE, LEDGER & AUDIT */}
      {activeTab === 'governance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wallet Ledger Adjustment Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-semibold text-white tracking-tight">
                Manual Ledger & Wallet Adjustment
              </h4>
            </div>

            <form onSubmit={handleWalletSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
                  <select
                    value={walletForm.type}
                    onChange={(e) => setWalletForm({ ...walletForm, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="CREDIT">Credit (+) User Wallet</option>
                    <option value="DEBIT">Debit (-) User Wallet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Amount (₹ INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="e.g. 500"
                    value={walletForm.amount}
                    onChange={(e) => setWalletForm({ ...walletForm, amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mandatory Audit Reason (min 3 chars)
                </label>
                <textarea
                  rows={2}
                  placeholder="Justification for manual balance adjustment..."
                  value={walletForm.reason}
                  onChange={(e) => setWalletForm({ ...walletForm, reason: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
              >
                Execute Ledger Adjustment
              </button>
            </form>
          </div>

          {/* Admin Audit Trail for this user */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3">
              <Shield className="w-5 h-5 text-blue-400" />
              <h4 className="text-sm font-semibold text-white tracking-tight">
                Governance Audit Log
              </h4>
            </div>

            {auditTrail.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No administrative actions recorded against this user.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                {auditTrail.map((ad, idx) => (
                  <div
                    key={ad.id || idx}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1 font-mono"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-emerald-400">{ad.action || 'ADMIN_ACTION'}</span>
                      <span className="text-[10px] text-slate-500">{new Date(ad.created_at || ad.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300 font-sans text-[11px]">{ad.reason || ad.details || 'System operation'}</p>
                    <span className="text-[10px] text-slate-500 block">By: {ad.actor_admin_id || 'superadmin'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. MODALS & SUB-DRAWS */}

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setIsEditingProfile(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <XCircle className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-4">Edit Profile Metadata</h3>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editProfileForm.full_name}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, full_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editProfileForm.phone}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={editProfileForm.email}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">District</label>
                  <input
                    type="text"
                    value={editProfileForm.district}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, district: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">State</label>
                  <input
                    type="text"
                    value={editProfileForm.state}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, state: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Personas Modal */}
      {isAssigningPersonas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setIsAssigningPersonas(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <XCircle className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-2">Manage Role Personas</h3>
            <p className="text-xs text-slate-400 mb-4">
              Select all persona portals this user is authorized to access.
            </p>

            <div className="space-y-2 mb-6">
              {[
                { id: 'farmer', label: 'Farmer (Kisan Portal)' },
                { id: 'transporter', label: 'Transporter (Fleet Portal)' },
                { id: 'seller', label: 'Produce Seller' },
                { id: 'nursery', label: 'Plant Nursery' },
                { id: 'vyapari', label: 'Vyapari (Trader)' },
                { id: 'equipmentRental', label: 'Equipment Rental Provider' },
                { id: 'farmLandlord', label: 'Farmland Landlord' },
              ].map(r => {
                const checked = selectedPersonas.includes(r.id);
                return (
                  <label
                    key={r.id}
                    className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      checked ? 'bg-emerald-950/30 border-emerald-500/40 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedPersonas([...selectedPersonas, r.id]);
                        else setSelectedPersonas(selectedPersonas.filter(x => x !== r.id));
                      }}
                      className="rounded border-slate-700 text-emerald-600 focus:ring-0"
                    />
                    <span className="text-xs font-semibold">{r.label}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAssigningPersonas(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePersonasSave}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
              >
                Save Personas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Raw JSON Payload Modal */}
      {inspectedPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setInspectedPayload(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <XCircle className="w-5 h-5" />
            </button>
            <h3 className="text-base font-mono font-bold text-white mb-2 flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Event Telemetry Payload</span>
            </h3>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto text-[11px] font-mono text-emerald-400 max-h-[400px]">
              {JSON.stringify(inspectedPayload, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Zoomed Document Image Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md cursor-pointer animate-in fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <div className="max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
            <img src={zoomedImage} alt="Document Zoom" className="w-full h-full object-contain" />
          </div>
        </div>
      )}

      {/* Mandatory Administrative Audit Reason Modal */}
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

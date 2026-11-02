import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Users, Search, Filter, Calendar, Clock, Download, Plus,
  RefreshCw, Eye, ShieldAlert, CheckCircle2, XCircle, ArrowUpDown,
  Lock, Unlock, Key, Copy, Check, ChevronLeft, ChevronRight,
  UserCheck, Shield, Sparkles, AlertCircle
} from 'lucide-react';
import { usersApi } from '../api/usersApi';
import { UserDetailDrawer } from '../components/UserDetailDrawer';
import { UserDashboardView } from '../components/UserDashboardView';
import { CreateUserModal } from '../components/CreateUserModal';
import { AuditReasonModal } from '../components/AuditReasonModal';

export const UsersPage = () => {
  const { userId: routeUserId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Query parameters state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [datePreset, setDatePreset] = useState('all'); // 'all' | 'today' | '7d' | '30d' | 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc'); // 'desc' (recent 1st) or 'asc'
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Data state
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [statsRange, setStatsRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals & Dashboard state
  const [selectedUserId, setSelectedUserId] = useState(routeUserId || null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [auditModal, setAuditModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
    danger: false,
  });

  // Keep selected user in sync with URL route parameter
  // When routeUserId is absent (e.g. Navigating to /users), immediately reset to null to show main dashboard
  useEffect(() => {
    if (routeUserId) {
      setSelectedUserId(routeUserId);
    } else {
      setSelectedUserId(null);
    }
  }, [routeUserId, location.pathname]);

  const handleOpenUserDashboard = (uid) => {
    setSelectedUserId(uid);
    navigate(`/users/${uid}`);
  };

  const handleBackToDirectory = () => {
    setSelectedUserId(null);
    navigate('/users');
  };

  // Fetch High-Level Metrics
  const loadStats = async (range = statsRange) => {
    setStatsLoading(true);
    try {
      const data = await usersApi.fetchUserStats(range);
      setStats(data);
    } catch (err) {
      console.error('Failed to load user stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Users with all filters (Datetime, Search, Persona, Status, Recent 1st)
  const loadUsers = async () => {
    setLoading(true);
    setError('');

    // Compute effective start and end dates based on preset or custom
    let effectiveStartDate = startDate;
    let effectiveEndDate = endDate;

    const now = new Date();
    if (datePreset === 'today') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      effectiveStartDate = startOfToday.toISOString();
      effectiveEndDate = now.toISOString();
    } else if (datePreset === '7d') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      effectiveStartDate = sevenDaysAgo.toISOString();
      effectiveEndDate = now.toISOString();
    } else if (datePreset === '30d') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      effectiveStartDate = thirtyDaysAgo.toISOString();
      effectiveEndDate = now.toISOString();
    } else if (datePreset === 'all') {
      effectiveStartDate = '';
      effectiveEndDate = '';
    }

    try {
      const res = await usersApi.fetchUsers({
        q: search.trim(),
        role: roleFilter,
        status: statusFilter,
        kyc_status: kycFilter,
        start_date: effectiveStartDate,
        end_date: effectiveEndDate,
        page,
        limit,
        sort_by: sortBy,
        order,
      });

      const rawList = res.users || res.data || [];
      const ignoredIds = new Set(['admin-ops', 'admin-moderator', 'admin-finance', 'admin-compliance', 'admin-agronomy', 'admin-agromony']);
      const userList = rawList.filter((u) => {
        if (u.isMock || u.is_mock) return false;
        if (u.phone === '+910000000000' || u.phone === '0000000000' || u.id === 'user_0000000000') return false;
        if (ignoredIds.has(u.id)) return false;
        return true;
      });
      setUsers(userList);
      setTotal(res.total != null ? Math.min(res.total, userList.length) : userList.length);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to fetch users from server');
    } finally {
      setLoading(false);
    }
  };

  // Trigger users load when parameters change
  useEffect(() => {
    loadUsers();
  }, [page, limit, roleFilter, statusFilter, kycFilter, datePreset, startDate, endDate, sortBy, order]);

  // Initial stats load
  useEffect(() => {
    loadStats();
  }, [statsRange]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setKycFilter('');
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
    setSortBy('createdAt');
    setOrder('desc');
    setPage(1);
  };

  // Toggle Sorting (Recent 1st vs Oldest 1st)
  const toggleSortOrder = () => {
    setOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    setPage(1);
  };

  // Handle Account Freeze / Unfreeze Quick Action
  const handleToggleFreeze = (user) => {
    const isCurrentlySuspended = user.status === 'suspended' || user.is_suspended;
    const targetStatus = isCurrentlySuspended ? 'ACTIVE' : 'SUSPENDED';

    setAuditModal({
      isOpen: true,
      title: isCurrentlySuspended ? 'Reactivate Account' : 'Freeze Account Access',
      message: isCurrentlySuspended
        ? `Restore platform access for ${user.name || user.phone} (${user.id}).`
        : `Freezing account ${user.name || user.phone} will instantly revoke all JWT tokens and block user actions.`,
      danger: !isCurrentlySuspended,
      action: async (reason) => {
        await usersApi.updateUserStatus(user.id, targetStatus, reason);
        await loadUsers();
        await loadStats();
      },
    });
  };

  // Handle Impersonate Quick Action
  const handleQuickImpersonate = async (user) => {
    try {
      const res = await usersApi.impersonateUser(user.id);
      navigator.clipboard.writeText(res.token);
      alert(`15-min Impersonation Token generated and copied to clipboard for user ${user.id}!`);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Impersonation failed');
    }
  };

  // Handle Roster Export
  const handleExportRoster = async (format = 'csv') => {
    try {
      const data = await usersApi.exportUsers({ format, profile: roleFilter, status: statusFilter });
      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `agrovercity_user_roster_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonStr);
        downloadAnchor.setAttribute('download', `agrovercity_user_roster_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    } catch (err) {
      alert('Failed to export roster');
    }
  };

  // Helper: Format Personas with colors
  const renderPersonaBadges = (user) => {
    const profiles = user.linkedProfiles || (user.primaryProfile ? [user.primaryProfile] : (user.role ? [user.role] : []));
    const badgeColors = {
      farmer: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      transporter: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      seller: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      nursery: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      vyapari: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      equipmentRental: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      farmLandlord: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      admin: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    };

    return (
      <div className="flex flex-wrap gap-1">
        {profiles.map((p) => {
          const colorClass = badgeColors[p] || 'bg-slate-800 text-slate-300 border-slate-700';
          return (
            <span
              key={p}
              className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-semibold border capitalize ${colorClass}`}
            >
              {p}
            </span>
          );
        })}
      </div>
    );
  };

  // Helper: Format Date & Relative time
  const formatUserDate = (dateStr) => {
    if (!dateStr) return { formatted: '—', relative: 'No timestamp' };
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    let relative = '';
    if (diffHours < 1) relative = 'Just now';
    else if (diffHours < 24) relative = `${diffHours}h ago`;
    else if (diffDays === 1) relative = 'Yesterday';
    else relative = `${diffDays}d ago`;

    const formatted = date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isRecent = diffHours < 48; // Registered within 48 hours

    return { formatted, relative, isRecent };
  };

  // If a specific user is selected, render the Single User Dashboard
  if (selectedUserId) {
    return (
      <UserDashboardView
        userId={selectedUserId}
        onBack={handleBackToDirectory}
        onUserUpdated={() => {
          loadUsers();
          loadStats();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">User 360° Management Console</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              LIVE FIRESTORE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Omni-persona identity console, compliance verification, and real-time activity stream
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              loadUsers();
              loadStats();
            }}
            title="Refresh User Data"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => handleExportRoster('csv')}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Roster</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all text-xs font-semibold shadow-md shadow-emerald-950/50 flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Direct Create User</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono uppercase">
            <span>Total Registered Users</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1.5 font-mono">
            {stats?.total_users != null ? stats.total_users : total}
          </p>
        </div>

        {/* Active Personas Breakdown */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono uppercase">
            <span>Persona Distribution</span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-2 mt-1.5">
            <span className="text-2xl font-black text-white font-mono">
              {stats?.active_personas?.farmer || 0}
            </span>
            <span className="text-xs text-slate-400 font-mono">Farmers &bull; {stats?.active_personas?.transporter || 0} Fleet</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 font-mono">
              {stats?.active_personas?.seller || 0} Sellers
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 font-mono">
              {stats?.active_personas?.nursery || 0} Nursery
            </span>
          </div>
        </div>

        {/* KYC Backlog */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono uppercase">
            <span>KYC Compliance Queue</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-1.5 font-mono">
            {stats?.kyc_backlog ?? 0}
          </p>
          <div className="mt-2 text-[11px] text-slate-400">
            <span>Pending Review</span>
          </div>
        </div>

        {/* Account Health / Blocked */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono uppercase">
            <span>Governance & Health</span>
            <ShieldAlert className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1.5 font-mono">
            {stats?.blocked_accounts ?? 0} <span className="text-xs text-slate-500 font-normal">Suspended</span>
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by phone (+91...), full name, email, or UID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-sans"
            />
          </div>

          {/* Persona Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 capitalize"
          >
            <option value="">All Personas</option>
            <option value="farmer">Farmer</option>
            <option value="transporter">Transporter</option>
            <option value="seller">Produce Seller</option>
            <option value="nursery">Plant Nursery</option>
            <option value="vyapari">Vyapari</option>
            <option value="equipmentRental">Equipment Rental</option>
            <option value="farmLandlord">Farmland Landlord</option>
            <option value="admin">Admin</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
            <option value="locked">Locked</option>
          </select>

          {/* KYC Status Filter */}
          <select
            value={kycFilter}
            onChange={(e) => {
              setKycFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All KYC Status</option>
            <option value="verified">KYC Verified</option>
            <option value="pending">KYC Pending</option>
            <option value="resubmission_requested">Resubmission Requested</option>
            <option value="unverified">Unverified</option>
            <option value="rejected">KYC Rejected</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Datetime Filter Bar & Sorting Indicators */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-slate-400 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Datetime Range:</span>
            </span>

            {/* Presets */}
            {['all', 'today', '7d', '30d', 'custom'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setDatePreset(preset);
                  setPage(1);
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                  datePreset === preset
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {preset === 'all' && 'All Time'}
                {preset === 'today' && 'Today'}
                {preset === '7d' && 'Last 7 Days'}
                {preset === '30d' && 'Last 30 Days'}
                {preset === 'custom' && 'Custom Datetime'}
              </button>
            ))}

            {/* Custom Datetime Pickers */}
            {datePreset === 'custom' && (
              <div className="flex items-center space-x-2 pl-2">
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="text-slate-500 text-xs">to</span>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Sort Control: Recent Entered User 1st */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSortOrder}
              className="flex items-center space-x-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-emerald-400 hover:border-slate-700 transition-colors"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>
                Sorted: <strong>{order === 'desc' ? 'Recent Entered 1st' : 'Oldest First'}</strong>
              </span>
            </button>

            {(search || roleFilter || statusFilter || kycFilter || datePreset !== 'all' || startDate || endDate) && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-slate-400 hover:text-white underline underline-offset-2"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3 font-mono text-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
            <span>Streaming User Roster from Live Firestore Database...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-xs text-red-400 font-mono">{error}</p>
            <button
              onClick={loadUsers}
              className="px-3 py-1 bg-slate-800 rounded-lg text-xs text-white"
            >
              Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-white">No Users Found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No registered user matches the selected datetime range or filter criteria.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 rounded-xl text-xs font-semibold border border-slate-700"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3.5 px-4">USER PROFILE</th>
                  <th className="py-3.5 px-4">CONTACT</th>
                  <th className="py-3.5 px-4">PERSONAS</th>
                  <th className="py-3.5 px-4">
                    <div className="flex items-center space-x-1">
                      <span>ENTERED DATE / TIME</span>
                      <span className="text-emerald-400 font-bold">(RECENT 1ST)</span>
                    </div>
                  </th>
                  <th className="py-3.5 px-4">KYC STATUS</th>
                  <th className="py-3.5 px-4">HEALTH / STATUS</th>
                  <th className="py-3.5 px-4 text-right">QUICK ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {users.map((u) => {
                  const dateInfo = formatUserDate(u.createdAt || u.created_at);
                  const isBlocked = u.status === 'suspended' || u.status === 'banned' || u.is_suspended;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => handleOpenUserDashboard(u.id)}
                    >
                      {/* User Profile */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 flex-shrink-0 shadow-sm">
                            {(u.name || u.fullName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                {u.name || u.fullName || 'Unnamed Account'}
                              </span>
                              {dateInfo.isRecent && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                                  NEW
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              {u.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono text-slate-300 block font-medium">
                            {u.phone || '—'}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">
                            {u.email || (u.district ? `${u.district}${u.state ? `, ${u.state}` : ''}` : '—')}
                          </span>
                        </div>
                      </td>

                      {/* Personas */}
                      <td className="py-3.5 px-4">
                        {renderPersonaBadges(u)}
                      </td>

                      {/* Datetime Entered */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono text-slate-300 block text-[11px]">
                            {dateInfo.formatted}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono block">
                            {dateInfo.relative}
                          </span>
                        </div>
                      </td>

                      {/* KYC Status */}
                      <td className="py-3.5 px-4">
                        {(() => {
                          const kycStat = (u.kycStatus || u.kyc_status || 'PENDING').toUpperCase();
                          const isDigiVerified = Boolean(u.maskedAadhaar) && kycStat === 'VERIFIED';
                          let badgeClass = 'bg-amber-500/15 border-amber-500/30 text-amber-400';
                          if (kycStat === 'VERIFIED') {
                            badgeClass = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
                          } else if (kycStat === 'REJECTED') {
                            badgeClass = 'bg-red-500/15 border-red-500/30 text-red-400';
                          } else if (kycStat === 'RESUBMISSION_REQUESTED') {
                            badgeClass = 'bg-sky-500/15 border-sky-500/30 text-sky-400';
                          } else if (kycStat === 'UNVERIFIED') {
                            badgeClass = 'bg-slate-800/80 border-slate-700 text-slate-400';
                          }

                          return (
                            <div className="flex flex-col items-start gap-1">
                              <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${badgeClass}`}>
                                <span>{kycStat.replace('_', ' ')}</span>
                              </span>
                              {isDigiVerified && (
                                <span className="text-[10px] font-mono text-emerald-400/90 flex items-center space-x-1">
                                  <span>Aadhaar:</span>
                                  <code>{u.maskedAadhaar || 'Verified'}</code>
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-bold border ${
                          isBlocked
                            ? 'bg-red-500/15 border-red-500/30 text-red-400'
                            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                          <span>{u.status || 'ACTIVE'}</span>
                        </span>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* View 360 Single User Dashboard */}
                          <button
                            onClick={() => handleOpenUserDashboard(u.id)}
                            title="Open Single User Dashboard"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Freeze / Unfreeze */}
                          <button
                            onClick={() => handleToggleFreeze(u)}
                            title={isBlocked ? 'Reactivate Account' : 'Freeze / Suspend Account'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isBlocked
                                ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-600 hover:text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-red-600 hover:text-white'
                            }`}
                          >
                            {isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>

                          {/* Impersonate */}
                          <button
                            onClick={() => handleQuickImpersonate(u)}
                            title="Generate 15-min Impersonation Token"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 transition-colors"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer & Pagination */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-2 font-mono text-[11px]">
            <span>Showing</span>
            <strong className="text-white">{users.length}</strong>
            <span>of</span>
            <strong className="text-white">{total}</strong>
            <span>users registered in Firestore</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-[11px]">Per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono text-white text-xs">Page {page}</span>
              <button
                disabled={page * limit >= total}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User 360° Drawer Console */}
      <UserDetailDrawer
        userId={selectedUserId}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedUserId(null);
        }}
        onUserUpdated={() => {
          loadUsers();
          loadStats();
        }}
      />

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={() => {
          loadUsers();
          loadStats();
        }}
      />

      {/* Audit Reason Modal for Mutating Governance Actions */}
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

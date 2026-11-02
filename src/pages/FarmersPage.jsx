import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Sprout, Search, Filter, Calendar, Clock, Download,
  RefreshCw, Eye, ShieldAlert, CheckCircle2, XCircle, ArrowUpDown,
  Lock, Unlock, Key, Copy, Check, ChevronLeft, ChevronRight,
  Shield, AlertCircle, Wheat, MapPin, Phone, Layers, UserCheck,
  TrendingUp, Award, Trash2, FileCheck2, BarChart3, BookOpen,
  TreePine, ScanLine, Radio, Coins, Activity, Send, User, ExternalLink
} from 'lucide-react';
import { farmersApi } from '../api/farmersApi';
import { FarmerDetailDrawer } from '../components/FarmerDetailDrawer';

export const FarmersPage = () => {
  // Mode: 'directory' (Mode B: Farmer 360° Directory) | 'modules' (Mode A: Global Feature Modules)
  const [viewMode, setViewMode] = useState('directory');

  // Query parameters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [cropFilter, setCropFilter] = useState('');

  // Datetime filter states
  const [datePreset, setDatePreset] = useState('all'); // 'all' | 'today' | '7d' | '30d' | 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sorting: recent entered farmer 1stly by default
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc'); // 'desc' (recent 1st) or 'asc'

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Data state
  const [farmers, setFarmers] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [statsRange, setStatsRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState('');

  // Global Persona Modules State (Mode A)
  const [globalOverview, setGlobalOverview] = useState(null);
  const [modulesLoading, setModulesLoading] = useState(false);

  // Modals for Global Persona Modules Override
  const [mandiOverrideModal, setMandiOverrideModal] = useState({
    isOpen: false,
    mandi_id: '',
    commodity: '',
    min_price: '',
    max_price: '',
    modal_price: '',
    submitting: false,
  });

  const [mediaPublishModal, setMediaPublishModal] = useState({
    isOpen: false,
    title: '',
    body: '',
    category: 'news',
    target_state: '',
    target_district: '',
    submitting: false,
  });

  const { farmerId: routeFarmerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Selected Farmer & Drawer
  const [selectedFarmerId, setSelectedFarmerId] = useState(routeFarmerId || null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(Boolean(routeFarmerId));

  // Sync route parameter with farmer drawer state
  // When routeFarmerId is absent (e.g. Navigating to /farmers), immediately close drawer and show main dashboard
  useEffect(() => {
    if (routeFarmerId) {
      setSelectedFarmerId(routeFarmerId);
      setIsDrawerOpen(true);
    } else {
      setSelectedFarmerId(null);
      setIsDrawerOpen(false);
      setViewMode('directory');
    }
  }, [routeFarmerId, location.pathname]);

  const handleOpenFarmerDetail = (fId) => {
    setSelectedFarmerId(fId);
    setIsDrawerOpen(true);
    navigate(`/farmers/${fId}`);
  };

  const handleCloseFarmerDetail = () => {
    setIsDrawerOpen(false);
    setSelectedFarmerId(null);
    navigate('/farmers');
  };

  // Status Action Modal
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    farmer: null,
    newStatus: 'SUSPENDED',
    reason: 'Administrative policy review',
    submitting: false,
  });

  // Impersonate Modal
  const [impersonateModal, setImpersonateModal] = useState({
    isOpen: false,
    farmer: null,
    token: null,
    copied: false,
    loading: false,
  });

  // Fetch High-Level Farmer Statistics
  const loadStats = async (range = statsRange) => {
    setStatsLoading(true);
    try {
      const data = await farmersApi.fetchFarmerStats(range);
      setStats(data);
    } catch (err) {
      console.error('Failed to load farmer stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Global Modules Overview
  const loadGlobalOverview = async () => {
    setModulesLoading(true);
    try {
      const data = await farmersApi.fetchGlobalModulesOverview();
      setGlobalOverview(data);
    } catch (err) {
      console.error('Failed to load global modules overview:', err);
    } finally {
      setModulesLoading(false);
    }
  };

  // Fetch Farmers with all filters (Datetime, Search, District, Crop, Status, KYC, Recent 1st)
  const loadFarmers = async () => {
    setLoading(true);
    setError('');

    // Compute effective datetime boundaries based on preset
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
      const res = await farmersApi.fetchFarmers({
        q: search.trim(),
        status: statusFilter,
        kyc_status: kycFilter,
        state: stateFilter,
        district: districtFilter,
        crop_type: cropFilter,
        start_date: effectiveStartDate,
        end_date: effectiveEndDate,
        page,
        limit,
        sort_by: sortBy,
        order,
      });

      let rawList = res.farmers || [];
      const ignoredIds = new Set(['admin-ops', 'admin-moderator', 'admin-finance', 'admin-compliance', 'admin-agronomy', 'admin-agromony']);
      let list = rawList.filter((f) => {
        if (f.isMock || f.is_mock) return false;
        if (f.phone === '+910000000000' || f.phone === '0000000000' || f.id === 'user_0000000000') return false;
        if (ignoredIds.has(f.id)) return false;
        return true;
      });

      // Client-side date filter safeguard in case backend does not filter datetime range
      if (effectiveStartDate) {
        const startMs = new Date(effectiveStartDate).getTime();
        list = list.filter((f) => {
          const d = new Date(f.createdAt || f.created_at || f.registration_date || 0).getTime();
          return !isNaN(d) && d >= startMs;
        });
      }
      if (effectiveEndDate) {
        const endMs = new Date(effectiveEndDate).getTime();
        list = list.filter((f) => {
          const d = new Date(f.createdAt || f.created_at || f.registration_date || 0).getTime();
          return !isNaN(d) && d <= endMs;
        });
      }

      // Sort: recent entered farmer 1stly (descending by createdAt datetime)
      list.sort((a, b) => {
        const da = new Date(a.createdAt || a.created_at || a.registration_date || 0).getTime() || 0;
        const db = new Date(b.createdAt || b.created_at || b.registration_date || 0).getTime() || 0;
        return order === 'desc' ? db - da : da - db;
      });

      setFarmers(list);
      setTotal(res.total || list.length);
    } catch (err) {
      console.error('Failed to load farmers list:', err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to load farmers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadGlobalOverview();
  }, [statsRange]);

  useEffect(() => {
    loadFarmers();
  }, [
    search,
    statusFilter,
    kycFilter,
    stateFilter,
    districtFilter,
    cropFilter,
    datePreset,
    startDate,
    endDate,
    sortBy,
    order,
    page,
    limit,
  ]);

  // Handle status update
  const handleConfirmStatus = async () => {
    if (!statusModal.farmer) return;
    setStatusModal((prev) => ({ ...prev, submitting: true }));

    try {
      await farmersApi.updateFarmerStatus(statusModal.farmer.id, {
        status: statusModal.newStatus,
        reason: statusModal.reason,
      });

      setStatusModal({
        isOpen: false,
        farmer: null,
        newStatus: 'SUSPENDED',
        reason: 'Administrative policy review',
        submitting: false,
      });

      loadFarmers();
      loadStats();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to change farmer status');
      setStatusModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Handle impersonate farmer
  const handleInitiateImpersonate = async (farmer) => {
    setImpersonateModal({
      isOpen: true,
      farmer,
      token: null,
      copied: false,
      loading: true,
    });

    try {
      const res = await farmersApi.impersonateFarmer(farmer.id);
      setImpersonateModal({
        isOpen: true,
        farmer,
        token: res.token,
        copied: false,
        loading: false,
      });
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to generate impersonation token');
      setImpersonateModal({
        isOpen: false,
        farmer: null,
        token: null,
        copied: false,
        loading: false,
      });
    }
  };

  // Handle Mandi Rate Override
  const handleMandiOverride = async () => {
    setMandiOverrideModal(prev => ({ ...prev, submitting: true }));
    try {
      await farmersApi.overrideGlobalMandiRate({
        mandi_id: mandiOverrideModal.mandi_id,
        commodity: mandiOverrideModal.commodity,
        min_price: Number(mandiOverrideModal.min_price),
        max_price: Number(mandiOverrideModal.max_price),
        modal_price: Number(mandiOverrideModal.modal_price),
      });
      alert(`Mandi rate updated successfully for ${mandiOverrideModal.commodity}`);
      setMandiOverrideModal(prev => ({ ...prev, isOpen: false, submitting: false }));
      loadGlobalOverview();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to override mandi rate');
      setMandiOverrideModal(prev => ({ ...prev, submitting: false }));
    }
  };

  // Handle Publish Media
  const handleMediaPublish = async () => {
    setMediaPublishModal(prev => ({ ...prev, submitting: true }));
    try {
      await farmersApi.publishGlobalMedia({
        title: mediaPublishModal.title,
        body: mediaPublishModal.body,
        category: mediaPublishModal.category,
        target_state: mediaPublishModal.target_state,
        target_district: mediaPublishModal.target_district,
      });
      alert('Regional agri-news advisory published successfully!');
      setMediaPublishModal({
        isOpen: false,
        title: '',
        body: '',
        category: 'news',
        target_state: 'Maharashtra',
        target_district: 'Pune',
        submitting: false,
      });
      loadGlobalOverview();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to publish media');
      setMediaPublishModal(prev => ({ ...prev, submitting: false }));
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Page Title & View Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                <span>Farmer Management & 18 Persona Features Suite</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  SOP-01 Verified
                </span>
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">
                Superadmin Farmer 360° Console • Real-time database telemetry & 18 common feature administrative controls
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle: Mode B (Directory) vs Mode A (Global Modules) */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('directory')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'directory'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Farmer 360° Directory</span>
            </button>
            <button
              onClick={() => setViewMode('modules')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'modules'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Global Feature Modules</span>
            </button>
          </div>

          <button
            onClick={() => {
              loadFarmers();
              loadStats();
              loadGlobalOverview();
            }}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
            title="Refresh Real-time Records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODE A: GLOBAL FARMER PERSONA FEATURE MANAGEMENT                      */}
      {/* ===================================================================== */}
      {viewMode === 'modules' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top-level KPI Queues Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Mandi Rates Live</span>
                <BarChart3 className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">{globalOverview?.mandi_prices_count ?? 0}</div>
              <div className="text-[11px] text-emerald-400 mt-1">APMC Feed Active</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Govt Schemes</span>
                <Award className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">{globalOverview?.schemes_catalog_count ?? 0}</div>
              <div className="text-[11px] text-blue-400 mt-1">Eligibility Matching</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Gurukul Courses</span>
                <BookOpen className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">{globalOverview?.gurukul_courses_count ?? 0}</div>
              <div className="text-[11px] text-indigo-400 mt-1">Academy Active</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Tree Geo-Tags</span>
                <TreePine className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">{globalOverview?.tree_verification_queue || 0}</div>
              <div className="text-[11px] text-teal-400 mt-1">Pending Verification</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>7/12 Land KYC</span>
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">{globalOverview?.land_approval_queue || 0}</div>
              <div className="text-[11px] text-emerald-400 mt-1">Pending Approval</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>AI Scans Review</span>
                <ScanLine className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">{globalOverview?.ai_scanner_review_queue || 0}</div>
              <div className="text-[11px] text-purple-400 mt-1">Agronomist Queue</div>
            </div>
          </div>

          {/* Quick Action Modules Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Mandi Price Override */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                  <h3 className="font-semibold text-white text-sm">3.15 APMC Mandi Rates Live Override</h3>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Global Feed
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Manually seed or override live APMC mandi wholesale rates when the automated government feed is delayed.
              </p>
              <button
                onClick={() => setMandiOverrideModal(prev => ({ ...prev, isOpen: true }))}
                className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition"
              >
                Override Mandi Commodity Rate
              </button>
            </div>

            {/* Card 2: Regional AgriNews & Gyan Publisher */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white text-sm">3.3 Regional AgriNews & Advisory Publisher</h3>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Gyan Hub
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Broadcast urgent weather alerts, pest outbreaks, or localized agronomy advisories targeted to specific districts.
              </p>
              <button
                onClick={() => setMediaPublishModal(prev => ({ ...prev, isOpen: true }))}
                className="w-full py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold transition"
              >
                Publish Regional Advisory
              </button>
            </div>

            {/* Card 3: Gurukul Academy Curriculum */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-white text-sm">3.2 Gurukul Academy Global Curriculum</h3>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  LMS Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Manage all {globalOverview?.gurukul_courses_count ?? 0} farmer-facing courses, certification prerequisites, and instructor schedules.
              </p>
              <button
                onClick={() => setViewMode('directory')}
                className="w-full py-2 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold transition"
              >
                Inspect Individual Enrollments
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE B: FARMER 360° DIRECTORY & FILTERING                             */}
      {/* ===================================================================== */}
      {viewMode === 'directory' && (
        <div className="space-y-6 animate-in fade-in">
          {/* High-Level Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Registered Farmers</p>
                  <h3 className="text-2xl font-black text-white font-mono mt-1">
                    {statsLoading ? '...' : (stats?.total_farmers ?? total)}
                  </h3>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                  <Sprout className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Acreage Verified</p>
                  <h3 className="text-2xl font-black text-white font-mono mt-1">
                    {statsLoading ? '...' : `${stats?.total_acreage_registered ?? 0} Ac`}
                  </h3>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                  <Wheat className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Active Produce Lots</p>
                  <h3 className="text-2xl font-black text-white font-mono mt-1">
                    {statsLoading ? '...' : (stats?.active_lots ?? 0)}
                  </h3>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">7/12 KYC Backlog</p>
                  <h3 className="text-2xl font-black text-white font-mono mt-1">
                    {statsLoading ? '...' : (stats?.kyc_backlog ?? 0)}
                  </h3>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
                  <FileCheck2 className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Search & Multi-Dimensional Filters Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            {/* Row 1: Search Query + District + Crop + KYC + Status */}
            <form onSubmit={(e) => { e.preventDefault(); loadFarmers(); }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="lg:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by name, phone (+91), or ID..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <select
                  value={districtFilter}
                  onChange={(e) => {
                    setDistrictFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="">All Districts</option>
                  <option value="Pune">Pune</option>
                  <option value="Nashik">Nashik</option>
                  <option value="Nagpur">Nagpur</option>
                  <option value="Ahmednagar">Ahmednagar</option>
                  <option value="Satara">Satara</option>
                  <option value="Solapur">Solapur</option>
                  <option value="Kolhapur">Kolhapur</option>
                  <option value="Aurangabad">Aurangabad</option>
                </select>
              </div>

              <div>
                <select
                  value={cropFilter}
                  onChange={(e) => {
                    setCropFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="">All Crops</option>
                  <option value="Sugarcane">Sugarcane</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Onion">Onion</option>
                  <option value="Grapes">Grapes</option>
                  <option value="Pomegranate">Pomegranate</option>
                </select>
              </div>

              <div>
                <select
                  value={kycFilter}
                  onChange={(e) => {
                    setKycFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="">All KYC Status</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </form>

            {/* Row 2: Datetime Range Filter & Sorting (Recent Entered 1stly) */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              {/* Datetime Presets */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Registration Datetime:</span>
                </span>
                <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                  {[
                    { id: 'all', label: 'All Time' },
                    { id: 'today', label: 'Today' },
                    { id: '7d', label: 'Last 7 Days' },
                    { id: '30d', label: 'Last 30 Days' },
                    { id: 'custom', label: 'Custom' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setDatePreset(p.id);
                        setPage(1);
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                        datePreset === p.id
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Datetime Picker */}
              {datePreset === 'custom' && (
                <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg">
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setPage(1);
                    }}
                    className="bg-transparent text-slate-200 text-xs focus:outline-none"
                    title="Start Datetime"
                  />
                  <span className="text-slate-500">to</span>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPage(1);
                    }}
                    className="bg-transparent text-slate-200 text-xs focus:outline-none"
                    title="End Datetime"
                  />
                </div>
              )}

              {/* Sorting: Recent Entered Farmer 1stly Indicator */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Sort By:</span>
                <button
                  onClick={() => {
                    const nextOrder = order === 'desc' ? 'asc' : 'desc';
                    setOrder(nextOrder);
                    setPage(1);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-emerald-400 hover:border-slate-700 flex items-center space-x-1.5 transition font-semibold"
                  title="Click to toggle order"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span>Recent Entered Farmer 1stly ({order.toUpperCase()})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Farmers Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Farmer Details</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Land & Crops</th>
                    <th
                      className="p-4 cursor-pointer hover:text-white transition select-none"
                      onClick={() => {
                        setSortBy('createdAt');
                        setOrder(order === 'desc' ? 'asc' : 'desc');
                      }}
                      title="Click to sort by registration datetime (Recent entered farmer 1stly)"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Registration Datetime</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-normal">
                          {order === 'desc' ? 'Recent 1st' : 'Oldest 1st'}
                        </span>
                      </div>
                    </th>
                    <th className="p-4">KYC Status</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-2" />
                        <span>Querying live database records...</span>
                      </td>
                    </tr>
                  ) : farmers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-500">
                        <Sprout className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                        <span>No farmers match the specified datetime or search filters.</span>
                      </td>
                    </tr>
                  ) : (
                    farmers.map((farmer) => (
                      <tr
                        key={farmer.id}
                        className="hover:bg-slate-800/40 transition cursor-pointer"
                        onClick={() => handleOpenFarmerDetail(farmer.id)}
                      >
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                              {(farmer.name || farmer.fullName || 'F')[0]}
                            </div>
                            <div>
                              <div
                                onClick={() => handleOpenFarmerDetail(farmer.id)}
                                className="font-bold text-white hover:text-emerald-400 cursor-pointer font-sans text-sm"
                              >
                                {farmer.name || farmer.fullName || 'Unnamed Farmer'}
                              </div>
                              <div className="text-[11px] text-slate-400">{farmer.phone || '—'}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center space-x-1.5 text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            <span>{farmer.district || farmer.village || '—'}{farmer.state ? `, ${farmer.state}` : ''}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div>
                            <span className="font-bold text-white">{farmer.land_area_acres || farmer.landAreaAcres ? `${farmer.land_area_acres || farmer.landAreaAcres} Acres` : '—'}</span>
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">
                              {(farmer.crops || farmer.activeCrops)?.length ? (farmer.crops || farmer.activeCrops).join(', ') : 'No crops registered'}
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-slate-400">
                          <div className="flex items-center space-x-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>
                              {farmer.createdAt || farmer.created_at
                                ? new Date(farmer.createdAt || farmer.created_at).toLocaleString('en-IN', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                  })
                                : '—'}
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            (farmer.kyc_status || farmer.kycStatus) === 'VERIFIED'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {farmer.kyc_status || farmer.kycStatus || 'PENDING'}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            (farmer.status || '').toUpperCase() === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {farmer.status || 'ACTIVE'}
                          </span>
                        </td>

                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-1.5">
                            <a
                              href={`/users/${farmer.id}`}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-emerald-400 hover:bg-slate-700 transition-colors"
                              title="Open Single User Dashboard"
                            >
                              <User className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => handleOpenFarmerDetail(farmer.id)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                              title="Inspect 18 Features & 360° Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleInitiateImpersonate(farmer)}
                              className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20"
                              title="Impersonate Farmer"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setStatusModal({
                                  isOpen: true,
                                  farmer,
                                  newStatus: farmer.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                                  reason: 'Administrative policy review',
                                  submitting: false,
                                })
                              }
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700"
                              title="Toggle Account Status"
                            >
                              {farmer.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs font-mono text-slate-400">
              <div>
                Showing <strong className="text-white">{farmers.length}</strong> of <strong className="text-white">{total}</strong> farmers
              </div>

              <div className="flex items-center space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5 inline mr-1" />
                  Prev
                </button>

                <span className="px-3 py-1 text-slate-300">
                  Page <strong className="text-white">{page}</strong> of {totalPages}
                </span>

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* GLOBAL MODULES MODALS                                                 */}
      {/* ===================================================================== */}

      {/* APMC Mandi Override Modal */}
      {mandiOverrideModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <span>Override APMC Mandi Rate</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Mandi Terminal ID</label>
                <input
                  type="text"
                  value={mandiOverrideModal.mandi_id}
                  onChange={(e) => setMandiOverrideModal(prev => ({ ...prev, mandi_id: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Commodity</label>
                <input
                  type="text"
                  value={mandiOverrideModal.commodity}
                  onChange={(e) => setMandiOverrideModal(prev => ({ ...prev, commodity: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Min Price (₹)</label>
                  <input
                    type="number"
                    value={mandiOverrideModal.min_price}
                    onChange={(e) => setMandiOverrideModal(prev => ({ ...prev, min_price: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Modal Price (₹)</label>
                  <input
                    type="number"
                    value={mandiOverrideModal.modal_price}
                    onChange={(e) => setMandiOverrideModal(prev => ({ ...prev, modal_price: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Max Price (₹)</label>
                  <input
                    type="number"
                    value={mandiOverrideModal.max_price}
                    onChange={(e) => setMandiOverrideModal(prev => ({ ...prev, max_price: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setMandiOverrideModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleMandiOverride}
                disabled={mandiOverrideModal.submitting}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-500"
              >
                {mandiOverrideModal.submitting ? 'Saving...' : 'Publish Override'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regional Media / Gyan Publisher Modal */}
      {mediaPublishModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-lg w-full space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-purple-400" />
              <span>Publish Regional Agri-News Advisory</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Advisory Title</label>
                <input
                  type="text"
                  placeholder="e.g. Locust Outbreak Warning in Pune & Satara"
                  value={mediaPublishModal.title}
                  onChange={(e) => setMediaPublishModal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Target District</label>
                <input
                  type="text"
                  value={mediaPublishModal.target_district}
                  onChange={(e) => setMediaPublishModal(prev => ({ ...prev, target_district: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Content / Body</label>
                <textarea
                  rows={4}
                  placeholder="Detailed recommendations from agricultural university..."
                  value={mediaPublishModal.body}
                  onChange={(e) => setMediaPublishModal(prev => ({ ...prev, body: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setMediaPublishModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleMediaPublish}
                disabled={mediaPublishModal.submitting}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500"
              >
                {mediaPublishModal.submitting ? 'Publishing...' : 'Broadcast Advisory'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Impersonate Farmer Modal */}
      {impersonateModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <span>Farmer Impersonation Token</span>
              </h3>
              <button
                onClick={() => setImpersonateModal({ isOpen: false, farmer: null, token: null, copied: false, loading: false })}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400">Target Farmer:</div>
                <div className="font-bold text-white text-sm">{impersonateModal.farmer?.name || impersonateModal.farmer?.fullName || 'Farmer'}</div>
                <div className="text-[11px] text-emerald-400">{impersonateModal.farmer?.phone || '—'} • ID: #{impersonateModal.farmer?.id}</div>
              </div>

              {impersonateModal.loading ? (
                <div className="py-6 text-center text-slate-400 flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                  <span>Generating scoped JWT impersonation token from live backend...</span>
                </div>
              ) : impersonateModal.token ? (
                <div className="space-y-2">
                  <label className="text-slate-300 block">Scoped Impersonation Bearer Token (15m validity):</label>
                  <div className="relative">
                    <textarea
                      readOnly
                      rows={3}
                      value={impersonateModal.token}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-amber-300 text-[11px] font-mono select-all focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(impersonateModal.token);
                      setImpersonateModal((prev) => ({ ...prev, copied: true }));
                      setTimeout(() => setImpersonateModal((prev) => ({ ...prev, copied: false })), 2000);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 font-semibold text-xs flex items-center justify-center gap-2 transition"
                  >
                    {impersonateModal.copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{impersonateModal.copied ? 'Token Copied to Clipboard!' : 'Copy Impersonation Token'}</span>
                  </button>
                </div>
              ) : (
                <div className="text-red-400 py-4 text-center">Failed to generate token.</div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setImpersonateModal({ isOpen: false, farmer: null, token: null, copied: false, loading: false })}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Status Toggle Modal */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {statusModal.newStatus === 'ACTIVE' ? <Unlock className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5 text-red-400" />}
              <span>{statusModal.newStatus === 'ACTIVE' ? 'Activate Farmer Account' : 'Suspend Farmer Account'}</span>
            </h3>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1 font-mono">
              <div className="text-slate-400">Target Farmer:</div>
              <div className="font-bold text-white">{statusModal.farmer?.name || statusModal.farmer?.fullName || 'Farmer'}</div>
              <div className="text-[11px] text-slate-500">ID: {statusModal.farmer?.id}</div>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">New Account Status</label>
                <select
                  value={statusModal.newStatus}
                  onChange={(e) => setStatusModal((prev) => ({ ...prev, newStatus: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="ACTIVE">ACTIVE (Restore full farmer access)</option>
                  <option value="SUSPENDED">SUSPENDED (Invalidate active session tokens)</option>
                  <option value="BANNED">BANNED (Permanent platform ban)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Administrative Audit Reason (Mandatory)</label>
                <textarea
                  rows={3}
                  placeholder="Justification for account status modification..."
                  value={statusModal.reason}
                  onChange={(e) => setStatusModal((prev) => ({ ...prev, reason: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setStatusModal({ isOpen: false, farmer: null, newStatus: 'SUSPENDED', reason: '', submitting: false })}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatus}
                disabled={statusModal.submitting}
                className={`px-4 py-2 rounded-lg text-white text-xs font-semibold ${
                  statusModal.newStatus === 'ACTIVE' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                {statusModal.submitting ? 'Updating...' : 'Confirm Status Override'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Farmer 360° Drawer */}
      {isDrawerOpen && selectedFarmerId && (
        <FarmerDetailDrawer
          userId={selectedFarmerId}
          isOpen={isDrawerOpen}
          onClose={handleCloseFarmerDetail}
          onFarmerUpdated={() => {
            loadFarmers();
            loadStats();
          }}
        />
      )}
    </div>
  );
};

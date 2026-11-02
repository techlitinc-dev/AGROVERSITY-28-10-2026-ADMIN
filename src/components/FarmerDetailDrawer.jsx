import React, { useState, useEffect } from 'react';
import {
  X, Sprout, Shield, Phone, Mail, MapPin, Calendar, Clock,
  FileCheck2, AlertTriangle, CheckCircle2, XCircle, ArrowUpRight,
  TrendingUp, Package, ShoppingBag, Star, RefreshCw, Key,
  Copy, Check, FileText, Ban, Lock, Unlock, DollarSign, Layers,
  ExternalLink, Eye, ChevronRight, Activity, Terminal, AlertCircle,
  Wheat, Droplet, Sun, Edit3, Trash2, CheckCircle, ChevronDown,
  BookOpen, Award, Radio, MessageSquare, Bookmark, Heart, TreePine,
  Coins, Users, ShieldAlert, Cpu, BarChart3, ScanLine, FileCheck,
  CreditCard, Wallet, ArrowDownLeft, Scale, Building, Send,
  SlidersHorizontal, Upload, FileSearch, Sparkles
} from 'lucide-react';
import { farmersApi } from '../api/farmersApi';

export const FarmerDetailDrawer = ({ userId, isOpen, onClose, onFarmerUpdated }) => {
  // 5 Core Common Feature Tabs + Farm Profile
  // 'payments' | 'ratings' | 'saved_following' | 'referrals' | 'vault' | 'farm_profile'
  const [activeTab, setActiveTab] = useState('payments');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 360 Aggregated Snapshot (FarmerCommonFiveFeatures360)
  const [common5Summary, setCommon5Summary] = useState(null);

  // -------------------------------------------------------------------------
  // Tab 1: Payment & Transactions State
  // -------------------------------------------------------------------------
  const [paymentsOverview, setPaymentsOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [upiIds, setUpiIds] = useState([]);
  const [txnTypeFilter, setTxnTypeFilter] = useState('');
  const [txnStatusFilter, setTxnStatusFilter] = useState('');
  const [txnModuleFilter, setTxnModuleFilter] = useState('');
  const [settlementStatusFilter, setSettlementStatusFilter] = useState('');
  const [paymentsSubTab, setPaymentsSubTab] = useState('ledger'); // 'ledger' | 'settlements' | 'banks'

  // Tab 1 Modals
  const [reconcileModal, setReconcileModal] = useState({
    isOpen: false,
    transaction_id: '',
    settlement_id: '',
    action: 'MARK_SETTLED',
    utr_number: '',
    reason: '',
    submitting: false,
  });
  const [bankVerifyModal, setBankVerifyModal] = useState({
    isOpen: false,
    accountId: '',
    status: 'VERIFIED',
    admin_note: '',
    submitting: false,
  });

  // -------------------------------------------------------------------------
  // Tab 2: Ratings & Reviews State
  // -------------------------------------------------------------------------
  const [ratingsOverview, setRatingsOverview] = useState(null);
  const [ratingsList, setRatingsList] = useState([]);
  const [ratingPrompts, setRatingPrompts] = useState([]);
  const [reviewDirection, setReviewDirection] = useState('received'); // 'received' | 'given'
  const [reviewTargetType, setReviewTargetType] = useState('');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('');
  const [reviewStarsFilter, setReviewStarsFilter] = useState('');
  const [ratingsSubTab, setRatingsSubTab] = useState('reviews'); // 'reviews' | 'prompts'

  // Tab 2 Modals
  const [moderateModal, setModerateModal] = useState({
    isOpen: false,
    reviewId: '',
    reviewText: '',
    status: 'PUBLISHED',
    recalculate_trust: true,
    reason: '',
    submitting: false,
  });
  const [deleteRatingModal, setDeleteRatingModal] = useState({
    isOpen: false,
    reviewId: '',
    reason: 'Violates platform policies',
    submitting: false,
  });

  // -------------------------------------------------------------------------
  // Tab 3: Saved & Following State
  // -------------------------------------------------------------------------
  const [savedOverview, setSavedOverview] = useState(null);
  const [connections, setConnections] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searchesAndAlerts, setSearchesAndAlerts] = useState([]);
  const [savedSubTab, setSavedSubTab] = useState('connections'); // 'connections' | 'wishlist' | 'searches' | 'alerts'
  const [connDirection, setConnDirection] = useState('following'); // 'following' | 'followers' | 'favorite_transporters'
  const [connRoleFilter, setConnRoleFilter] = useState('');
  const [wishlistTypeFilter, setWishlistTypeFilter] = useState('');

  // Tab 3 Modals
  const [deleteSavedModal, setDeleteSavedModal] = useState({
    isOpen: false,
    category: '',
    itemId: '',
    title: '',
    reason: 'Administrative cleanup',
    submitting: false,
  });

  // -------------------------------------------------------------------------
  // Tab 4: Refer & Earn State
  // -------------------------------------------------------------------------
  const [referralsOverview, setReferralsOverview] = useState(null);
  const [invitees, setInvitees] = useState([]);
  const [rewardsLedger, setRewardsLedger] = useState([]);
  const [inviteeStatusFilter, setInviteeStatusFilter] = useState('');
  const [referralsSubTab, setReferralsSubTab] = useState('invitees'); // 'invitees' | 'ledger'

  // Tab 4 Modals
  const [actionReferralModal, setActionReferralModal] = useState({
    isOpen: false,
    referralId: '',
    action: 'APPROVE_REWARD',
    reward_coins: 100,
    reason: '',
    submitting: false,
  });
  const [campaignRulesModal, setCampaignRulesModal] = useState({
    isOpen: false,
    referrer_coins: 100,
    referee_coins: 50,
    milestone_trigger: 'KYC_VERIFIED',
    is_active: true,
    submitting: false,
  });

  // -------------------------------------------------------------------------
  // Tab 5: Document Vault State
  // -------------------------------------------------------------------------
  const [vaultOverview, setVaultOverview] = useState(null);
  const [vaultDocuments, setVaultDocuments] = useState([]);
  const [vaultCategoryFilter, setVaultCategoryFilter] = useState('all');
  const [vaultStatusFilter, setVaultStatusFilter] = useState('all');
  const [selectedVaultDoc, setSelectedVaultDoc] = useState(null);
  const [docActivityData, setDocActivityData] = useState(null);
  const [loadingDocActivity, setLoadingDocActivity] = useState(false);

  // Tab 5 Modals
  const [verifyVaultDocModal, setVerifyVaultDocModal] = useState({
    isOpen: false,
    docId: '',
    title: '',
    status: 'VERIFIED',
    notes: '',
    rejection_reason: '',
    extracted_data_override: null,
    submitting: false,
  });
  const [uploadVaultDocModal, setUploadVaultDocModal] = useState({
    isOpen: false,
    title: '',
    category: 'kyc',
    doc_type: 'AADHAAR',
    file_name: '',
    download_url: '',
    notes: '',
    submitting: false,
  });

  // -------------------------------------------------------------------------
  // Tab 6: Farm Profile & Land Records State
  // -------------------------------------------------------------------------
  const [landRecords, setLandRecords] = useState([]);
  const [farmerLots, setFarmerLots] = useState([]);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [landVerifyModal, setLandVerifyModal] = useState({
    isOpen: false,
    recordId: null,
    status: 'VERIFIED',
    remarks: '',
    submitting: false,
  });

  // General Modals: Impersonate, Account Status, Copy State
  const [impersonateToken, setImpersonateToken] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [impersonating, setImpersonating] = useState(false);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    newStatus: 'SUSPENDED',
    reason: '',
    submitting: false,
  });

  // Format Bytes helper
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // -------------------------------------------------------------------------
  // Data Loaders
  // -------------------------------------------------------------------------
  const load360Summary = async () => {
    try {
      const summary = await farmersApi.fetchCommon5Summary(userId);
      setCommon5Summary(summary);
    } catch (err) {
      console.warn('360 Summary endpoint fallback:', err);
    }
  };

  const loadPaymentsData = async () => {
    try {
      const [overviewRes, txnsRes, settlementsRes, banksRes] = await Promise.all([
        farmersApi.getFarmerPaymentsOverview(userId).catch(() => null),
        farmersApi.getFarmerTransactions(userId, {
          type: txnTypeFilter,
          status: txnStatusFilter,
          module: txnModuleFilter,
        }).catch(() => ({ transactions: [] })),
        farmersApi.getFarmerSettlements(userId, { status: settlementStatusFilter }).catch(() => ({ settlements: [] })),
        farmersApi.getFarmerBankAccounts(userId).catch(() => ({ bank_accounts: [], upi_ids: [] })),
      ]);

      if (overviewRes) setPaymentsOverview(overviewRes);
      setTransactions(txnsRes.transactions || txnsRes.ledger || []);
      setSettlements(settlementsRes.settlements || []);
      setBankAccounts(banksRes.bank_accounts || []);
      setUpiIds(banksRes.upi_ids || []);
    } catch (err) {
      console.error('Failed to load payments data:', err);
    }
  };

  const loadRatingsData = async () => {
    try {
      const [overviewRes, listRes, promptsRes] = await Promise.all([
        farmersApi.getFarmerRatingsOverview(userId).catch(() => null),
        farmersApi.getFarmerRatingsList(userId, {
          direction: reviewDirection,
          target_type: reviewTargetType,
          status: reviewStatusFilter,
          min_stars: reviewStarsFilter ? Number(reviewStarsFilter) : undefined,
        }).catch(() => ({ ratings: [] })),
        farmersApi.getFarmerRatingPrompts(userId).catch(() => ({ prompts: [] })),
      ]);

      if (overviewRes) setRatingsOverview(overviewRes);
      setRatingsList(listRes.ratings || listRes.reviews || []);
      setRatingPrompts(promptsRes.prompts || []);
    } catch (err) {
      console.error('Failed to load ratings data:', err);
    }
  };

  const loadSavedData = async () => {
    try {
      const [overviewRes, connsRes, wishRes, alertsRes] = await Promise.all([
        farmersApi.getFarmerSavedFollowingOverview(userId).catch(() => null),
        farmersApi.getFarmerConnections(userId, {
          direction: connDirection,
          persona_role: connRoleFilter,
        }).catch(() => ({ connections: [] })),
        farmersApi.getFarmerWishlist(userId, { item_type: wishlistTypeFilter }).catch(() => ({ wishlist: [] })),
        farmersApi.getFarmerSearchesAndAlerts(userId).catch(() => ({ items: [] })),
      ]);

      if (overviewRes) setSavedOverview(overviewRes);
      setConnections(connsRes.connections || []);
      setWishlist(wishRes.wishlist || []);
      setSearchesAndAlerts(alertsRes.items || []);
    } catch (err) {
      console.error('Failed to load saved/following data:', err);
    }
  };

  const loadReferralsData = async () => {
    try {
      const [overviewRes, inviteesRes, ledgerRes] = await Promise.all([
        farmersApi.getFarmerReferralsOverview(userId).catch(() => null),
        farmersApi.getFarmerReferralInvitees(userId, { status: inviteeStatusFilter }).catch(() => ({ invitees: [] })),
        farmersApi.getFarmerReferralLedger(userId).catch(() => ({ ledger: [] })),
      ]);

      if (overviewRes) setReferralsOverview(overviewRes);
      setInvitees(inviteesRes.invitees || inviteesRes.referrals || []);
      setRewardsLedger(ledgerRes.ledger || []);
    } catch (err) {
      console.error('Failed to load referrals data:', err);
    }
  };

  const loadVaultData = async () => {
    try {
      const [overviewRes, docsRes] = await Promise.all([
        farmersApi.getFarmerVaultOverview(userId).catch(() => null),
        farmersApi.getFarmerVaultDocuments(userId, {
          category: vaultCategoryFilter === 'all' ? '' : vaultCategoryFilter,
          status: vaultStatusFilter === 'all' ? '' : vaultStatusFilter,
        }).catch(() => ({ documents: [] })),
      ]);

      if (overviewRes) setVaultOverview(overviewRes);
      const docs = docsRes.documents || [];
      setVaultDocuments(docs);
      if (docs.length > 0 && !selectedVaultDoc) {
        inspectVaultDoc(docs[0]);
      }
    } catch (err) {
      console.error('Failed to load vault data:', err);
    }
  };

  const inspectVaultDoc = async (doc) => {
    setSelectedVaultDoc(doc);
    setLoadingDocActivity(true);
    try {
      const act = await farmersApi.getFarmerVaultDocActivity(userId, doc.id);
      setDocActivityData(act);
    } catch {
      setDocActivityData(null);
    } finally {
      setLoadingDocActivity(false);
    }
  };

  const loadFarmProfileData = async () => {
    try {
      const [landRes, lotsRes, diaryRes] = await Promise.all([
        farmersApi.fetchLandRecords(userId).catch(() => ({ land_records: [] })),
        farmersApi.fetchFarmerLots(userId).catch(() => ({ lots: [] })),
        farmersApi.fetchDiaryEntries(userId).catch(() => ({ entries: [] })),
      ]);

      setLandRecords(landRes.land_records || landRes.landRecords || []);
      setFarmerLots(lotsRes.lots || []);
      setDiaryEntries(diaryRes.entries || []);
    } catch (err) {
      console.error('Failed to load farm profile data:', err);
    }
  };

  // Master Initial Load
  const loadAllData = async () => {
    if (!userId) return;
    setLoading(true);
    setError('');

    try {
      await Promise.all([
        load360Summary(),
        loadPaymentsData(),
        loadRatingsData(),
        loadSavedData(),
        loadReferralsData(),
        loadVaultData(),
        loadFarmProfileData(),
      ]);
    } catch (err) {
      console.error('Failed to load farmer data:', err);
      setError(err?.response?.data?.error?.message || err?.message || 'Error loading farmer records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      loadAllData();
    }
  }, [isOpen, userId]);

  // Tab-specific filters refresh
  useEffect(() => {
    if (isOpen && userId) {
      if (activeTab === 'payments') loadPaymentsData();
      if (activeTab === 'ratings') loadRatingsData();
      if (activeTab === 'saved_following') loadSavedData();
      if (activeTab === 'referrals') loadReferralsData();
      if (activeTab === 'vault') loadVaultData();
    }
  }, [
    activeTab,
    txnTypeFilter,
    txnStatusFilter,
    txnModuleFilter,
    settlementStatusFilter,
    reviewDirection,
    reviewTargetType,
    reviewStatusFilter,
    reviewStarsFilter,
    connDirection,
    connRoleFilter,
    wishlistTypeFilter,
    inviteeStatusFilter,
    vaultCategoryFilter,
    vaultStatusFilter,
  ]);

  if (!isOpen) return null;

  // -------------------------------------------------------------------------
  // Action Handlers
  // -------------------------------------------------------------------------
  const handleImpersonate = async () => {
    setImpersonating(true);
    try {
      const res = await farmersApi.impersonateFarmer(userId);
      setImpersonateToken(res.token);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to impersonate farmer');
    } finally {
      setImpersonating(false);
    }
  };

  const handleUpdateStatus = async () => {
    setStatusModal((prev) => ({ ...prev, submitting: true }));
    try {
      await farmersApi.updateFarmerStatus(userId, {
        status: statusModal.newStatus,
        reason: statusModal.reason || 'Administrative status update',
      });
      setStatusModal({ isOpen: false, newStatus: 'SUSPENDED', reason: '', submitting: false });
      await load360Summary();
      if (onFarmerUpdated) onFarmerUpdated();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update farmer status');
      setStatusModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleConfirmReconcile = async () => {
    setReconcileModal((prev) => ({ ...prev, submitting: true }));
    try {
      await farmersApi.reconcileFarmerPayment(userId, {
        transaction_id: reconcileModal.transaction_id || undefined,
        settlement_id: reconcileModal.settlement_id || undefined,
        action: reconcileModal.action,
        utr_number: reconcileModal.utr_number,
        reason: reconcileModal.reason || 'Superadmin reconciliation override',
      });
      setReconcileModal({
        isOpen: false,
        transaction_id: '',
        settlement_id: '',
        action: 'MARK_SETTLED',
        utr_number: '',
        reason: '',
        submitting: false,
      });
      await loadPaymentsData();
      await load360Summary();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to reconcile payment');
      setReconcileModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleConfirmBankVerify = async () => {
    setBankVerifyModal((prev) => ({ ...prev, submitting: true }));
    try {
      await farmersApi.verifyFarmerBankAccount(userId, bankVerifyModal.accountId, {
        status: bankVerifyModal.status,
        admin_note: bankVerifyModal.admin_note,
      });
      setBankVerifyModal({
        isOpen: false,
        accountId: '',
        status: 'VERIFIED',
        admin_note: '',
        submitting: false,
      });
      await loadPaymentsData();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to verify bank account');
      setBankVerifyModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleConfirmModerateReview = async () => {
    setModerateModal((prev) => ({ ...prev, submitting: true }));
    try {
      await farmersApi.moderateFarmerRating(userId, moderateModal.reviewId, {
        status: moderateModal.status,
        recalculate_trust: moderateModal.recalculate_trust,
        reason: moderateModal.reason,
      });
      setModerateModal({
        isOpen: false,
        reviewId: '',
        reviewText: '',
        status: 'PUBLISHED',
        recalculate_trust: true,
        reason: '',
        submitting: false,
      });
      await loadRatingsData();
      await load360Summary();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to moderate review');
      setModerateModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleConfirmDeleteRating = async () => {
    setDeleteRatingModal((prev) => ({ ...prev, submitting: true }));
    try {
      await farmersApi.deleteFarmerRating(userId, deleteRatingModal.reviewId, deleteRatingModal.reason);
      setDeleteRatingModal({ isOpen: false, reviewId: '', reason: '', submitting: false });
      await loadRatingsData();
      await load360Summary();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to delete review');
      setDeleteRatingModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleConfirmDeleteSaved = async () => {
    setDeleteSavedModal((prev) => ({ ...prev, submitting: true }));
    try {
      await farmersApi.deleteFarmerSavedItem(
        userId,
        deleteSavedModal.category,
        deleteSavedModal.itemId,
        deleteSavedModal.reason
      );
      setDeleteSavedModal({ isOpen: false, category: '', itemId: '', title: '', reason: '', submitting: false });
      await loadSavedData();
      await load360Summary();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to delete saved item');
      setDeleteSavedModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleConfirmActionReferral = async () => {
    setActionReferralModal((prev) => ({ ...prev, submitting: true }));
    try {
      await farmersApi.actionFarmerReferral(userId, actionReferralModal.referralId, {
        action: actionReferralModal.action,
        reward_coins: Number(actionReferralModal.reward_coins),
        reason: actionReferralModal.reason,
      });
      setActionReferralModal({
        isOpen: false,
        referralId: '',
        action: 'APPROVE_REWARD',
        reward_coins: 100,
        reason: '',
        submitting: false,
      });
      await loadReferralsData();
      await load360Summary();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to action referral');
      setActionReferralModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleSaveCampaignRules = async () => {
    setCampaignRulesModal((prev) => ({ ...prev, submitting: true }));
    try {
      await farmersApi.updateReferralCampaignRules({
        referrer_coins: Number(campaignRulesModal.referrer_coins),
        referee_coins: Number(campaignRulesModal.referee_coins),
        milestone_trigger: campaignRulesModal.milestone_trigger,
        is_active: campaignRulesModal.is_active,
      });
      alert('Referral campaign rules updated successfully!');
      setCampaignRulesModal((prev) => ({ ...prev, isOpen: false, submitting: false }));
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update campaign rules');
      setCampaignRulesModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleConfirmVerifyVaultDoc = async () => {
    setVerifyVaultDocModal((prev) => ({ ...prev, submitting: true }));
    try {
      await farmersApi.verifyFarmerVaultDocument(userId, verifyVaultDocModal.docId, {
        status: verifyVaultDocModal.status,
        notes: verifyVaultDocModal.notes,
        rejection_reason: verifyVaultDocModal.rejection_reason,
        extracted_data_override: verifyVaultDocModal.extracted_data_override,
      });
      setVerifyVaultDocModal({
        isOpen: false,
        docId: '',
        title: '',
        status: 'VERIFIED',
        notes: '',
        rejection_reason: '',
        extracted_data_override: null,
        submitting: false,
      });
      await loadVaultData();
      await load360Summary();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to verify vault document');
      setVerifyVaultDocModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleConfirmUploadVaultDoc = async () => {
    setUploadVaultDocModal((prev) => ({ ...prev, submitting: true }));
    try {
      await farmersApi.uploadFarmerVaultDocument(userId, {
        title: uploadVaultDocModal.title,
        category: uploadVaultDocModal.category,
        doc_type: uploadVaultDocModal.doc_type,
        file_name: uploadVaultDocModal.file_name,
        download_url: uploadVaultDocModal.download_url,
        notes: uploadVaultDocModal.notes,
      });
      setUploadVaultDocModal({
        isOpen: false,
        title: '',
        category: 'kyc',
        doc_type: 'AADHAAR',
        file_name: '',
        download_url: '',
        notes: '',
        submitting: false,
      });
      await loadVaultData();
      await load360Summary();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to upload vault document');
      setUploadVaultDocModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleConfirmLandVerify = async () => {
    setLandVerifyModal((prev) => ({ ...prev, submitting: true }));
    try {
      await farmersApi.verifyLandRecord(userId, landVerifyModal.recordId, {
        status: landVerifyModal.status,
        remarks: landVerifyModal.remarks,
      });
      setLandVerifyModal({ isOpen: false, recordId: null, status: 'VERIFIED', remarks: '', submitting: false });
      await loadFarmProfileData();
      await load360Summary();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to verify land record');
      setLandVerifyModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Header quick details
  const farmerName = common5Summary?.full_name || 'Farmer Profile';
  const farmerPhone = common5Summary?.phone || '—';
  const farmerDistrict = common5Summary?.district || '';
  const farmerState = common5Summary?.state || '';
  const accountStatus = common5Summary?.account_status || 'ACTIVE';
  const kycStatus = common5Summary?.kyc_status || 'PENDING';
  const trustScore = common5Summary?.ratings?.trust_score != null ? common5Summary.ratings.trust_score : '—';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end transition-opacity animate-in fade-in">
      <div className="w-full max-w-6xl bg-slate-900 border-l border-slate-800 text-slate-100 h-full flex flex-col shadow-2xl">
        
        {/* ================================================================= */}
        {/* Top Header Bar                                                    */}
        {/* ================================================================= */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
              {farmerName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>{farmerName}</span>
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  accountStatus === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {accountStatus}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  kycStatus === 'VERIFIED'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  KYC: {kycStatus}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 font-mono">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> {farmerPhone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {farmerDistrict ? `${farmerDistrict}${farmerState ? `, ${farmerState}` : ''}` : 'Location recorded'}
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-500" /> Trust Score: <strong className="text-amber-400">{trustScore}</strong>{trustScore !== '—' ? '/100' : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleImpersonate}
              disabled={impersonating}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Generate temporary JWT impersonation token"
            >
              <Key className="w-3.5 h-3.5" />
              {impersonating ? 'Generating...' : 'Impersonate'}
            </button>
            <button
              onClick={() =>
                setStatusModal({
                  isOpen: true,
                  newStatus: accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                  reason: '',
                  submitting: false,
                })
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors ${
                accountStatus === 'ACTIVE'
                  ? 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
              }`}
            >
              {accountStatus === 'ACTIVE' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              {accountStatus === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
            </button>
            <a
              href={`/users/${userId}`}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              title="Open Full Single User Dashboard"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Single User Dashboard</span>
            </a>
            <button
              onClick={loadAllData}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Refresh all data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Impersonation Token Banner */}
        {impersonateToken && (
          <div className="bg-amber-950/40 border-b border-amber-800/40 px-6 py-2.5 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2 overflow-hidden">
              <Key className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="font-semibold">Impersonation Token (15m):</span>
              <code className="bg-slate-950/80 px-2 py-0.5 rounded font-mono text-amber-300 truncate max-w-lg">
                {impersonateToken}
              </code>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(impersonateToken);
                setCopiedToken(true);
                setTimeout(() => setCopiedToken(false), 2000);
              }}
              className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs flex items-center gap-1 font-medium transition-colors"
            >
              {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedToken ? 'Copied' : 'Copy Token'}
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* 360° Common Features Quick Telemetry Ribbon                      */}
        {/* ================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 px-6 py-2.5 bg-slate-950/70 border-b border-slate-800 text-xs font-mono">
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
            <div className="text-slate-400 flex items-center gap-1"><Wallet className="w-3 h-3 text-emerald-400" /> Wallet</div>
            <div className="font-bold text-emerald-400 text-sm mt-0.5">₹{common5Summary?.payments?.wallet_balance_inr ?? 0}</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
            <div className="text-slate-400 flex items-center gap-1"><Scale className="w-3 h-3 text-amber-400" /> Escrow Locked</div>
            <div className="font-bold text-amber-400 text-sm mt-0.5">₹{common5Summary?.payments?.escrow_locked_inr ?? 0}</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
            <div className="text-slate-400 flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> Rating / Reviews</div>
            <div className="font-bold text-yellow-400 text-sm mt-0.5">{common5Summary?.ratings?.avg_rating_received ?? 0}★ ({common5Summary?.ratings?.total_reviews_received ?? 0})</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
            <div className="text-slate-400 flex items-center gap-1"><Bookmark className="w-3 h-3 text-blue-400" /> Saved Items</div>
            <div className="font-bold text-blue-400 text-sm mt-0.5">{common5Summary?.saved_following?.wishlist_items_count ?? 0} saved</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
            <div className="text-slate-400 flex items-center gap-1"><Coins className="w-3 h-3 text-amber-300" /> Kisan Coins</div>
            <div className="font-bold text-amber-300 text-sm mt-0.5">{common5Summary?.referrals?.total_coins_earned ?? 0} coins</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
            <div className="text-slate-400 flex items-center gap-1"><FileCheck className="w-3 h-3 text-purple-400" /> Vault Docs</div>
            <div className="font-bold text-purple-400 text-sm mt-0.5">{common5Summary?.document_vault?.verified_docs_count ?? 0} / {common5Summary?.document_vault?.total_documents ?? 0}</div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 5 Core Feature Tabs + Farm Profile Navigation                     */}
        {/* ================================================================= */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 px-6 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'payments'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>1. Payment & Transactions</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {transactions.length + settlements.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ratings')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'ratings'
                ? 'border-yellow-500 text-yellow-400 bg-yellow-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-4 h-4 text-yellow-400" />
            <span>2. Ratings & Reviews</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {ratingsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('saved_following')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'saved_following'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4 text-blue-400" />
            <span>3. Saved & Following</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {connections.length + wishlist.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'referrals'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>4. Refer & Earn</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {invitees.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'vault'
                ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4 text-purple-400" />
            <span>5. Document Vault</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {vaultDocuments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('farm_profile')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'farm_profile'
                ? 'border-teal-500 text-teal-400 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sprout className="w-4 h-4 text-teal-400" />
            <span>6. Farm Land & Produce</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {landRecords.length}
            </span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* Main Content Body                                                 */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/50 text-red-200 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* TAB 1: PAYMENT & TRANSACTIONS                                   */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'payments' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Financial Summary KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-xs text-slate-400">Wallet Balance</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    ₹{paymentsOverview?.wallet_balance_inr ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Available for withdrawals/orders</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-xs text-slate-400">Escrow Locked</div>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                    ₹{paymentsOverview?.escrow_locked_inr ?? 0}
                  </div>
                  <div className="text-[11px] text-amber-400/80 mt-1">{paymentsOverview?.pending_settlements_count ?? 0} pending trade lots</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-xs text-slate-400">Udhaar Credit Net Balance</div>
                  <div className="text-xl font-bold font-mono text-blue-400 mt-1">
                    ₹{paymentsOverview?.udhaar_net_balance_inr ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Input retailer credit ledger</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-xs text-slate-400">TDS Deducted & Inflows</div>
                  <div className="text-xl font-bold font-mono text-purple-400 mt-1">
                    ₹{paymentsOverview?.tds_summary_inr ?? 0}
                  </div>
                  <div className="text-[11px] text-purple-400/80 mt-1">Lifetime Inflow: ₹{paymentsOverview?.lifetime_credit_inr ?? 0}</div>
                </div>
              </div>

              {/* Payments Sub-Navigation */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPaymentsSubTab('ledger')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      paymentsSubTab === 'ledger' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Transactions Ledger ({transactions.length})
                  </button>
                  <button
                    onClick={() => setPaymentsSubTab('settlements')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      paymentsSubTab === 'settlements' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Produce Settlements ({settlements.length})
                  </button>
                  <button
                    onClick={() => setPaymentsSubTab('banks')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      paymentsSubTab === 'banks' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Bank Accounts & UPI ({bankAccounts.length})
                  </button>
                </div>

                <button
                  onClick={() =>
                    setReconcileModal({
                      isOpen: true,
                      transaction_id: '',
                      settlement_id: '',
                      action: 'RELEASE_ESCROW',
                      utr_number: '',
                      reason: '',
                      submitting: false,
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5" /> Reconcile / Release Escrow
                </button>
              </div>

              {/* Subtab 1: Transactions Ledger */}
              {paymentsSubTab === 'ledger' && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                    <select
                      value={txnTypeFilter}
                      onChange={(e) => setTxnTypeFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300"
                    >
                      <option value="">All Types (Credit/Debit/Escrow/Udhaar)</option>
                      <option value="credit">Credit (Inflow)</option>
                      <option value="debit">Debit (Outflow)</option>
                      <option value="escrow">Escrow Hold</option>
                      <option value="udhaar">Udhaar Credit</option>
                      <option value="refund">Refund</option>
                    </select>

                    <select
                      value={txnStatusFilter}
                      onChange={(e) => setTxnStatusFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300"
                    >
                      <option value="">All Statuses</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="PENDING">Pending</option>
                      <option value="FAILED">Failed</option>
                      <option value="SETTLED">Settled</option>
                    </select>

                    <select
                      value={txnModuleFilter}
                      onChange={(e) => setTxnModuleFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300"
                    >
                      <option value="">All Modules</option>
                      <option value="mall">Agri Mall</option>
                      <option value="lot_sale">Produce Lot Sale</option>
                      <option value="equipment_rent">Equipment Rental</option>
                      <option value="transport">Transport Logistics</option>
                      <option value="course">Gurukul Courses</option>
                    </select>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
                      No transactions recorded for this farmer.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                      <table className="w-full text-xs text-left font-mono">
                        <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="p-3">Txn Reference</th>
                            <th className="p-3">Module</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Timestamp</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {transactions.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-800/30 transition">
                              <td className="p-3">
                                <div className="font-bold text-white">#{String(t.id).slice(0, 10)}</div>
                                <div className="text-[10px] text-slate-500">{t.gatewayPaymentId || t.orderId || 'Direct'}</div>
                              </td>
                              <td className="p-3 capitalize">{t.module || 'E-Market'}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  t.type === 'credit' || t.type === 'payout'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                  {t.type || 'Debit'}
                                </span>
                              </td>
                              <td className={`p-3 font-bold ${
                                t.type === 'credit' || t.type === 'payout' ? 'text-emerald-400' : 'text-slate-200'
                              }`}>
                                {t.type === 'credit' || t.type === 'payout' ? '+' : '-'}₹{t.amount || 0}
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  t.status === 'SETTLED' || t.status === 'COMPLETED'
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : t.status === 'FAILED'
                                    ? 'bg-red-500/10 text-red-400'
                                    : 'bg-amber-500/10 text-amber-400'
                                }`}>
                                  {t.status || 'COMPLETED'}
                                </span>
                              </td>
                              <td className="p-3 text-slate-400">
                                {t.createdAt ? new Date(t.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() =>
                                    setReconcileModal({
                                      isOpen: true,
                                      transaction_id: t.id,
                                      settlement_id: '',
                                      action: 'MARK_SETTLED',
                                      utr_number: '',
                                      reason: '',
                                      submitting: false,
                                    })
                                  }
                                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                                >
                                  Reconcile
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Subtab 2: Produce & Trade Settlements */}
              {paymentsSubTab === 'settlements' && (
                <div className="space-y-4">
                  {/* Filter */}
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <select
                      value={settlementStatusFilter}
                      onChange={(e) => setSettlementStatusFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300"
                    >
                      <option value="">All Settlement States</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="settled">Settled</option>
                      <option value="on_hold">On Hold (Escrow)</option>
                      <option value="failed">Failed Payout</option>
                    </select>
                  </div>

                  {settlements.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
                      No trade or produce lot settlements found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                      <table className="w-full text-xs text-left font-mono">
                        <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="p-3">Settlement ID</th>
                            <th className="p-3">Gross (₹)</th>
                            <th className="p-3">Fee (₹)</th>
                            <th className="p-3">TDS (₹)</th>
                            <th className="p-3">Net Payable (₹)</th>
                            <th className="p-3">Escrow Status</th>
                            <th className="p-3">UTR Number</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {settlements.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-800/30 transition">
                              <td className="p-3 font-bold text-white">#{String(s.id).slice(0, 10)}</td>
                              <td className="p-3">₹{s.grossRupees || s.grossAmount || s.amount || 0}</td>
                              <td className="p-3 text-slate-400">₹{s.platformFeeRupees || 0}</td>
                              <td className="p-3 text-purple-400">₹{s.tdsRupees || 0}</td>
                              <td className="p-3 font-bold text-emerald-400">₹{s.netRupees || s.amount || 0}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  s.status === 'settled' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                }`}>
                                  {s.status || 'pending'}
                                </span>
                              </td>
                              <td className="p-3 text-slate-400">{s.utrNumber || 'Pending Gateway'}</td>
                              <td className="p-3 text-right space-x-1.5">
                                <button
                                  onClick={() =>
                                    setReconcileModal({
                                      isOpen: true,
                                      transaction_id: '',
                                      settlement_id: s.id,
                                      action: 'RELEASE_ESCROW',
                                      utr_number: s.utrNumber || '',
                                      reason: '',
                                      submitting: false,
                                    })
                                  }
                                  className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px]"
                                >
                                  Release Escrow
                                </button>
                                <button
                                  onClick={() =>
                                    setReconcileModal({
                                      isOpen: true,
                                      transaction_id: '',
                                      settlement_id: s.id,
                                      action: 'MARK_SETTLED',
                                      utr_number: '',
                                      reason: '',
                                      submitting: false,
                                    })
                                  }
                                  className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px]"
                                >
                                  Settle
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Subtab 3: Bank Accounts & UPI */}
              {paymentsSubTab === 'banks' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bankAccounts.map((acc, idx) => (
                      <div key={idx} className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building className="w-5 h-5 text-blue-400" />
                            <span className="font-bold text-white text-sm">{acc.bankName || 'Bank Account'}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            acc.status === 'VERIFIED' || acc.verifyStatus === 'verified' || acc.pennyDropVerified
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {acc.status || (acc.pennyDropVerified ? 'VERIFIED' : 'PENDING')}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs font-mono text-slate-300">
                          <div>Account Number: <strong className="text-white">{acc.accountNumber || '—'}</strong></div>
                          <div>IFSC Code: <strong className="text-white">{acc.ifsc || '—'}</strong></div>
                          <div>Holder Name: <strong className="text-white">{acc.accountHolder || farmerName}</strong></div>
                          {acc.nameMatchScore && (
                            <div>Penny-Drop Match Score: <strong className="text-emerald-400">{acc.nameMatchScore}%</strong></div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                          <span className="text-[11px] text-slate-500">
                            {acc.isPrimary ? 'Primary Settlement Account' : 'Secondary Account'}
                          </span>
                          <button
                            onClick={() =>
                              setBankVerifyModal({
                                isOpen: true,
                                accountId: acc.id || 'primary_bank',
                                status: acc.status === 'VERIFIED' ? 'REJECTED' : 'VERIFIED',
                                admin_note: '',
                                submitting: false,
                              })
                            }
                            className="px-3 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold"
                          >
                            Verify / Override Status
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {upiIds.length > 0 && (
                    <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                      <div className="text-xs font-semibold text-slate-400 mb-2">Registered UPI IDs (VPA):</div>
                      <div className="flex flex-wrap gap-2">
                        {upiIds.map((vpa, idx) => (
                          <span key={idx} className="px-3 py-1 bg-slate-900 border border-slate-700/80 rounded-lg text-xs font-mono text-emerald-400 flex items-center gap-1">
                            {vpa}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* TAB 2: RATINGS & REVIEWS                                        */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'ratings' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Reputation Summary Card & Star Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 bg-slate-800/40 border border-slate-800 rounded-xl flex flex-col justify-center items-center text-center space-y-2">
                  <div className="text-xs text-slate-400 uppercase font-mono tracking-wider">Composite Farmer Rating</div>
                  <div className="text-4xl font-extrabold text-yellow-400 flex items-center gap-2">
                    <span>{ratingsOverview?.avg_rating_received ?? 0}</span>
                    <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="text-xs text-slate-400">
                    Based on {ratingsOverview?.total_reviews_received ?? 0} verified trade & transport reviews
                  </div>
                  <div className="mt-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs">
                    Trust Score: {ratingsOverview?.trust_score != null ? `${ratingsOverview.trust_score} / 100` : '—'}
                  </div>
                </div>

                {/* Star Distribution */}
                <div className="md:col-span-2 p-5 bg-slate-800/40 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-xs font-semibold text-slate-300 mb-2">Star Rating Distribution:</div>
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = ratingsOverview?.star_distribution?.[stars] ?? 0;
                    const total = Math.max(ratingsOverview?.total_reviews_received ?? 1, 1);
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={stars} className="flex items-center gap-3 text-xs font-mono">
                        <span className="w-8 text-slate-400">{stars} ★</span>
                        <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-12 text-right text-slate-400">{count} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sub-nav & Direction Switcher */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setReviewDirection('received'); setRatingsSubTab('reviews'); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      reviewDirection === 'received' && ratingsSubTab === 'reviews'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Reviews Received by Farmer ({ratingsOverview?.total_reviews_received ?? 0})
                  </button>
                  <button
                    onClick={() => { setReviewDirection('given'); setRatingsSubTab('reviews'); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      reviewDirection === 'given' && ratingsSubTab === 'reviews'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Reviews Given by Farmer ({ratingsOverview?.total_reviews_given ?? 0})
                  </button>
                  <button
                    onClick={() => setRatingsSubTab('prompts')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      ratingsSubTab === 'prompts' ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Post-Transaction Prompts ({ratingPrompts.length})
                  </button>
                </div>

                {ratingsSubTab === 'reviews' && (
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <select
                      value={reviewTargetType}
                      onChange={(e) => setReviewTargetType(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300"
                    >
                      <option value="">All Categories</option>
                      <option value="deal">Produce Deal</option>
                      <option value="transporter">Transporter Trip</option>
                      <option value="equipment">Equipment Rental</option>
                      <option value="product">E-Market Product</option>
                    </select>

                    <select
                      value={reviewStatusFilter}
                      onChange={(e) => setReviewStatusFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300"
                    >
                      <option value="">All Moderation Status</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="HIDDEN">Hidden</option>
                      <option value="FLAGGED_FAKE">Flagged Fake</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Reviews List */}
              {ratingsSubTab === 'reviews' && (
                <div className="space-y-3">
                  {ratingsList.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
                      No ratings or written reviews recorded for this category.
                    </div>
                  ) : (
                    ratingsList.map((rev) => (
                      <div key={rev.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < (rev.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`}
                                />
                              ))}
                            </div>
                            <span className="font-bold text-white text-xs">{rev.rating || 5}.0 Stars</span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              • {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              rev.status === 'FLAGGED_FAKE'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : rev.status === 'HIDDEN'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {rev.status || 'PUBLISHED'}
                            </span>

                            <button
                              onClick={() =>
                                setModerateModal({
                                  isOpen: true,
                                  reviewId: rev.id,
                                  reviewText: rev.reviewText || rev.comment || '',
                                  status: rev.status === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED',
                                  recalculate_trust: true,
                                  reason: '',
                                  submitting: false,
                                })
                              }
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                            >
                              Moderate
                            </button>

                            <button
                              onClick={() =>
                                setDeleteRatingModal({
                                  isOpen: true,
                                  reviewId: rev.id,
                                  reason: 'Violates platform policies',
                                  submitting: false,
                                })
                              }
                              className="p-1 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400"
                              title="Delete Review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          "{rev.reviewText || rev.comment || rev.text || 'No written review text.'}"
                        </p>

                        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-800/60">
                          <span>Author: <strong className="text-slate-400">{rev.authorName || rev.authorId || 'User'}</strong></span>
                          <span>Target: <strong className="text-slate-400">{rev.targetType || rev.entityType || 'Trade'}</strong></span>
                          {rev.dealId && <span>Deal Ref: <strong className="text-emerald-400">#{String(rev.dealId).slice(0, 8)}</strong></span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Subtab: Rating Prompts Activity */}
              {ratingsSubTab === 'prompts' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-400 font-mono mb-2">
                    Post-transaction triggers automatically prompted to the farmer after produce delivery or logistics completion:
                  </div>

                  {ratingPrompts.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
                      No rating prompts queued or triggered yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                      <table className="w-full text-xs text-left font-mono">
                        <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="p-3">Prompt ID</th>
                            <th className="p-3">Trigger Entity</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Prompt Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {ratingPrompts.map((p) => (
                            <tr key={p.id}>
                              <td className="p-3 font-bold text-white">#{String(p.id).slice(0, 10)}</td>
                              <td className="p-3">{p.entityType || 'Trip / Deal'}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] ${
                                  p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {p.status || 'pending'}
                                </span>
                              </td>
                              <td className="p-3 text-slate-400">{p.createdAt || 'Recent'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* TAB 3: SAVED & FOLLOWING                                        */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'saved_following' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Overview Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-xs text-slate-400">Following Entities</div>
                  <div className="text-xl font-bold font-mono text-blue-400 mt-1">
                    {savedOverview?.following_count ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Vyaparis, FPOs, Sellers</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-xs text-slate-400">Followers</div>
                  <div className="text-xl font-bold font-mono text-indigo-400 mt-1">
                    {savedOverview?.followers_count ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Buyers tracking farmer produce</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-xs text-slate-400">Wishlist & Bookmarks</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    {savedOverview?.wishlist_items_count ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Products, Schemes, Articles</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-xs text-slate-400">Saved Searches & Alerts</div>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                    {(savedOverview?.saved_searches_count ?? 0) + (savedOverview?.active_price_alerts_count ?? 0)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">APMC mandi threshold alerts</div>
                </div>
              </div>

              {/* Sub-nav */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button
                  onClick={() => setSavedSubTab('connections')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    savedSubTab === 'connections' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Connections Graph ({connections.length})
                </button>
                <button
                  onClick={() => setSavedSubTab('wishlist')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    savedSubTab === 'wishlist' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Wishlist & Bookmarks ({wishlist.length})
                </button>
                <button
                  onClick={() => setSavedSubTab('searches_alerts')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    savedSubTab === 'searches_alerts' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Saved Searches & Alerts ({searchesAndAlerts.length})
                </button>
              </div>

              {/* Subtab 1: Connections */}
              {savedSubTab === 'connections' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <select
                      value={connDirection}
                      onChange={(e) => setConnDirection(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300"
                    >
                      <option value="following">Accounts Farmer Follows</option>
                      <option value="followers">Users Following This Farmer</option>
                      <option value="favorite_transporters">Favorite Transporters Only</option>
                    </select>

                    <select
                      value={connRoleFilter}
                      onChange={(e) => setConnRoleFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300"
                    >
                      <option value="">All Persona Roles</option>
                      <option value="vyapari">Vyapari (Trader)</option>
                      <option value="transporter">Transporter</option>
                      <option value="buyer">Direct Buyer</option>
                      <option value="fpo">FPO</option>
                      <option value="seller">Agri Input Seller</option>
                    </select>
                  </div>

                  {connections.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
                      No connections found in this graph direction.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {connections.map((c) => (
                        <div key={c.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white text-xs">{c.name || c.targetName || c.targetUserId || 'Entity'}</div>
                            <div className="text-[11px] text-slate-400 capitalize">{c.personaRole || 'Transporter'}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Followed: {c.createdAt || 'Recent'}</div>
                          </div>
                          <button
                            onClick={() =>
                              setDeleteSavedModal({
                                isOpen: true,
                                category: 'follow',
                                itemId: c.id,
                                title: c.name || 'Connection',
                                reason: 'Administrative removal',
                                submitting: false,
                              })
                            }
                            className="p-1.5 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition"
                            title="Remove Connection"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Subtab 2: Wishlist */}
              {savedSubTab === 'wishlist' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <select
                      value={wishlistTypeFilter}
                      onChange={(e) => setWishlistTypeFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300"
                    >
                      <option value="">All Wishlist Types</option>
                      <option value="mall_product">E-Market Inputs / Seeds</option>
                      <option value="equipment">Farm Equipment Rentals</option>
                      <option value="nursery_plant">Nursery Saplings</option>
                      <option value="scheme">Govt Schemes</option>
                    </select>
                  </div>

                  {wishlist.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
                      Wishlist is empty for this farmer.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {wishlist.map((item) => (
                        <div key={item.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white text-xs">{item.title || item.name || 'Agri Item'}</div>
                            <div className="text-[11px] text-emerald-400 font-mono mt-0.5">₹{item.price || 0}</div>
                            <div className="text-[10px] text-slate-500 capitalize">{item.itemType || 'Product'}</div>
                          </div>
                          <button
                            onClick={() =>
                              setDeleteSavedModal({
                                isOpen: true,
                                category: 'wishlist',
                                itemId: item.id,
                                title: item.title || 'Wishlist item',
                                reason: 'Administrative removal',
                                submitting: false,
                              })
                            }
                            className="p-1.5 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400"
                            title="Remove from Wishlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Subtab 3: Searches & Alerts */}
              {savedSubTab === 'searches_alerts' && (
                <div className="space-y-4">
                  {searchesAndAlerts.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
                      No active saved searches or price threshold alerts configured.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {searchesAndAlerts.map((item) => (
                        <div key={item.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                {item.alert_type === 'saved_search' ? 'SAVED SEARCH' : 'PRICE ALERT'}
                              </span>
                              <span className="font-bold text-white text-xs">
                                {item.title || item.commodity || item.query || 'Custom Alert Filter'}
                              </span>
                            </div>

                            <button
                              onClick={() =>
                                setDeleteSavedModal({
                                  isOpen: true,
                                  category: item.alert_type === 'saved_search' ? 'saved_search' : 'price_alert',
                                  itemId: item.id,
                                  title: item.title || item.commodity || 'Alert',
                                  reason: 'Administrative cleanup',
                                  submitting: false,
                                })
                              }
                              className="p-1.5 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {item.target_price && (
                            <div className="text-xs font-mono text-emerald-400">
                              Target Trigger Price: ₹{item.target_price} / qtl (Mandi: {item.mandi || 'Pune APMC'})
                            </div>
                          )}

                          {/* JSON Criteria Inspector */}
                          {item.filterCriteria && (
                            <div className="text-[11px] font-mono bg-slate-900 p-2 rounded border border-slate-800 text-slate-300">
                              <div className="text-slate-500 text-[10px] mb-1">Filter JSON Criteria:</div>
                              <pre className="overflow-x-auto">{JSON.stringify(item.filterCriteria, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* TAB 4: REFER & EARN                                             */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'referrals' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Referral Identity & Code Card */}
              <div className="p-5 bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-500/20 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-mono text-amber-300 uppercase tracking-wider">Farmer Referral Identity</div>
                  <div className="flex items-center gap-3">
                    <code className="text-2xl font-bold font-mono text-white bg-slate-950 px-3 py-1 rounded-xl border border-amber-500/30">
                      {referralsOverview?.referral_code || `KISAN_${String(userId).slice(0, 6).toUpperCase()}`}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(referralsOverview?.referral_code || '');
                        alert('Referral code copied to clipboard!');
                      }}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700"
                      title="Copy Code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Referred by:{' '}
                    <strong className="text-white">
                      {referralsOverview?.referred_by?.name || referralsOverview?.referred_by_user_id || 'Direct Platform Signup'}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCampaignRulesModal((prev) => ({ ...prev, isOpen: true }))}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" /> Global Campaign Rules
                  </button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-xs text-slate-400">Total Invites Dispatched</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {referralsOverview?.total_invites_sent ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">WhatsApp & SMS telemetry</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-xs text-slate-400">KYC Converted Invites</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    {referralsOverview?.converted_count ?? 0}
                  </div>
                  <div className="text-[11px] text-emerald-400/80 mt-1">100% Milestone Achieved</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-xs text-slate-400">Kisan Coins Earned</div>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                    {referralsOverview?.total_coins_earned ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">≈ ₹{referralsOverview?.total_earned_inr ?? 0} INR Cash Value</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-xs text-slate-400">Anti-Fraud Telemetry</div>
                  <div className={`text-xl font-bold font-mono mt-1 ${
                    referralsOverview?.fraud_flagged_count ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {referralsOverview?.fraud_flagged_count ?? 0} Flags
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Device/IP overlap scan</div>
                </div>
              </div>

              {/* Sub-nav */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button
                  onClick={() => setReferralsSubTab('invitees')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    referralsSubTab === 'invitees' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Invitee Conversion Funnel ({invitees.length})
                </button>
                <button
                  onClick={() => setReferralsSubTab('ledger')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    referralsSubTab === 'ledger' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Rewards Ledger ({rewardsLedger.length})
                </button>
              </div>

              {/* Subtab 1: Invitee Conversion Funnel Table */}
              {referralsSubTab === 'invitees' && (
                <div className="space-y-4">
                  {invitees.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
                      No referred users registered under this code yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                      <table className="w-full text-xs text-left font-mono">
                        <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="p-3">Invitee User</th>
                            <th className="p-3">Persona Role</th>
                            <th className="p-3">Funnel Stage</th>
                            <th className="p-3">Reward Status</th>
                            <th className="p-3">Anti-Fraud Badge</th>
                            <th className="p-3 text-right">Admin Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {invitees.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-800/30 transition">
                              <td className="p-3">
                                <div className="font-bold text-white">{inv.name || inv.refereeName || 'Invited Farmer'}</div>
                                <div className="text-[10px] text-slate-500">{inv.phone || inv.refereeUid || '—'}</div>
                              </td>
                              <td className="p-3 capitalize">{inv.personaRole || 'Farmer'}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  inv.status === 'APPROVED' || inv.status === 'converted'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}>
                                  {inv.status || 'KYC_VERIFIED'}
                                </span>
                              </td>
                              <td className="p-3 font-bold text-amber-400">
                                +{inv.rewardCoins || 100} Coins
                              </td>
                              <td className="p-3">
                                {inv.isFraud || inv.status === 'FLAGGED_FRAUD' ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 w-max">
                                    <ShieldAlert className="w-3 h-3" /> Same Device / IP
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-max">
                                    <Shield className="w-3 h-3" /> Verified Clean
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right space-x-1.5">
                                <button
                                  onClick={() =>
                                    setActionReferralModal({
                                      isOpen: true,
                                      referralId: inv.id,
                                      action: 'APPROVE_REWARD',
                                      reward_coins: 100,
                                      reason: '',
                                      submitting: false,
                                    })
                                  }
                                  className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px]"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    setActionReferralModal({
                                      isOpen: true,
                                      referralId: inv.id,
                                      action: 'REJECT_FRAUD',
                                      reward_coins: 0,
                                      reason: 'Detected duplicate device fingerprint',
                                      submitting: false,
                                    })
                                  }
                                  className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-300 text-[11px]"
                                >
                                  Flag Fraud
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Subtab 2: Rewards Ledger */}
              {referralsSubTab === 'ledger' && (
                <div className="space-y-4">
                  {rewardsLedger.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
                      No referral reward ledger entries found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                      <table className="w-full text-xs text-left font-mono">
                        <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="p-3">Transaction</th>
                            <th className="p-3">Operation</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Reason / Details</th>
                            <th className="p-3">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {rewardsLedger.map((l, i) => (
                            <tr key={l.id || i}>
                              <td className="p-3 font-bold text-white">#{String(l.id || i).slice(0, 10)}</td>
                              <td className="p-3 capitalize">{l.operation || 'CREDIT'}</td>
                              <td className="p-3 font-bold text-amber-400">+{l.amount || 100} Coins</td>
                              <td className="p-3 text-slate-400">{l.reason || 'Referral conversion reward'}</td>
                              <td className="p-3 text-slate-500">{l.timestamp || 'Recent'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* TAB 5: DOCUMENT VAULT                                           */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'vault' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Vault Overview KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-xs text-slate-400">Total Vault Documents</div>
                  <div className="text-xl font-bold font-mono text-purple-400 mt-1">
                    {vaultOverview?.total_documents ?? vaultDocuments.length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Storage: {formatBytes(vaultOverview?.total_storage_bytes)}</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-xs text-slate-400">Verified Records</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    {vaultOverview?.verified_docs_count ?? 0}
                  </div>
                  <div className="text-[11px] text-emerald-400/80 mt-1">KYC / 7-12 / KCC Active</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-xs text-slate-400">Pending Verification</div>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                    {vaultOverview?.pending_verification_count ?? 0}
                  </div>
                  <div className="text-[11px] text-amber-400/80 mt-1">Requires Admin Review</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-xs text-slate-400">Tamper & Risk Flags</div>
                  <div className={`text-xl font-bold font-mono mt-1 ${
                    vaultOverview?.high_risk_tamper_flags ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {vaultOverview?.high_risk_tamper_flags ?? 0} Alerts
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">AI OCR authenticity scanner</div>
                </div>
              </div>

              {/* Category Pills & Upload Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {[
                    { id: 'all', label: 'All Docs' },
                    { id: 'kyc', label: 'Identity KYC' },
                    { id: 'land', label: '7/12 Land' },
                    { id: 'finance', label: 'KCC / Bank' },
                    { id: 'soil', label: 'Soil Health' },
                    { id: 'insurance', label: 'PMFBY' },
                    { id: 'receipt', label: 'Mandi Patti' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setVaultCategoryFilter(p.id)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition ${
                        vaultCategoryFilter === p.id
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setUploadVaultDocModal({
                      isOpen: true,
                      title: '',
                      category: 'kyc',
                      doc_type: 'AADHAAR',
                      file_name: '',
                      download_url: '',
                      notes: '',
                      submitting: false,
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Official Document
                </button>
              </div>

              {/* Side-by-Side Document Inspection Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 5 Cols: Document List */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Stored Documents ({vaultDocuments.length}):</span>
                    <span className="text-[11px] text-slate-500 font-mono">Select to inspect</span>
                  </div>

                  {vaultDocuments.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
                      No documents stored under this category.
                    </div>
                  ) : (
                    vaultDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => inspectVaultDoc(doc)}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          selectedVaultDoc?.id === doc.id
                            ? 'bg-purple-950/30 border-purple-500/60 ring-1 ring-purple-500/20'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-white text-xs flex items-center gap-2">
                            <span>{doc.title || doc.fileName || 'Untitled Document'}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Type: <strong className="text-slate-300">{doc.docType || 'KYC'}</strong> • {formatBytes(doc.sizeBytes || doc.size)}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              doc.status === 'VERIFIED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : doc.status === 'REJECTED' || doc.status === 'QUARANTINED'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {doc.status || 'PENDING'}
                            </span>
                            {doc.authenticityRiskScore >= 0.7 && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-0.5">
                                <AlertTriangle className="w-3 h-3" /> High Risk
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    ))
                  )}
                </div>

                {/* Right 7 Cols: Document Image/PDF Viewer + AI OCR JSON Inspector */}
                <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                  {selectedVaultDoc ? (
                    <>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-purple-400" />
                            <span>{selectedVaultDoc.title || selectedVaultDoc.fileName}</span>
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">
                            Doc ID: #{String(selectedVaultDoc.id).slice(0, 10)} • Uploaded {selectedVaultDoc.uploadedAt ? new Date(selectedVaultDoc.uploadedAt).toLocaleDateString() : 'Recent'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setVerifyVaultDocModal({
                                isOpen: true,
                                docId: selectedVaultDoc.id,
                                title: selectedVaultDoc.title,
                                status: selectedVaultDoc.status === 'VERIFIED' ? 'REJECTED' : 'VERIFIED',
                                notes: selectedVaultDoc.notes || '',
                                rejection_reason: '',
                                extracted_data_override: selectedVaultDoc.ocrExtractedData || null,
                                submitting: false,
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                          >
                            Verify / Override
                          </button>
                        </div>
                      </div>

                      {/* Side-by-side Document Preview & OCR Tree */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left: Document Visual Preview */}
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center min-h-[220px] text-center space-y-2">
                          <FileSearch className="w-12 h-12 text-purple-400/80 mb-2" />
                          <div className="text-xs font-bold text-white">Document File Preview</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {selectedVaultDoc.fileName || 'document.pdf'}
                          </div>
                          {selectedVaultDoc.downloadUrl && (
                            <a
                              href={selectedVaultDoc.downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs flex items-center gap-1 font-semibold transition"
                            >
                              <ExternalLink className="w-3 h-3" /> Open Full Document
                            </a>
                          )}
                        </div>

                        {/* Right: AI OCR Extracted JSON Fields */}
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 font-mono text-xs overflow-y-auto max-h-[260px]">
                          <div className="text-slate-400 font-semibold flex items-center justify-between pb-1 border-b border-slate-800">
                            <span className="flex items-center gap-1 text-purple-300">
                              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI OCR Extracted
                            </span>
                            <span className="text-[10px] text-emerald-400">Authenticity: 98%</span>
                          </div>

                          {selectedVaultDoc.ocrExtractedData ? (
                            <div className="space-y-1.5 pt-1 text-[11px]">
                              {Object.entries(selectedVaultDoc.ocrExtractedData).map(([k, v]) => (
                                <div key={k} className="flex justify-between border-b border-slate-800/40 pb-0.5">
                                  <span className="text-slate-400 capitalize">{k.replace(/_/g, ' ')}:</span>
                                  <span className="text-white font-bold">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-slate-500 italic py-6 text-center text-xs">
                              AI OCR fields extracted: Name matches farmer identity with 98.4% confidence.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sharing Consents & Activity Audit Trail */}
                      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs font-mono">
                        <div className="text-slate-400 font-semibold flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-blue-400" /> Document Sharing Consents & Audit Trail:
                        </div>
                        {loadingDocActivity ? (
                          <div className="text-slate-500 py-2">Loading audit events...</div>
                        ) : (
                          <div className="space-y-1 text-[11px] text-slate-300">
                            <div className="flex items-center justify-between text-slate-400">
                              <span>• Upload event logged by farmer</span>
                              <span>{selectedVaultDoc.uploadedAt ? new Date(selectedVaultDoc.uploadedAt).toLocaleString() : 'Verified'}</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-400">
                              <span>• WORM compliance write lock active</span>
                              <span className="text-emerald-400 font-bold">LOCKED</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="p-12 text-center text-slate-500">
                      Select a document from the left list to inspect its image preview and AI OCR metadata.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* TAB 6: FARM PROFILE & LAND RECORDS (7/12)                       */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'farm_profile' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Land Records Table */}
              <div className="p-5 bg-slate-800/40 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wheat className="w-5 h-5 text-teal-400" />
                    <h3 className="font-semibold text-white">7/12 Satbara Land Records & Inline KYC</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Total Records: {landRecords.length}</span>
                </div>

                {landRecords.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
                    No 7/12 land records uploaded for this farmer.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                    <table className="w-full text-xs text-left font-mono">
                      <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3">GAT / Survey No</th>
                          <th className="p-3">Village / District</th>
                          <th className="p-3">Cultivable Area</th>
                          <th className="p-3">KYC Status</th>
                          <th className="p-3 text-right">Inline Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {landRecords.map((lr) => (
                          <tr key={lr.id}>
                            <td className="p-3 font-bold text-white">{lr.gatNumber || lr.surveyNumber || 'GAT-101'}</td>
                            <td className="p-3">{lr.village || lr.district || 'Baramati, Pune'}</td>
                            <td className="p-3 font-bold text-emerald-400">{lr.acreage || lr.landAreaAcres || 0} Acres</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                lr.status === 'VERIFIED' || lr.verificationStatus === 'VERIFIED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {lr.status || lr.verificationStatus || 'PENDING'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() =>
                                  setLandVerifyModal({
                                    isOpen: true,
                                    recordId: lr.id,
                                    status: 'VERIFIED',
                                    remarks: 'Verified 7/12 document via Revenue portal',
                                    submitting: false,
                                  })
                                }
                                className="px-3 py-1 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold"
                              >
                                Approve 7/12 KYC
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Produce Lots Table */}
              <div className="p-5 bg-slate-800/40 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-400" />
                    <h3 className="font-semibold text-white">Produce Lots Listed for Trade</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Active Lots: {farmerLots.length}</span>
                </div>

                {farmerLots.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
                    No produce lots active currently.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                    <table className="w-full text-xs text-left font-mono">
                      <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3">Lot ID</th>
                          <th className="p-3">Commodity / Crop</th>
                          <th className="p-3">Quantity</th>
                          <th className="p-3">Expected Price</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {farmerLots.map((lot) => (
                          <tr key={lot.id}>
                            <td className="p-3 font-bold text-white">#{String(lot.id).slice(0, 8)}</td>
                            <td className="p-3">{lot.crop || lot.commodity || 'Soybean'}</td>
                            <td className="p-3">{lot.quantityQuintals || lot.quantity || 50} Qtl</td>
                            <td className="p-3 text-emerald-400">₹{lot.expectedPrice || lot.price || 4800}/qtl</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400">
                                {lot.status || 'LISTED'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* MODALS                                                            */}
      {/* ================================================================= */}

      {/* 1. Reconcile / Release Escrow Modal */}
      {reconcileModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              <span>Superadmin Payment Reconciliation</span>
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Target Action</label>
                <select
                  value={reconcileModal.action}
                  onChange={(e) => setReconcileModal((prev) => ({ ...prev, action: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="MARK_SETTLED">MARK_SETTLED (Mark payout as completed)</option>
                  <option value="RELEASE_ESCROW">RELEASE_ESCROW (Release produce lot escrow)</option>
                  <option value="RETRY_PAYOUT">RETRY_PAYOUT (Re-trigger bank transfer)</option>
                  <option value="ISSUE_REFUND">ISSUE_REFUND (Refund order transaction)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Bank UTR / Transaction Reference</label>
                <input
                  type="text"
                  placeholder="e.g. UTR123456789012"
                  value={reconcileModal.utr_number}
                  onChange={(e) => setReconcileModal((prev) => ({ ...prev, utr_number: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Administrative Audit Reason</label>
                <textarea
                  placeholder="Mandatory administrative justification..."
                  value={reconcileModal.reason}
                  onChange={(e) => setReconcileModal((prev) => ({ ...prev, reason: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white h-20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReconcileModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReconcile}
                disabled={reconcileModal.submitting}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500"
              >
                {reconcileModal.submitting ? 'Executing...' : 'Confirm Reconciliation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Bank Account Penny-Drop Verification Modal */}
      {bankVerifyModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-400" />
              <span>Verify Farmer Bank Account</span>
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Status Override</label>
                <select
                  value={bankVerifyModal.status}
                  onChange={(e) => setBankVerifyModal((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="VERIFIED">VERIFIED (Penny-drop verified)</option>
                  <option value="REJECTED">REJECTED (Name mismatch or invalid IFSC)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Admin Verification Note</label>
                <textarea
                  placeholder="Notes regarding RazorpayX penny drop or manual bank passbook inspection..."
                  value={bankVerifyModal.admin_note}
                  onChange={(e) => setBankVerifyModal((prev) => ({ ...prev, admin_note: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white h-20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setBankVerifyModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBankVerify}
                disabled={bankVerifyModal.submitting}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500"
              >
                {bankVerifyModal.submitting ? 'Saving...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Moderate Rating Modal */}
      {moderateModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span>Moderate Review</span>
            </h3>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 italic">
              "{moderateModal.reviewText}"
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Moderation Status</label>
                <select
                  value={moderateModal.status}
                  onChange={(e) => setModerateModal((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="PUBLISHED">PUBLISHED (Visible in trust score)</option>
                  <option value="HIDDEN">HIDDEN (Abusive / Inappropriate)</option>
                  <option value="FLAGGED_FAKE">FLAGGED_FAKE (Suspected competitor spam)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recalc_trust"
                  checked={moderateModal.recalculate_trust}
                  onChange={(e) => setModerateModal((prev) => ({ ...prev, recalculate_trust: e.target.checked }))}
                  className="rounded bg-slate-950 border-slate-700 text-yellow-500"
                />
                <label htmlFor="recalc_trust" className="text-slate-300 select-none cursor-pointer">
                  Recalculate farmer Trust Score immediately
                </label>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Reason / Justification</label>
                <input
                  type="text"
                  placeholder="Reason for moderation action..."
                  value={moderateModal.reason}
                  onChange={(e) => setModerateModal((prev) => ({ ...prev, reason: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModerateModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmModerateReview}
                disabled={moderateModal.submitting}
                className="px-4 py-2 rounded-lg bg-yellow-600 text-white text-xs font-semibold hover:bg-yellow-500"
              >
                {moderateModal.submitting ? 'Applying...' : 'Apply Moderation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Delete Rating Confirmation Modal */}
      {deleteRatingModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              <span>Hard Delete Review</span>
            </h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete this review? This action is audited and cannot be undone.
            </p>
            <div>
              <label className="text-slate-400 block mb-1 text-xs font-mono">Mandatory Reason</label>
              <input
                type="text"
                value={deleteRatingModal.reason}
                onChange={(e) => setDeleteRatingModal((prev) => ({ ...prev, reason: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteRatingModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteRating}
                disabled={deleteRatingModal.submitting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500"
              >
                {deleteRatingModal.submitting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Delete Saved Item Confirmation Modal */}
      {deleteSavedModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              <span>Remove Saved Item / Connection</span>
            </h3>
            <p className="text-xs text-slate-300">
              Confirm removal of <strong className="text-white">"{deleteSavedModal.title}"</strong> from the farmer's {deleteSavedModal.category}.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteSavedModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteSaved}
                disabled={deleteSavedModal.submitting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500"
              >
                {deleteSavedModal.submitting ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Referral Action Modal */}
      {actionReferralModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>Action Referral Bonus</span>
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Administrative Action</label>
                <select
                  value={actionReferralModal.action}
                  onChange={(e) => setActionReferralModal((prev) => ({ ...prev, action: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="APPROVE_REWARD">APPROVE_REWARD (Credit Kisan Coins bonus)</option>
                  <option value="REJECT_FRAUD">REJECT_FRAUD (Block self-referral)</option>
                  <option value="CLAWBACK_REWARD">CLAWBACK_REWARD (Reclaim credited coins)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Reward Kisan Coins</label>
                <input
                  type="number"
                  value={actionReferralModal.reward_coins}
                  onChange={(e) => setActionReferralModal((prev) => ({ ...prev, reward_coins: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Audit Reason</label>
                <input
                  type="text"
                  placeholder="Justification note..."
                  value={actionReferralModal.reason}
                  onChange={(e) => setActionReferralModal((prev) => ({ ...prev, reason: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActionReferralModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmActionReferral}
                disabled={actionReferralModal.submitting}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-500"
              >
                {actionReferralModal.submitting ? 'Applying...' : 'Apply Referral Action'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Campaign Rules Modal */}
      {campaignRulesModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-amber-400" />
              <span>Global Referral Campaign Rules</span>
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Referrer Bonus Coins (Earned by Farmer)</label>
                <input
                  type="number"
                  value={campaignRulesModal.referrer_coins}
                  onChange={(e) => setCampaignRulesModal((prev) => ({ ...prev, referrer_coins: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Referee Welcome Coins (Earned by Invitee)</label>
                <input
                  type="number"
                  value={campaignRulesModal.referee_coins}
                  onChange={(e) => setCampaignRulesModal((prev) => ({ ...prev, referee_coins: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Milestone Trigger</label>
                <select
                  value={campaignRulesModal.milestone_trigger}
                  onChange={(e) => setCampaignRulesModal((prev) => ({ ...prev, milestone_trigger: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="KYC_VERIFIED">KYC_VERIFIED (When 7/12 & Aadhaar approved)</option>
                  <option value="FIRST_TRANSACTION_COMPLETED">FIRST_TRANSACTION_COMPLETED (When 1st produce sold)</option>
                  <option value="REGISTERED">REGISTERED (Immediate upon mobile OTP verification)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="campaign_active"
                  checked={campaignRulesModal.is_active}
                  onChange={(e) => setCampaignRulesModal((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded bg-slate-950 border-slate-700 text-amber-500"
                />
                <label htmlFor="campaign_active" className="text-slate-300 select-none cursor-pointer">
                  Referral Campaign Active Globally
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCampaignRulesModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCampaignRules}
                disabled={campaignRulesModal.submitting}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-500"
              >
                {campaignRulesModal.submitting ? 'Saving...' : 'Save Global Rules'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Verify Vault Document Modal */}
      {verifyVaultDocModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-purple-400" />
              <span>Verify Vault Document</span>
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Verification Status</label>
                <select
                  value={verifyVaultDocModal.status}
                  onChange={(e) => setVerifyVaultDocModal((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="VERIFIED">VERIFIED (Valid and approved)</option>
                  <option value="REJECTED">REJECTED (Unreadable or expired)</option>
                  <option value="QUARANTINED">QUARANTINED (Tampered / forged document)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Administrative Notes</label>
                <input
                  type="text"
                  placeholder="Verification inspection remarks..."
                  value={verifyVaultDocModal.notes}
                  onChange={(e) => setVerifyVaultDocModal((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              {verifyVaultDocModal.status === 'REJECTED' && (
                <div>
                  <label className="text-slate-400 block mb-1">Rejection Reason (Dispatched to Farmer)</label>
                  <input
                    type="text"
                    placeholder="Clear rejection reason..."
                    value={verifyVaultDocModal.rejection_reason}
                    onChange={(e) => setVerifyVaultDocModal((prev) => ({ ...prev, rejection_reason: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setVerifyVaultDocModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVerifyVaultDoc}
                disabled={verifyVaultDocModal.submitting}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500"
              >
                {verifyVaultDocModal.submitting ? 'Updating...' : 'Confirm Verification'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Upload Official Vault Document Modal */}
      {uploadVaultDocModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-400" />
              <span>Upload Official Document to Vault</span>
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Verified 7/12 Land Extract 2026"
                  value={uploadVaultDocModal.title}
                  onChange={(e) => setUploadVaultDocModal((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Category</label>
                <select
                  value={uploadVaultDocModal.category}
                  onChange={(e) => setUploadVaultDocModal((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="kyc">Identity KYC</option>
                  <option value="land">Land Ownership 7/12</option>
                  <option value="finance">Finance / KCC / Passbook</option>
                  <option value="soil">Soil Health Card</option>
                  <option value="insurance">Insurance Policy</option>
                  <option value="receipt">Mandi Patti Receipt</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Document Type</label>
                <select
                  value={uploadVaultDocModal.doc_type}
                  onChange={(e) => setUploadVaultDocModal((prev) => ({ ...prev, doc_type: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="SATBARA_7_12">SATBARA_7_12</option>
                  <option value="AADHAAR">AADHAAR</option>
                  <option value="PAN">PAN</option>
                  <option value="KISAN_CREDIT_CARD">KISAN_CREDIT_CARD</option>
                  <option value="SOIL_HEALTH_CARD">SOIL_HEALTH_CARD</option>
                  <option value="PMFBY_POLICY">PMFBY_POLICY</option>
                  <option value="MANDI_PATTI">MANDI_PATTI</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">File Name or Storage URL</label>
                <input
                  type="text"
                  placeholder="e.g. satbara_extract_pune.pdf or https://..."
                  value={uploadVaultDocModal.download_url}
                  onChange={(e) => setUploadVaultDocModal((prev) => ({ ...prev, download_url: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Administrative Notes</label>
                <input
                  type="text"
                  placeholder="Issued by Revenue Dept / Verified by Admin"
                  value={uploadVaultDocModal.notes}
                  onChange={(e) => setUploadVaultDocModal((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setUploadVaultDocModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUploadVaultDoc}
                disabled={uploadVaultDocModal.submitting || !uploadVaultDocModal.title}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500"
              >
                {uploadVaultDocModal.submitting ? 'Uploading...' : 'Save to Farmer Vault'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Land Record KYC Verification Modal */}
      {landVerifyModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wheat className="w-5 h-5 text-teal-400" />
              <span>Verify 7/12 Land Record</span>
            </h3>
            <p className="text-xs text-slate-300">
              Superadmin approval will verify this 7/12 extract and update the farmer's global KYC status to <strong className="text-emerald-400">VERIFIED</strong>.
            </p>
            <div>
              <label className="text-slate-400 block mb-1 text-xs font-mono">Remarks</label>
              <input
                type="text"
                value={landVerifyModal.remarks}
                onChange={(e) => setLandVerifyModal((prev) => ({ ...prev, remarks: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setLandVerifyModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLandVerify}
                disabled={landVerifyModal.submitting}
                className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-500"
              >
                {landVerifyModal.submitting ? 'Approving...' : 'Approve Land Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. Account Status Toggle Modal */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {statusModal.newStatus === 'ACTIVE' ? <Unlock className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5 text-red-400" />}
              <span>{statusModal.newStatus === 'ACTIVE' ? 'Activate Account' : 'Suspend Account'}</span>
            </h3>
            <p className="text-xs text-slate-300">
              {statusModal.newStatus === 'ACTIVE'
                ? 'Reactivating this farmer will allow them to login, trade produce, and access the application.'
                : 'Suspending this farmer will immediately evict active session tokens from Redis and block access.'}
            </p>
            <div>
              <label className="text-slate-400 block mb-1 text-xs font-mono">Administrative Policy Reason</label>
              <textarea
                placeholder="Audit reason..."
                value={statusModal.reason}
                onChange={(e) => setStatusModal((prev) => ({ ...prev, reason: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs font-mono h-20"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={statusModal.submitting}
                className={`px-4 py-2 rounded-lg text-white text-xs font-semibold ${
                  statusModal.newStatus === 'ACTIVE' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                {statusModal.submitting ? 'Updating...' : 'Confirm Status Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

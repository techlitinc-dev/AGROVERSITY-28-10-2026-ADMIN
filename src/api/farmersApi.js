import client from './client';

export const farmersApi = {
  /**
   * 1. Farmer Directory & Filter Operations
   * GET /api/v1/admin/farmers
   * Supports search query (q), status, kyc_status, state, district, crop_type,
   * start_date, end_date (datetime filtering), pagination, and sort_by (defaults to createdAt desc, recent 1st)
   */
  fetchFarmers: async ({
    q = '',
    status = '',
    kyc_status = '',
    state = '',
    district = '',
    crop_type = '',
    start_date = '',
    end_date = '',
    page = 1,
    limit = 20,
    sort_by = 'createdAt',
    order = 'desc',
  } = {}) => {
    const params = { page, limit, sort_by, order };
    if (q) params.q = q;
    if (status) params.status = status;
    if (kyc_status) params.kyc_status = kyc_status;
    if (state) params.state = state;
    if (district) params.district = district;
    if (crop_type) params.crop_type = crop_type;
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;

    try {
      const response = await client.get('/api/v1/admin/farmers', { params });
      return response.data;
    } catch {
      const response = await client.get('/v1/admin/farmers', { params });
      return response.data;
    }
  },

  /**
   * Farmer Statistics & High-Level Metrics
   * GET /api/v1/admin/farmers/stats
   */
  fetchFarmerStats: async (range = 'all') => {
    try {
      const response = await client.get('/api/v1/admin/farmers/stats', { params: { range } });
      return response.data;
    } catch {
      const response = await client.get('/v1/admin/farmers/stats', { params: { range } });
      return response.data;
    }
  },

  /**
   * 2. Farmer Common Features 360° Snapshot
   * GET /api/v1/admin/farmers/{user_id}/common-features-360
   */
  fetchFarmerCommonFeatures360: async (userId) => {
    try {
      const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/common-features-360`);
      return response.data;
    } catch {
      const response = await client.get(`/v1/admin/farmers/${encodeURIComponent(userId)}/common-features-360`);
      return response.data;
    }
  },

  /**
   * 2b. Unified Farmer Common Five Features 360 (Section 4 Specification)
   * GET /api/v1/admin/farmers/{user_id}/common-5-summary
   */
  fetchCommon5Summary: async (userId) => {
    try {
      const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/common-5-summary`);
      return response.data;
    } catch {
      const response = await client.get(`/v1/admin/farmers/${encodeURIComponent(userId)}/common-5-summary`);
      return response.data;
    }
  },

  /**
   * Farmer 360° Profile & Identity Summary
   * GET /api/v1/admin/farmers/{user_id}/summary
   */
  fetchFarmer360: async (userId) => {
    try {
      const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/summary`);
      return response.data;
    } catch {
      const response = await client.get(`/v1/admin/farmers/${encodeURIComponent(userId)}/summary`);
      return response.data;
    }
  },

  /**
   * Correct Profile Metadata
   * PATCH /api/v1/admin/farmers/{user_id}/profile
   */
  updateFarmerProfile: async (userId, payload) => {
    try {
      const response = await client.patch(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/profile`, payload);
      return response.data;
    } catch {
      const response = await client.patch(`/v1/admin/farmers/${encodeURIComponent(userId)}/profile`, payload);
      return response.data;
    }
  },

  /**
   * Toggles account status (ACTIVE | SUSPENDED | BANNED | LOCKED)
   * POST /api/v1/admin/farmers/{user_id}/status
   */
  updateFarmerStatus: async (userId, { status, reason = 'Administrative status change' }) => {
    try {
      const response = await client.post(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/status`, {
        status,
        reason,
      });
      return response.data;
    } catch {
      const response = await client.post(`/v1/admin/farmers/${encodeURIComponent(userId)}/status`, {
        status,
        reason,
      });
      return response.data;
    }
  },

  /**
   * Generates a scoped, temporary impersonation token
   * POST /api/v1/admin/farmers/{user_id}/impersonate
   */
  impersonateFarmer: async (userId) => {
    try {
      const response = await client.post(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/impersonate`);
      return response.data;
    } catch {
      const response = await client.post(`/v1/admin/farmers/${encodeURIComponent(userId)}/impersonate`);
      return response.data;
    }
  },

  // -------------------------------------------------------------------------
  // 3.1 Shopping Mall (E-Market & Supplies)
  // -------------------------------------------------------------------------
  fetchMallOrders: async (userId, { status = '', payment_status = '', page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (status) params.status = status;
    if (payment_status) params.payment_status = payment_status;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/mall/orders`, { params });
    return response.data;
  },

  fetchMallActivity: async (userId, { page = 1, limit = 20 } = {}) => {
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/mall/activity`, { params: { page, limit } });
    return response.data;
  },

  overrideMallOrder: async (userId, orderId, { status, reason = 'Admin override' }) => {
    const response = await client.post(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/mall/orders/${encodeURIComponent(orderId)}/override`, {
      status,
      reason,
    });
    return response.data;
  },

  // -------------------------------------------------------------------------
  // 3.2 Courses & My Learning
  // -------------------------------------------------------------------------
  fetchLearningOverview: async (userId, { status = '' } = {}) => {
    const params = {};
    if (status) params.status = status;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/learning/overview`, { params });
    return response.data;
  },

  fetchLearningActivities: async (userId, { page = 1, limit = 20 } = {}) => {
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/learning/activities`, { params: { page, limit } });
    return response.data;
  },

  manageCourseEnrollment: async (userId, { course_id, action }) => {
    const response = await client.post(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/learning/enrollments`, {
      course_id,
      action,
    });
    return response.data;
  },

  // -------------------------------------------------------------------------
  // 3.3 News & Audio
  // -------------------------------------------------------------------------
  fetchMediaEngagement: async (userId, { type = '', page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (type) params.type = type;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/media/engagement`, { params });
    return response.data;
  },

  deleteMediaComment: async (userId, commentId, reason = 'Violates community guidelines') => {
    const response = await client.delete(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/media/comments/${encodeURIComponent(commentId)}`, {
      params: { reason },
    });
    return response.data;
  },

  // -------------------------------------------------------------------------
  // 3.4 Payments & Transactions
  // -------------------------------------------------------------------------
  fetchPaymentsOverview: async (userId, { date_from = '', date_to = '' } = {}) => {
    const params = {};
    if (date_from) params.date_from = date_from;
    if (date_to) params.date_to = date_to;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/payments/overview`, { params });
    return response.data;
  },

  fetchPaymentsTransactions: async (userId, { type = '', status = '', module = '', page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (type) params.type = type;
    if (status) params.status = status;
    if (module) params.module = module;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/payments/transactions`, { params });
    return response.data;
  },

  fetchPaymentsLedger: async (userId, { type = '', page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (type) params.type = type;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/payments/transactions`, { params });
    return response.data;
  },

  fetchPaymentsSettlements: async (userId, { status = '', page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (status) params.status = status;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/payments/settlements`, { params });
    return response.data;
  },

  fetchBankAccounts: async (userId) => {
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/payments/bank-accounts`);
    return response.data;
  },

  verifyBankAccount: async (userId, accountId, { status, admin_note = '' }) => {
    const response = await client.post(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/payments/bank-accounts/${encodeURIComponent(accountId)}/verify`, {
      status,
      admin_note,
    });
    return response.data;
  },

  reconcilePayment: async (userId, { transaction_id, settlement_id, action, utr_number = '', reason = '' }) => {
    const payload = { action };
    if (transaction_id) payload.transaction_id = transaction_id;
    if (settlement_id) payload.settlement_id = settlement_id;
    if (utr_number) payload.utr_number = utr_number;
    if (reason) payload.reason = reason;
    const response = await client.post(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/payments/reconcile`, payload);
    return response.data;
  },

  // -------------------------------------------------------------------------
  // 3.5 Ratings & Reviews
  // -------------------------------------------------------------------------
  fetchRatingsOverview: async (userId) => {
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/ratings/overview`);
    return response.data;
  },

  fetchRatingsList: async (userId, { direction = 'received', target_type = '', status = '', min_stars, max_stars, page = 1, limit = 20 } = {}) => {
    const params = { direction, page, limit };
    if (target_type) params.target_type = target_type;
    if (status) params.status = status;
    if (min_stars !== undefined && min_stars !== null) params.min_stars = min_stars;
    if (max_stars !== undefined && max_stars !== null) params.max_stars = max_stars;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/ratings/list`, { params });
    return response.data;
  },

  fetchRatings: async (userId, { direction = 'received', entity_type = '', page = 1, limit = 20 } = {}) => {
    const params = { direction, page, limit };
    if (entity_type) params.entity_type = entity_type;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/ratings/list`, { params });
    return response.data;
  },

  fetchRatingsPrompts: async (userId, { status = '', page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (status) params.status = status;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/ratings/prompts`, { params });
    return response.data;
  },

  moderateReview: async (userId, reviewId, { status, recalculate_trust = true, reason = '', note = '' }) => {
    const response = await client.patch(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/ratings/${encodeURIComponent(reviewId)}/moderate`, {
      status,
      recalculate_trust,
      reason: reason || note,
      note: note || reason,
    });
    return response.data;
  },

  deleteRatingReview: async (userId, reviewId, reason = 'Violates platform policies') => {
    const response = await client.delete(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/ratings/${encodeURIComponent(reviewId)}`, {
      params: { reason },
    });
    return response.data;
  },

  // -------------------------------------------------------------------------
  // 3.6 Saved & Following
  // -------------------------------------------------------------------------
  fetchSavedOverview: async (userId) => {
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/saved-following/overview`);
    return response.data;
  },

  fetchSavedConnections: async (userId, { direction = 'following', persona_role = '', page = 1, limit = 20 } = {}) => {
    const params = { direction, page, limit };
    if (persona_role) params.persona_role = persona_role;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/saved-following/connections`, { params });
    return response.data;
  },

  fetchSavedWishlist: async (userId, { item_type = '', page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (item_type) params.item_type = item_type;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/saved-following/wishlist`, { params });
    return response.data;
  },

  fetchSavedSearchesAlerts: async (userId, { type = '', active_only = false, page = 1, limit = 20 } = {}) => {
    const params = { active_only, page, limit };
    if (type) params.type = type;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/saved-following/searches-and-alerts`, { params });
    return response.data;
  },

  fetchSavedFollowing: async (userId, { category = '' } = {}) => {
    const params = {};
    if (category) params.category = category;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/saved-following/overview`, { params });
    return response.data;
  },

  deleteSavedItem: async (userId, itemType, itemId, reason = 'Admin cleanup') => {
    const response = await client.delete(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/saved-following/${encodeURIComponent(itemType)}/${encodeURIComponent(itemId)}`, {
      params: { reason },
    });
    return response.data;
  },

  // -------------------------------------------------------------------------
  // 3.7 Tree Plantation Hub
  // -------------------------------------------------------------------------
  fetchTrees: async (userId, { status = '', species = '' } = {}) => {
    const params = {};
    if (status) params.status = status;
    if (species) params.species = species;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/trees`, { params });
    return response.data;
  },

  verifyTree: async (userId, treeId, { status, reward_coins = 50, remarks = '' }) => {
    const response = await client.put(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/trees/${encodeURIComponent(treeId)}/verify`, {
      status,
      reward_coins,
      remarks,
    });
    return response.data;
  },

  // -------------------------------------------------------------------------
  // 3.8 Kisan Coins
  // -------------------------------------------------------------------------
  fetchCoinsHistory: async (userId, { type = '', page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (type) params.type = type;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/coins/history`, { params });
    return response.data;
  },

  adjustCoins: async (userId, { amount, operation, reason = '' }) => {
    const response = await client.post(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/coins/adjust`, {
      amount,
      operation,
      reason,
    });
    return response.data;
  },

  // -------------------------------------------------------------------------
  // 3.9 Refer & Earn
  // -------------------------------------------------------------------------
  fetchReferralsOverview: async (userId) => {
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/referrals/overview`);
    return response.data;
  },

  fetchReferralsInvitees: async (userId, { status = '', page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (status) params.status = status;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/referrals/invitees`, { params });
    return response.data;
  },

  fetchReferralsRewardsLedger: async (userId, { page = 1, limit = 20 } = {}) => {
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/referrals/rewards-ledger`, { params: { page, limit } });
    return response.data;
  },

  fetchReferrals: async (userId, { status = '', page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (status) params.status = status;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/referrals/invitees`, { params });
    return response.data;
  },

  actionReferral: async (userId, referralId, { action, reward_coins = 100, reason = '' }) => {
    const response = await client.post(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/referrals/${encodeURIComponent(referralId)}/action`, {
      action,
      reward_coins,
      reason,
    });
    return response.data;
  },

  moderateReferral: async (userId, referralId, { action, reason = '' }) => {
    const response = await client.post(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/referrals/${encodeURIComponent(referralId)}/action`, {
      action,
      reason,
    });
    return response.data;
  },

  updateReferralCampaignRules: async (payload) => {
    const response = await client.put('/api/v1/admin/farmer-modules/referrals/campaign-rules', payload);
    return response.data;
  },

  // -------------------------------------------------------------------------
  // 3.10 Document Vault
  // -------------------------------------------------------------------------
  fetchVaultOverview: async (userId) => {
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/vault/overview`);
    return response.data;
  },

  fetchVaultDocuments: async (userId, { category = '', doc_type = '', status = '', verification_status = '', page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (category) params.category = category;
    if (doc_type) params.doc_type = doc_type;
    if (status) params.status = status;
    if (verification_status) params.verification_status = verification_status;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/vault/documents`, { params });
    return response.data;
  },

  fetchVaultDocumentActivity: async (userId, docId) => {
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/vault/documents/${encodeURIComponent(docId)}/activity`);
    return response.data;
  },

  verifyVaultDocument: async (userId, docId, { status, extracted_data_override = null, rejection_reason = '', notes = '' }) => {
    const payload = { status };
    if (extracted_data_override) payload.extracted_data_override = extracted_data_override;
    if (rejection_reason) payload.rejection_reason = rejection_reason;
    if (notes) payload.notes = notes;
    const response = await client.put(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/vault/documents/${encodeURIComponent(docId)}/verify`, payload);
    return response.data;
  },

  updateVaultDocStatus: async (userId, docId, { status, notes = '' }) => {
    const response = await client.put(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/vault/documents/${encodeURIComponent(docId)}/verify`, {
      status,
      notes,
    });
    return response.data;
  },

  uploadVaultDocument: async (userId, payload) => {
    const response = await client.post(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/vault/documents`, payload);
    return response.data;
  },

  // -------------------------------------------------------------------------
  // 3.11 Govt Schemes
  // -------------------------------------------------------------------------
  fetchSchemes: async (userId, { status = '' } = {}) => {
    const params = {};
    if (status) params.status = status;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/schemes`, { params });
    return response.data;
  },

  assistSchemeApplication: async (userId, schemeId, { status, remarks = '' }) => {
    const response = await client.post(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/schemes/${encodeURIComponent(schemeId)}/assist`, {
      status,
      remarks,
    });
    return response.data;
  },

  // -------------------------------------------------------------------------
  // 3.12 7/12 Land Records
  // -------------------------------------------------------------------------
  fetchLandRecords: async (userId) => {
    try {
      const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/land-records`);
      return response.data;
    } catch {
      const response = await client.get(`/v1/admin/farmers/${encodeURIComponent(userId)}/land-records`);
      return response.data;
    }
  },

  verifyLandRecord: async (userId, docId, { status, remarks = 'Admin land KYC review' }) => {
    try {
      const response = await client.put(
        `/api/v1/admin/farmers/${encodeURIComponent(userId)}/land-records/${encodeURIComponent(docId)}/verify`,
        { status, remarks }
      );
      return response.data;
    } catch {
      const response = await client.put(
        `/v1/admin/farmers/${encodeURIComponent(userId)}/land-records/${encodeURIComponent(docId)}/verify`,
        { status, remarks }
      );
      return response.data;
    }
  },

  // -------------------------------------------------------------------------
  // 3.13 Profit & Loss
  // -------------------------------------------------------------------------
  fetchPnlSummary: async (userId, { season = '', crop_id = '', year = '' } = {}) => {
    const params = {};
    if (season) params.season = season;
    if (crop_id) params.crop_id = crop_id;
    if (year) params.year = year;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/pnl/summary`, { params });
    return response.data;
  },

  fetchPnlEntries: async (userId, { type = '', source = '', page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (type) params.type = type;
    if (source) params.source = source;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/pnl/entries`, { params });
    return response.data;
  },

  updatePnlEntry: async (userId, entryId, payload) => {
    const response = await client.patch(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/pnl/entries/${encodeURIComponent(entryId)}`, payload);
    return response.data;
  },

  // -------------------------------------------------------------------------
  // 3.14 Farm Diary
  // -------------------------------------------------------------------------
  fetchDiaryEntries: async (userId, { crop_id = '', activity_type = '', start_date = '', end_date = '', page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (crop_id) params.crop_id = crop_id;
    if (activity_type) params.activity_type = activity_type;
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/diary`, { params });
    return response.data;
  },

  deleteDiaryEntry: async (userId, entryId, reason = 'Admin moderation of spam log') => {
    const response = await client.delete(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/diary/${encodeURIComponent(entryId)}`, {
      params: { reason },
    });
    return response.data;
  },

  // -------------------------------------------------------------------------
  // 3.15 Live Mandi Prices
  // -------------------------------------------------------------------------
  fetchMandiActivity: async (userId, { commodity = '', mandi_id = '', page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (commodity) params.commodity = commodity;
    if (mandi_id) params.mandi_id = mandi_id;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/mandi/activity`, { params });
    return response.data;
  },

  // -------------------------------------------------------------------------
  // 3.16 Advertisement
  // -------------------------------------------------------------------------
  fetchAdsActivity: async (userId, { type = '', page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (type) params.type = type;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/ads/activity`, { params });
    return response.data;
  },

  // -------------------------------------------------------------------------
  // 3.17 AI Analytics
  // -------------------------------------------------------------------------
  fetchAiDecisions: async (userId, { feature = '', page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (feature) params.feature = feature;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/ai-analytics/decisions`, { params });
    return response.data;
  },

  fetchAiTelemetry: async (userId, { range = '30d' } = {}) => {
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/ai-analytics/telemetry`, { params: { range } });
    return response.data;
  },

  // -------------------------------------------------------------------------
  // 3.18 AI Scanner
  // -------------------------------------------------------------------------
  fetchAiScans: async (userId, { scan_type = '', page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (scan_type) params.scan_type = scan_type;
    const response = await client.get(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/ai-scanner/scans`, { params });
    return response.data;
  },

  reviewAiScan: async (userId, scanId, { corrected_diagnosis, corrected_treatment, notify_farmer = true }) => {
    const response = await client.put(`/api/v1/admin/farmers/${encodeURIComponent(userId)}/ai-scanner/scans/${encodeURIComponent(scanId)}/review`, {
      corrected_diagnosis,
      corrected_treatment,
      notify_farmer,
    });
    return response.data;
  },

  // -------------------------------------------------------------------------
  // Global Persona Modules Management
  // -------------------------------------------------------------------------
  fetchGlobalModulesOverview: async () => {
    try {
      const response = await client.get('/api/v1/admin/farmer-modules/overview');
      return response.data;
    } catch {
      const response = await client.get('/v1/admin/farmer-modules/overview');
      return response.data;
    }
  },

  updateGlobalCourse: async (courseId, payload) => {
    const response = await client.put(`/api/v1/admin/farmer-modules/courses/${encodeURIComponent(courseId)}`, payload);
    return response.data;
  },

  publishGlobalMedia: async (payload) => {
    const response = await client.post('/api/v1/admin/farmer-modules/media/publish', payload);
    return response.data;
  },

  overrideGlobalMandiRate: async (payload) => {
    const response = await client.post('/api/v1/admin/farmer-modules/mandi/rates/override', payload);
    return response.data;
  },

  updateGlobalAdStatus: async (adId, payload) => {
    const response = await client.put(`/api/v1/admin/farmer-modules/ads/${encodeURIComponent(adId)}/status`, payload);
    return response.data;
  },

  // =========================================================================
  // Aliases matching Section 5 Phase 2 Specification
  // =========================================================================
  getFarmerCommon5Summary: async (userId) => {
    return farmersApi.fetchCommon5Summary(userId);
  },
  getFarmerPaymentsOverview: async (userId, params) => {
    return farmersApi.fetchPaymentsOverview(userId, params);
  },
  getFarmerTransactions: async (userId, params) => {
    return farmersApi.fetchPaymentsTransactions(userId, params);
  },
  getFarmerSettlements: async (userId, params) => {
    return farmersApi.fetchPaymentsSettlements(userId, params);
  },
  getFarmerBankAccounts: async (userId) => {
    return farmersApi.fetchBankAccounts(userId);
  },
  verifyFarmerBankAccount: async (userId, accountId, payload) => {
    return farmersApi.verifyBankAccount(userId, accountId, payload);
  },
  reconcileFarmerPayment: async (userId, payload) => {
    return farmersApi.reconcilePayment(userId, payload);
  },
  getFarmerRatingsOverview: async (userId) => {
    return farmersApi.fetchRatingsOverview(userId);
  },
  getFarmerRatingsList: async (userId, params) => {
    return farmersApi.fetchRatingsList(userId, params);
  },
  getFarmerRatingPrompts: async (userId, params) => {
    return farmersApi.fetchRatingsPrompts(userId, params);
  },
  moderateFarmerRating: async (userId, reviewId, payload) => {
    return farmersApi.moderateReview(userId, reviewId, payload);
  },
  deleteFarmerRating: async (userId, reviewId, reason) => {
    return farmersApi.deleteRatingReview(userId, reviewId, reason);
  },
  getFarmerSavedFollowingOverview: async (userId) => {
    return farmersApi.fetchSavedOverview(userId);
  },
  getFarmerConnections: async (userId, params) => {
    return farmersApi.fetchSavedConnections(userId, params);
  },
  getFarmerWishlist: async (userId, params) => {
    return farmersApi.fetchSavedWishlist(userId, params);
  },
  getFarmerSearchesAndAlerts: async (userId, params) => {
    return farmersApi.fetchSavedSearchesAlerts(userId, params);
  },
  deleteFarmerSavedItem: async (userId, category, itemId, reason) => {
    return farmersApi.deleteSavedItem(userId, category, itemId, reason);
  },
  getFarmerReferralsOverview: async (userId) => {
    return farmersApi.fetchReferralsOverview(userId);
  },
  getFarmerReferralInvitees: async (userId, params) => {
    return farmersApi.fetchReferralsInvitees(userId, params);
  },
  getFarmerReferralLedger: async (userId, params) => {
    return farmersApi.fetchReferralsRewardsLedger(userId, params);
  },
  actionFarmerReferral: async (userId, referralId, payload) => {
    return farmersApi.actionReferral(userId, referralId, payload);
  },
  getFarmerVaultOverview: async (userId) => {
    return farmersApi.fetchVaultOverview(userId);
  },
  getFarmerVaultDocuments: async (userId, params) => {
    return farmersApi.fetchVaultDocuments(userId, params);
  },
  getFarmerVaultDocActivity: async (userId, docId) => {
    return farmersApi.fetchVaultDocumentActivity(userId, docId);
  },
  verifyFarmerVaultDocument: async (userId, docId, payload) => {
    return farmersApi.verifyVaultDocument(userId, docId, payload);
  },
  uploadFarmerVaultDocument: async (userId, payload) => {
    return farmersApi.uploadVaultDocument(userId, payload);
  },
};

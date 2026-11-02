import client from './client';

export const usersApi = {
  /**
   * 1. User Directory & Filter Operations
   * GET /api/v1/admin/users (falls back to /v1/admin/users if needed)
   * Supports search query (q), persona role, status, kyc_status, is_blocked, state, district,
   * start_date, end_date (datetime filtering), pagination, and sort_by (defaults to createdAt desc, recent 1st)
   */
  fetchUsers: async ({
    q = '',
    role = '',
    status = '',
    kyc_status = '',
    is_blocked = undefined,
    state = '',
    district = '',
    start_date = '',
    end_date = '',
    page = 1,
    limit = 20,
    sort_by = 'createdAt',
    order = 'desc',
  } = {}) => {
    const params = { page, limit, sort_by, order };
    if (q) params.q = q;
    if (role) params.role = role;
    if (status) params.status = status;
    if (kyc_status) params.kyc_status = kyc_status;
    if (is_blocked !== undefined && is_blocked !== '') params.is_blocked = is_blocked;
    if (state) params.state = state;
    if (district) params.district = district;
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;

    try {
      const response = await client.get('/api/v1/admin/users', { params });
      return response.data;
    } catch (err) {
      // Fallback to /v1/admin/users if /api/v1 prefix differs
      const response = await client.get('/v1/admin/users', { params });
      return response.data;
    }
  },

  /**
   * User Statistics & High-Level Metrics
   * GET /api/v1/admin/users/stats
   */
  fetchUserStats: async (range = 'all') => {
    try {
      const response = await client.get('/api/v1/admin/users/stats', { params: { range } });
      return response.data;
    } catch {
      const response = await client.get('/v1/admin/users/stats', { params: { range } });
      return response.data;
    }
  },

  /**
   * Direct System Creation of Accounts
   * POST /api/v1/admin/users
   */
  createUser: async (payload) => {
    try {
      const response = await client.post('/api/v1/admin/users', payload);
      return response.data;
    } catch {
      const response = await client.post('/v1/admin/users', payload);
      return response.data;
    }
  },

  /**
   * 2. User 360° Profile & Identity
   * GET /api/v1/admin/users/{user_id}/summary
   */
  fetchUser360: async (userId) => {
    try {
      const response = await client.get(`/api/v1/admin/users/${encodeURIComponent(userId)}/summary`);
      return response.data;
    } catch {
      const response = await client.get(`/v1/admin/users/${encodeURIComponent(userId)}/summary`);
      return response.data;
    }
  },

  /**
   * Persona-Specific Data
   * GET /api/v1/admin/users/{user_id}/personas
   */
  fetchUserPersonas: async (userId) => {
    try {
      const response = await client.get(`/api/v1/admin/users/${encodeURIComponent(userId)}/personas`);
      return response.data;
    } catch {
      const response = await client.get(`/v1/admin/users/${encodeURIComponent(userId)}/personas`);
      return response.data;
    }
  },

  /**
   * Uploaded Identity Documents
   * GET /api/v1/admin/users/{user_id}/kyc
   */
  fetchUserKyc: async (userId) => {
    try {
      const response = await client.get(`/api/v1/admin/users/${encodeURIComponent(userId)}/kyc`);
      return response.data;
    } catch {
      const response = await client.get(`/v1/admin/users/${encodeURIComponent(userId)}/kyc`);
      return response.data;
    }
  },

  /**
   * Manual KYC Override
   * PUT /api/v1/admin/users/{user_id}/kyc
   */
  overrideUserKyc: async (userId, { status, remarks = '', document_id = null }) => {
    const payload = { status, remarks, document_id };
    const config = {
      headers: {
        'X-Audit-Reason': remarks || `Admin manual KYC decision: ${status}`,
      },
    };
    try {
      const response = await client.put(
        `/api/v1/admin/users/${encodeURIComponent(userId)}/kyc`,
        payload,
        config
      );
      return response.data;
    } catch {
      const response = await client.put(
        `/v1/admin/users/${encodeURIComponent(userId)}/kyc`,
        payload,
        config
      );
      return response.data;
    }
  },

  /**
   * Correct Profile Metadata
   * PATCH /api/v1/admin/users/{user_id}/profile
   */
  updateUserProfile: async (userId, profileData, reason = 'Admin profile update') => {
    const response = await client.patch(
      `/api/v1/admin/users/${encodeURIComponent(userId)}/profile`,
      profileData,
      {
        headers: {
          'X-Audit-Reason': reason,
        },
      }
    );
    return response.data;
  },

  /**
   * 3. Activity & Telemetry Logging
   * GET /api/v1/admin/users/{user_id}/activities
   */
  fetchUserActivities: async (userId, { category = '', start_date = '', end_date = '', page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (category) params.category = category;
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;

    const response = await client.get(`/api/v1/admin/users/${encodeURIComponent(userId)}/activities`, { params });
    return response.data;
  },

  /**
   * Historical Login Log
   * GET /api/v1/admin/users/{user_id}/logins
   */
  fetchUserLogins: async (userId, { page = 1, limit = 20 } = {}) => {
    const response = await client.get(`/api/v1/admin/users/${encodeURIComponent(userId)}/logins`, {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Active Sessions & Devices
   * GET /api/v1/admin/users/{user_id}/sessions
   */
  fetchUserSessions: async (userId) => {
    const response = await client.get(`/api/v1/admin/users/${encodeURIComponent(userId)}/sessions`);
    return response.data;
  },

  /**
   * Admin Audit Trail
   * GET /api/v1/admin/users/{user_id}/audit-trail
   */
  fetchUserAuditTrail: async (userId, { page = 1, limit = 20 } = {}) => {
    const response = await client.get(`/api/v1/admin/users/${encodeURIComponent(userId)}/audit-trail`, {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * 4. Content & Platform Entities
   * GET /api/v1/admin/users/{user_id}/content/summary
   */
  fetchUserContentSummary: async (userId) => {
    const response = await client.get(`/api/v1/admin/users/${encodeURIComponent(userId)}/content/summary`);
    return response.data;
  },

  fetchUserLots: async (userId, { status = '', page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (status) params.status = status;
    const response = await client.get(`/api/v1/admin/users/${encodeURIComponent(userId)}/content/lots`, { params });
    return response.data;
  },

  fetchUserOrders: async (userId, { type = 'buy', page = 1, limit = 20 } = {}) => {
    const response = await client.get(`/api/v1/admin/users/${encodeURIComponent(userId)}/content/orders`, {
      params: { type, page, limit },
    });
    return response.data;
  },

  fetchUserTransportTrips: async (userId, { status = '', page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (status) params.status = status;
    const response = await client.get(`/api/v1/admin/users/${encodeURIComponent(userId)}/content/transport-trips`, { params });
    return response.data;
  },

  fetchUserReviews: async (userId, { filter = 'received', page = 1, limit = 20 } = {}) => {
    const response = await client.get(`/api/v1/admin/users/${encodeURIComponent(userId)}/content/reviews`, {
      params: { filter, page, limit },
    });
    return response.data;
  },

  fetchUserUploads: async (userId, { type = '', page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (type) params.type = type;
    const response = await client.get(`/api/v1/admin/users/${encodeURIComponent(userId)}/content/uploads`, { params });
    return response.data;
  },

  deleteUserContent: async (userId, entityType, entityId, reason = 'Moderation takedown') => {
    const response = await client.delete(
      `/api/v1/admin/users/${encodeURIComponent(userId)}/content/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`,
      {
        headers: {
          'X-Audit-Reason': reason,
        },
      }
    );
    return response.data;
  },

  /**
   * 5. Admin Governance & Security Controls
   * POST /api/v1/admin/users/{user_id}/status
   */
  updateUserStatus: async (userId, status, reason = 'Admin governance update') => {
    const response = await client.post(
      `/api/v1/admin/users/${encodeURIComponent(userId)}/status`,
      { status, reason },
      {
        headers: {
          'X-Audit-Reason': reason,
        },
      }
    );
    return response.data;
  },

  /**
   * Revoke Sessions
   * POST /api/v1/admin/users/{user_id}/sessions/revoke
   */
  revokeUserSessions: async (userId, sessionId = 'all', reason = 'Admin forced session revocation') => {
    const response = await client.post(
      `/api/v1/admin/users/${encodeURIComponent(userId)}/sessions/revoke`,
      { session_id: sessionId },
      {
        headers: {
          'X-Audit-Reason': reason,
        },
      }
    );
    return response.data;
  },

  /**
   * Assign / Strip Role Personas
   * POST /api/v1/admin/users/{user_id}/personas/assign
   */
  assignUserPersonas: async (userId, roles = [], reason = 'Admin persona reassignment') => {
    const response = await client.post(
      `/api/v1/admin/users/${encodeURIComponent(userId)}/personas/assign`,
      { roles },
      {
        headers: {
          'X-Audit-Reason': reason,
        },
      }
    );
    return response.data;
  },

  /**
   * Manual Wallet Ledger Adjustment
   * POST /api/v1/admin/users/{user_id}/wallet/adjust
   */
  adjustUserWallet: async (userId, { amount, type = 'CREDIT', reason }) => {
    const response = await client.post(
      `/api/v1/admin/users/${encodeURIComponent(userId)}/wallet/adjust`,
      { amount: parseFloat(amount), type, reason },
      {
        headers: {
          'X-Audit-Reason': reason,
        },
      }
    );
    return response.data;
  },

  /**
   * Impersonate User
   * POST /api/v1/admin/users/{user_id}/impersonate
   */
  impersonateUser: async (userId) => {
    const response = await client.post(`/api/v1/admin/users/${encodeURIComponent(userId)}/impersonate`, {});
    return response.data;
  },

  /**
   * Export Full User Dossier
   * GET /api/v1/admin/users/{user_id}/export
   */
  exportUserDossier: async (userId, format = 'json') => {
    const response = await client.get(`/api/v1/admin/users/${encodeURIComponent(userId)}/export`, {
      params: { format },
      responseType: format === 'csv' ? 'blob' : 'json',
    });
    return response.data;
  },

  /**
   * Export User Roster
   * GET /v1/admin/users/export
   */
  exportUsers: async ({ format = 'json', profile = '', status = '' } = {}) => {
    const params = { format };
    if (profile) params.profile = profile;
    if (status) params.status = status;

    const response = await client.get('/v1/admin/users/export', {
      params,
      responseType: format === 'csv' ? 'blob' : 'json',
    });
    return response.data;
  },
};

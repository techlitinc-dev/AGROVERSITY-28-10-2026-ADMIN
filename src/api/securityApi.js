import client from './client';

export const securityApi = {
  /**
   * List Authentication Users
   * GET /v1/admin/auth/users
   */
  listAuthUsers: async ({ page = 1, pageSize = 20 } = {}) => {
    const response = await client.get('/v1/admin/auth/users', {
      params: { page, pageSize },
    });
    return response.data;
  },

  /**
   * Reset MPIN for an account
   * POST /v1/admin/auth/users/{uid}/reset-mpin
   */
  resetUserMpin: async (uid, reason) => {
    const response = await client.post(
      `/v1/admin/auth/users/${encodeURIComponent(uid)}/reset-mpin`,
      {},
      {
        headers: {
          'X-Audit-Reason': reason || 'Administrative MPIN reset requested',
        },
      }
    );
    return response.data;
  },

  /**
   * Revoke active sessions (force logout)
   * POST /v1/admin/auth/users/{uid}/revoke-sessions
   */
  revokeUserSessions: async (uid, reason) => {
    const response = await client.post(
      `/v1/admin/auth/users/${encodeURIComponent(uid)}/revoke-sessions`,
      {},
      {
        headers: {
          'X-Audit-Reason': reason || 'Administrative session revocation',
        },
      }
    );
    return response.data;
  },

  /**
   * Update Auth User Status (active, suspended, locked)
   * PUT /v1/admin/auth/users/{uid}/status
   */
  updateAuthStatus: async (uid, status, reason) => {
    const response = await client.put(
      `/v1/admin/auth/users/${encodeURIComponent(uid)}/status`,
      { status },
      {
        headers: {
          'X-Audit-Reason': reason || 'Administrative auth status modification',
        },
      }
    );
    return response.data;
  },

  /**
   * Get Platform Security Policy
   * GET /v1/admin/auth/security-policy
   */
  getSecurityPolicy: async () => {
    const response = await client.get('/v1/admin/auth/security-policy');
    return response.data;
  },

  /**
   * Update Platform Security Policy
   * PUT /v1/admin/auth/security-policy
   */
  updateSecurityPolicy: async (policy, reason) => {
    const response = await client.put(
      '/v1/admin/auth/security-policy',
      policy,
      {
        headers: {
          'X-Audit-Reason': reason || 'Platform security policy configuration update',
        },
      }
    );
    return response.data;
  },
};

import client from './client';

export const usersApi = {
  /**
   * List Users with optional filtering and pagination
   * GET /v1/admin/users
   */
  listUsers: async ({ page = 1, pageSize = 20, search = '', status = '', persona = '' } = {}) => {
    const params = { page, pageSize };
    if (search) params.search = search;
    if (status) params.status = status;
    if (persona) params.persona = persona;

    const response = await client.get('/v1/admin/users', { params });
    return response.data;
  },

  /**
   * Get User Details by UID
   * GET /v1/admin/users/{uid}
   */
  getUserDetails: async (uid) => {
    const response = await client.get(`/v1/admin/users/${encodeURIComponent(uid)}`);
    return response.data;
  },

  /**
   * Update User Status (Action update with reason)
   * POST /v1/admin/users/{target_uid}/status
   */
  updateUserStatus: async (targetUid, status, reason) => {
    const response = await client.post(
      `/v1/admin/users/${encodeURIComponent(targetUid)}/status`,
      { status, reason },
      {
        headers: {
          'X-Audit-Reason': reason || 'Administrative status update',
        },
      }
    );
    return response.data;
  },

  /**
   * Update User Status SOP (PUT method)
   * PUT /v1/admin/users/{uid}/status
   */
  updateUserStatusSop: async (uid, status, reason) => {
    const response = await client.put(
      `/v1/admin/users/${encodeURIComponent(uid)}/status`,
      { status },
      {
        headers: {
          'X-Audit-Reason': reason || 'Administrative status SOP update',
        },
      }
    );
    return response.data;
  },

  /**
   * Get User Role Profiles
   * GET /v1/admin/users/{uid}/role-profiles
   */
  getRoleProfiles: async (uid) => {
    const response = await client.get(`/v1/admin/users/${encodeURIComponent(uid)}/role-profiles`);
    return response.data;
  },

  /**
   * Manage User Personas (Add / Remove personas)
   * PUT /v1/admin/users/{uid}/personas
   */
  managePersonas: async (uid, { add = [], remove = [], roleProfiles = {} }, reason) => {
    const response = await client.put(
      `/v1/admin/users/${encodeURIComponent(uid)}/personas`,
      { add, remove, roleProfiles },
      {
        headers: {
          'X-Audit-Reason': reason || 'Administrative persona management',
        },
      }
    );
    return response.data;
  },

  /**
   * Get User Farm Map (Polygon & boundary points)
   * GET /v1/admin/users/{uid}/farm-map
   */
  getFarmMap: async (uid) => {
    const response = await client.get(`/v1/admin/users/${encodeURIComponent(uid)}/farm-map`);
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

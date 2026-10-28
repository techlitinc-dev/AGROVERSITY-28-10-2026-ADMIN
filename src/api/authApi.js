import client from './client';

export const authApi = {
  /**
   * Superadmin Login via Phone + MPIN
   * POST /v1/auth/login
   */
  login: async (phone, mpin) => {
    const response = await client.post('/v1/auth/login', {
      phone: phone.trim(),
      mpin: mpin.trim(),
    });
    return response.data;
  },

  /**
   * Admin MPIN Verification (Step-Up security)
   * POST /v1/admin/verify-mpin
   */
  verifyMpin: async (mpin) => {
    const response = await client.post('/v1/admin/verify-mpin', {
      mpin: mpin.trim(),
    });
    return response.data;
  },
};

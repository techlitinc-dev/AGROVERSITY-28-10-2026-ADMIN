import client from './client';

export const overviewApi = {
  /**
   * Get Admin Overview / Dashboard KPIs
   * GET /v1/admin/overview
   */
  getOverview: async () => {
    const response = await client.get('/v1/admin/overview');
    return response.data;
  },
};

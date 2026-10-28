import client from './client';

export const kycApi = {
  /**
   * Get Live KYC Queue
   * GET /v1/admin/kyc/queue
   */
  getQueue: async () => {
    const response = await client.get('/v1/admin/kyc/queue');
    return response.data;
  },

  /**
   * List Pending KYC Documents
   * GET /v1/admin/kyc/pending
   */
  getPending: async () => {
    const response = await client.get('/v1/admin/kyc/pending');
    return response.data;
  },

  /**
   * List Historical KYC Decisions
   * GET /v1/admin/kyc/history
   */
  getHistory: async () => {
    const response = await client.get('/v1/admin/kyc/history');
    return response.data;
  },

  /**
   * Review a KYC Document
   * POST /v1/admin/kyc/{doc_id}/review
   */
  reviewDocument: async (docId, { status, rejectionReason = null, auditNotes = null }, reason) => {
    const response = await client.post(
      `/v1/admin/kyc/${encodeURIComponent(docId)}/review`,
      { status, rejectionReason, auditNotes },
      {
        headers: {
          'X-Audit-Reason': reason || auditNotes || 'Reviewing KYC document',
        },
      }
    );
    return response.data;
  },

  /**
   * Verify / Approve KYC Document
   * POST /v1/admin/kyc/{doc_id}/verify
   */
  verifyDocument: async (docId, reason) => {
    const response = await client.post(
      `/v1/admin/kyc/${encodeURIComponent(docId)}/verify`,
      {},
      {
        headers: {
          'X-Audit-Reason': reason || 'KYC Document verification approved',
        },
      }
    );
    return response.data;
  },

  /**
   * Reject KYC Document with mandatory reason
   * POST /v1/admin/kyc/{doc_id}/reject
   */
  rejectDocument: async (docId, rejectionReason) => {
    const response = await client.post(
      `/v1/admin/kyc/${encodeURIComponent(docId)}/reject`,
      { rejectionReason },
      {
        headers: {
          'X-Audit-Reason': rejectionReason,
        },
      }
    );
    return response.data;
  },

  /**
   * Request Additional KYC Documents from User
   * POST /v1/admin/kyc/{doc_id}/request-more
   */
  requestMoreDocuments: async (docId, note) => {
    const response = await client.post(
      `/v1/admin/kyc/${encodeURIComponent(docId)}/request-more`,
      { note },
      {
        headers: {
          'X-Audit-Reason': note,
        },
      }
    );
    return response.data;
  },
};

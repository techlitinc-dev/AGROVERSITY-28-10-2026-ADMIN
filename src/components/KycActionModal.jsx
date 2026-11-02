import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, FileQuestion, X, Loader2 } from 'lucide-react';
import { kycApi } from '../api/kycApi';

export const KycActionModal = ({ isOpen, doc, actionType, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !doc) return null;

  const isVerify = actionType === 'verify';
  const isReject = actionType === 'reject';
  const isRequestMore = actionType === 'request-more';

  const title = isVerify
    ? 'Verify KYC Document'
    : isReject
    ? 'Reject KYC Document'
    : 'Request Additional Documents';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((isReject || isRequestMore) && (!reason || reason.trim().length < 3)) {
      setError('Please provide a mandatory reason / notes (minimum 3 characters).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isVerify) {
        await kycApi.verifyDocument(doc.id || doc.docId || doc._id, reason || 'Document verified by compliance officer');
      } else if (isReject) {
        await kycApi.rejectDocument(doc.id || doc.docId || doc._id, reason);
      } else if (isRequestMore) {
        await kycApi.requestMoreDocuments(doc.id || doc.docId || doc._id, reason);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-750 rounded-xl max-w-lg w-full p-6 shadow-2xl relative border-slate-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start space-x-3 mb-5">
          <div className={`p-3 rounded-lg ${
            isVerify ? 'bg-emerald-500/10 text-emerald-400' :
            isReject ? 'bg-red-500/10 text-red-400' :
            'bg-amber-500/10 text-amber-400'
          }`}>
            {isVerify && <ShieldCheck className="w-6 h-6" />}
            {isReject && <ShieldAlert className="w-6 h-6" />}
            {isRequestMore && <FileQuestion className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Document: <code className="text-slate-300 font-mono">{doc.id || doc.docId || '—'}</code> {doc.documentType ? `— ${doc.documentType}` : ''}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              {isVerify ? 'Audit Note (Optional)' : 'Reason / Clarification Notes'}
              {(isReject || isRequestMore) && <span className="text-red-400"> *</span>}
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder={
                isVerify
                  ? 'e.g. Identity and land ownership cross-checked against Maharashtra Mahabhulekh'
                  : isReject
                  ? 'e.g. Blurred document image; name does not match bank passbook record'
                  : 'e.g. Please re-upload page 2 of 7/12 extract showing survey mutation entry'
              }
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              autoFocus
            />
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 text-sm font-medium text-white rounded-lg flex items-center space-x-2 transition-colors ${
                isVerify
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : isReject
                  ? 'bg-red-600 hover:bg-red-500'
                  : 'bg-amber-600 hover:bg-amber-500'
              }`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isVerify ? 'Verify & Approve' : isReject ? 'Confirm Rejection' : 'Send Clarification Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

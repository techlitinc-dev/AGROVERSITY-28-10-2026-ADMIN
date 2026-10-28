import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, CheckCircle2, XCircle, AlertCircle, RefreshCw, 
  Loader2, Eye, ShieldAlert, FileText, Clock, HelpCircle, User 
} from 'lucide-react';
import { kycApi } from '../api/kycApi';
import { KycActionModal } from '../components/KycActionModal';

export const KycPage = () => {
  const [tab, setTab] = useState('queue'); // queue | pending | history
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected document modal state
  const [activeDoc, setActiveDoc] = useState(null);
  const [actionType, setActionType] = useState('verify'); // verify | reject | request-more

  const fetchKycData = async () => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (tab === 'queue') {
        res = await kycApi.getQueue();
      } else if (tab === 'pending') {
        res = await kycApi.getPending();
      } else {
        res = await kycApi.getHistory();
      }
      setItems(res?.data || (Array.isArray(res) ? res : []));
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to fetch KYC records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycData();
  }, [tab]);

  const handleOpenAction = (doc, type) => {
    setActiveDoc(doc);
    setActionType(type);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">KYC Verification & Document Vault</h2>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
              /v1/admin/kyc/*
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Verification workflows for 7/12 Land Extracts, Aadhaar, APMC Mandi Licenses, and Transporter RC.
          </p>
        </div>

        <button
          onClick={fetchKycData}
          disabled={loading}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-2 transition-colors disabled:opacity-50 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-sm">
        <button
          onClick={() => setTab('queue')}
          className={`pb-3 font-semibold transition-colors border-b-2 flex items-center space-x-2 ${
            tab === 'queue'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Active Review Queue</span>
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-300">
            /queue
          </span>
        </button>

        <button
          onClick={() => setTab('pending')}
          className={`pb-3 font-semibold transition-colors border-b-2 flex items-center space-x-2 ${
            tab === 'pending'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Pending Submissions</span>
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-300">
            /pending
          </span>
        </button>

        <button
          onClick={() => setTab('history')}
          className={`pb-3 font-semibold transition-colors border-b-2 flex items-center space-x-2 ${
            tab === 'history'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Decision History</span>
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-300">
            /history
          </span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KYC Table Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Document ID</th>
                <th className="py-3 px-4">Applicant UID</th>
                <th className="py-3 px-4">Document Type</th>
                <th className="py-3 px-4">Submission Date</th>
                <th className="py-3 px-4">Review Status</th>
                <th className="py-3 px-4 text-right">Adjudication Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    Querying KYC Firestore queue on 65.20.92.22:8000...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <span>No KYC documents currently waiting in this queue.</span>
                  </td>
                </tr>
              ) : (
                items.map((doc, idx) => {
                  const id = doc.id || doc.docId || `KYC-DOC-${idx}`;
                  return (
                    <tr key={id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-white">
                        {id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5 text-slate-300">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-mono">{doc.uid || doc.userId || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 capitalize font-medium">
                        {doc.documentType || doc.type || 'Identity / Land Record'}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {doc.submittedAt ? new Date(doc.submittedAt).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          doc.status === 'verified'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : doc.status === 'rejected'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {doc.status || 'pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenAction(doc, 'verify')}
                            className="px-2.5 py-1 rounded bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 text-xs flex items-center space-x-1 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verify</span>
                          </button>
                          <button
                            onClick={() => handleOpenAction(doc, 'reject')}
                            className="px-2.5 py-1 rounded bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-500/30 text-xs flex items-center space-x-1 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                          <button
                            onClick={() => handleOpenAction(doc, 'request-more')}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center space-x-1 transition-colors"
                            title="Request More Documents"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC Adjudication Modal */}
      <KycActionModal
        isOpen={!!activeDoc}
        doc={activeDoc}
        actionType={actionType}
        onClose={() => setActiveDoc(null)}
        onSuccess={fetchKycData}
      />
    </div>
  );
};

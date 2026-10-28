import React, { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export const AuditReasonModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm Action', danger = false }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason || reason.trim().length < 3) {
      setError('Audit justification must be at least 3 characters (backend requirement).');
      return;
    }
    setError('');
    onConfirm(reason.trim());
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-750 rounded-xl max-w-md w-full p-6 shadow-2xl relative border-slate-700">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start space-x-3 mb-4">
          <div className={`p-2.5 rounded-lg ${danger ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title || 'Confirm Administrative Action'}</h3>
            <p className="text-sm text-slate-400 mt-0.5">{message}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Mandatory Audit Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="e.g. Compliance verification approved after identity cross-check"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              autoFocus
            />
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
            <p className="text-[11px] text-slate-500 mt-1">
              Transmitted as header <code className="text-slate-400 font-mono">X-Audit-Reason</code> into the immutable audit trail.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                danger
                  ? 'bg-red-600 hover:bg-red-500 focus:ring-2 focus:ring-red-500'
                  : 'bg-emerald-600 hover:bg-emerald-500 focus:ring-2 focus:ring-emerald-500'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

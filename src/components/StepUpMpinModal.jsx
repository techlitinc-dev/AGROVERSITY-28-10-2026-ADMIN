import React, { useState } from 'react';
import { KeyRound, X, Loader2, CheckCircle2 } from 'lucide-react';
import { authApi } from '../api/authApi';

export const StepUpMpinModal = ({ isOpen, title, message, onVerified, onCancel }) => {
  const [mpin, setMpin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!mpin || mpin.length < 4) {
      setError('Please enter your 4-digit admin MPIN');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await authApi.verifyMpin(mpin);
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setMpin('');
          onVerified();
        }, 500);
      } else {
        setError('Incorrect MPIN. Authorization denied.');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Verification failed. Invalid MPIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-6 shadow-2xl relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-400 mb-3 border border-amber-500/20">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white">{title || 'Admin MPIN Step-Up'}</h3>
          <p className="text-xs text-slate-400 mt-1">
            {message || 'Elevated privileges required. Enter your admin MPIN to proceed.'}
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <input
              type="password"
              maxLength={6}
              className="w-full text-center tracking-[0.5em] text-2xl font-mono px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="••••"
              value={mpin}
              onChange={(e) => {
                setMpin(e.target.value.replace(/\D/g, ''));
                if (error) setError('');
              }}
              autoFocus
            />
            {error && <p className="text-xs text-red-400 text-center mt-2">{error}</p>}
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors flex items-center justify-center space-x-1.5"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Verified</span>
                </>
              ) : (
                <span>Authorize</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

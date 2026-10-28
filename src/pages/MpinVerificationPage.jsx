import React, { useState } from 'react';
import { 
  Lock, KeyRound, ShieldCheck, ShieldAlert, CheckCircle2, 
  Loader2, RefreshCw, Terminal, AlertCircle 
} from 'lucide-react';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

export const MpinVerificationPage = () => {
  const [mpin, setMpin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const { user, adminRole } = useAuth();

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!mpin || mpin.length < 4) {
      setError('Please input a valid 4-digit numeric MPIN.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await authApi.verifyMpin(mpin);
      setResult({
        success: data.ok === true,
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'MPIN Verification Rejected');
      setResult({
        success: false,
        error: err.response?.data || err.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Admin MPIN Step-Up Verification</h2>
          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
            POST /v1/admin/verify-mpin
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Zero-trust elevated authorization checkpoint. Validates operator cryptographic MPIN hash against backend user document.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Card */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Operator Authorization</h3>
              <p className="text-xs text-slate-400">Caller: {user?.phone || '+919000000001'} ({adminRole})</p>
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Enter 4-Digit Security MPIN
              </label>
              <input
                type="password"
                maxLength={6}
                value={mpin}
                onChange={(e) => {
                  setMpin(e.target.value.replace(/\D/g, ''));
                  if (error) setError('');
                }}
                placeholder="••••"
                className="w-full text-center tracking-[0.5em] text-2xl font-mono px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                autoFocus
              />
              <p className="text-[11px] text-slate-500 mt-1.5 text-center">
                Default Superadmin MPIN seeded: <code className="text-slate-300 font-mono">1234</code>
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-amber-900/20 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Execute MPIN Verification</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Response Inspector */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live API Telemetry</h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500">HTTP Status</span>
            </div>

            <div className="mt-4">
              {result ? (
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg border flex items-center space-x-2.5 ${
                    result.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    {result.success ? (
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold text-xs block">
                        {result.success ? 'MPIN Verification Accepted (200 OK)' : 'Verification Denied (401/403)'}
                      </span>
                      <span className="text-[10px] opacity-80 font-mono block">
                        {result.timestamp}
                      </span>
                    </div>
                  </div>

                  <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto max-h-40 border border-slate-800">
                    {JSON.stringify(result.data || result.error, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                  <Lock className="w-8 h-8 opacity-25 mb-2" />
                  <span>Submit MPIN above to test real-time endpoint validation.</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Protected endpoint verifies hashed MPIN bcrypt signature.
          </div>
        </div>
      </div>
    </div>
  );
};

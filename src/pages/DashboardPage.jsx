import React, { useState, useEffect } from 'react';
import { 
  Users, ShoppingBag, ShieldCheck, Tractor, Layers, 
  RefreshCw, CheckCircle2, AlertTriangle, Clock, Code,
  FileText, Activity
} from 'lucide-react';
import { overviewApi } from '../api/overviewApi';

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRaw, setShowRaw] = useState(false);

  const fetchOverview = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await overviewApi.getOverview();
      setData(res);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to fetch overview data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const personaBreakdown = data?.personaBreakdown || {};
  const personaEntries = Object.entries(personaBreakdown);

  return (
    <div className="space-y-6">
      {/* Top Banner & Telemetry Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Dashboard Overview</h1>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
              GET /v1/admin/overview
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time platform telemetry fetched directly from live backend services.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750 flex items-center space-x-1.5 transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showRaw ? 'Hide Live Payload' : 'Inspect Live Payload'}</span>
          </button>

          <button
            onClick={fetchOverview}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-2 transition-colors disabled:opacity-50 shadow-md shadow-emerald-950"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Fetching...' : 'Refresh Telemetry'}</span>
          </button>
        </div>
      </div>

      {/* Error Alert with Retry */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Backend Telemetry Error</p>
              <p className="text-slate-400 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchOverview}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Live Raw JSON Payload Drawer */}
      {showRaw && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Raw Live Response from http://65.20.92.22:8000/v1/admin/overview</span>
            </span>
            <span>{data?.timestamp || 'N/A'}</span>
          </div>
          <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto max-h-64 border border-slate-850">
            {data ? JSON.stringify(data, null, 2) : 'No data loaded.'}
          </pre>
        </div>
      )}

      {/* Primary KPI Metrics — Only Real Data from Backend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Users */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Total Active Users</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono">
              {loading ? (
                <span className="text-slate-500 text-xl font-normal">Loading...</span>
              ) : (
                data?.activeUsersTotal ?? 'N/A'
              )}
            </span>
            <span className="text-[11px] text-blue-400 font-mono font-medium">activeUsersTotal</span>
          </div>
        </div>

        {/* Card 2: Active Farmland Leases */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Active Farmland Leases</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Tractor className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono">
              {loading ? (
                <span className="text-slate-500 text-xl font-normal">Loading...</span>
              ) : (
                data?.activeFarmlandLeases ?? 'N/A'
              )}
            </span>
            <span className="text-[11px] text-purple-400 font-mono font-medium">activeFarmlandLeases</span>
          </div>
        </div>

        {/* Card 3: Pending KYC */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Pending KYC Queue</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">
              {loading ? (
                <span className="text-slate-500 text-xl font-normal">Loading...</span>
              ) : (
                data?.pendingKycCount ?? 'N/A'
              )}
            </span>
            <span className="text-[11px] text-amber-400 font-mono font-medium">pendingKycCount</span>
          </div>
        </div>

        {/* Card 4: Marketplace GMV */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Marketplace GMV</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono">
              {loading ? (
                <span className="text-slate-500 text-xl font-normal">Loading...</span>
              ) : data?.marketplaceGMV !== undefined ? (
                `₹${data.marketplaceGMV.toLocaleString()}`
              ) : (
                'N/A'
              )}
            </span>
            <span className="text-[11px] text-emerald-400 font-mono font-medium">marketplaceGMV</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics: Live Persona Breakdown & Live Operational Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Persona Breakdown Widget */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-lg space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Persona Ecosystem Distribution
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic counts from <code className="text-slate-300 font-mono">data.personaBreakdown</code>
              </p>
            </div>
            <Layers className="w-5 h-5 text-slate-500" />
          </div>

          <div className="space-y-3.5">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500 font-mono">
                Loading persona counts from API...
              </div>
            ) : personaEntries.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 font-mono">
                No persona records returned in payload.
              </div>
            ) : (
              personaEntries.map(([persona, count]) => {
                const total = data?.activeUsersTotal || 1;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={persona} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-300 capitalize">{persona}</span>
                      <span className="font-mono text-emerald-400">
                        {count} account{count === 1 ? '' : 's'} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, count > 0 ? 5 : 0)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live Operational Status & Telemetry Sync */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-lg space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Backend Telemetry
              </h2>
              <Activity className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Reported status directly from API payload</p>

            {/* Platform Health Status from API */}
            <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <div>
                <span className="font-bold text-sm block">
                  {loading ? 'Checking...' : data?.platformHealth ?? 'Status Unavailable'}
                </span>
                <span className="text-[11px] text-emerald-300/80 block mt-0.5 font-mono">
                  platformHealth
                </span>
              </div>
            </div>

            {/* Secondary live telemetry metrics */}
            <div className="mt-4 space-y-2 text-xs text-slate-400">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span>Pending Claims:</span>
                <span className="font-mono font-semibold text-white">
                  {loading ? '...' : (data?.pendingClaimsCount ?? 'N/A')}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span>Pending Settlements:</span>
                <span className="font-mono font-semibold text-white">
                  {loading ? '...' : data?.pendingSettlementsAmount !== undefined ? `₹${data.pendingSettlementsAmount.toLocaleString()}` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span>Timestamp:</span>
                <span className="font-mono text-slate-300 text-[11px]">
                  {loading ? '...' : data?.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-750 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Telemetry Source</span>
            </span>
            <span className="text-emerald-400 font-mono">65.20.92.22:8000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

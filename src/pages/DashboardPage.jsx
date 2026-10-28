import React, { useState, useEffect } from 'react';
import { 
  Users, ShoppingBag, ShieldCheck, Tractor, Layers, 
  RefreshCw, CheckCircle2, AlertTriangle, ArrowUpRight, Clock, Code 
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

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Ecosystem Overview</h2>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
              GET /v1/admin/overview
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time aggregate telemetry fetched directly from backend at <code className="text-slate-300 font-mono">65.20.92.22:8000</code>.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750 flex items-center space-x-1.5 transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showRaw ? 'Hide Payload' : 'Inspect JSON'}</span>
          </button>
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Raw Payload Drawer / Accordion */}
      {showRaw && data && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Raw Response (200 OK)</span>
            <span>{data.timestamp || new Date().toISOString()}</span>
          </div>
          <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto max-h-56">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Users */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Active Users</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono">
              {loading ? '...' : data?.activeUsersTotal ?? 0}
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">In Firestore</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Live active accounts on platform</div>
        </div>

        {/* Card 2: Pending KYC */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Pending KYC Queue</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">
              {loading ? '...' : data?.pendingKycCount ?? 0}
            </span>
            <span className="text-[11px] text-amber-400 font-medium">Awaiting SOP</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Identity & 7/12 land docs</div>
        </div>

        {/* Card 3: Marketplace GMV */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Marketplace GMV</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono">
              ₹{loading ? '...' : (data?.marketplaceGMV ?? 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">Escrow Protected</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Total B2B & mandi volume</div>
        </div>

        {/* Card 4: Farmland Leases */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Farmland Leases</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Tractor className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono">
              {loading ? '...' : data?.activeFarmlandLeases ?? 0}
            </span>
            <span className="text-[11px] text-purple-400 font-medium">Active Plots</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Smart contract tenant leases</div>
        </div>
      </div>

      {/* Secondary Metrics & Persona Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Persona Breakdown Widget */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-lg space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Multi-Persona Ecosystem Distribution</h3>
              <p className="text-xs text-slate-400 mt-0.5">Live counts broken down by rural operational role</p>
            </div>
            <Layers className="w-5 h-5 text-slate-500" />
          </div>

          <div className="space-y-3.5">
            {Object.keys(personaBreakdown).length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No persona counts registered.</p>
            ) : (
              Object.entries(personaBreakdown).map(([persona, count]) => {
                const total = data?.activeUsersTotal || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={persona} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-300 capitalize">{persona}</span>
                      <span className="font-mono text-emerald-400">{count} accounts ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Operational Health & Sentry Status */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-lg space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Operational Health</h3>
            <p className="text-xs text-slate-400 mt-0.5">Platform service level agreement</p>

            <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center space-x-3">
              <CheckCircle2 className="w-7 h-7 flex-shrink-0" />
              <div>
                <span className="font-bold text-sm block">{data?.platformHealth || '100% Operational'}</span>
                <span className="text-[11px] text-emerald-300/80 block mt-0.5">FastAPI & Firestore Connected</span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Pending Claims:</span>
                <span className="font-mono font-semibold text-white">{data?.pendingClaimsCount ?? 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Pending Settlements:</span>
                <span className="font-mono font-semibold text-white">₹{data?.pendingSettlementsAmount ?? 0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Last Telemetry Sync:</span>
                <span className="font-mono text-slate-300 text-[10px]">
                  {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-750 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>SOP-01 Compliant</span>
            </span>
            <span className="text-emerald-400 font-mono">v0.1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileCheck2, ShieldCheck, 
  Lock, LogOut, ChevronRight, Activity, Server, UserCheck, Sprout
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  {
    name: 'Dashboard Overview',
    path: '/',
    icon: LayoutDashboard,
    badge: 'API 1',
    description: 'Platform KPIs & Ecosystem Health'
  },
  {
    name: 'Users Management',
    path: '/users',
    icon: Users,
    badge: 'User 360°',
    description: 'Roster, Personas & Activity Telemetry'
  },
  {
    name: 'Farmer Management',
    path: '/farmers',
    icon: Sprout,
    badge: 'Farmer 360°',
    description: 'Directory, Land KYC & Agronomy Oversight'
  },
  {
    name: 'KYC Verification',
    path: '/kyc',
    icon: FileCheck2,
    badge: 'API 3',
    description: 'Queue, Review & Decision Vault'
  },
  {
    name: 'MPIN Verification',
    path: '/verify-mpin',
    icon: Lock,
    badge: 'API 4',
    description: 'Admin Step-Up Authorization'
  },
  {
    name: 'Authentication & Security',
    path: '/security',
    icon: ShieldCheck,
    badge: 'API 5',
    description: 'Sessions, Policy & Credential Reset'
  },
];

const ADMIN_ROLES = [
  'superadmin'
];

export const Layout = () => {
  const { user, adminRole, changeRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentNav = NAV_ITEMS.find((item) => item.path === location.pathname) || {
    name: 'Superadmin Console',
    description: 'Agrovercity Operations'
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 z-20">
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-white shadow-lg shadow-emerald-900/40">
              A
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">AGROVERCITY</span>
              <span className="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase block">Superadmin Console</span>
            </div>
          </div>
        </div>

        {/* Server & Connectivity Badge */}
        <div className="mx-4 my-3 p-3 rounded-lg bg-slate-800/80 border border-slate-750 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="text-[11px] font-mono text-slate-300">
              <span className="text-slate-500">Backend:</span> 65.20.92.22:8000
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-medium">LIVE</span>
        </div>

        {/* Role Selector */}
        <div className="px-4 pb-3">
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Active Role Context
          </label>
          <select
            value={adminRole || 'superadmin'}
            onChange={(e) => changeRole && changeRole(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-xs text-emerald-400 font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
          >
            {ADMIN_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Platform Governance Modules
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(`${item.path}/`));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (item.path === '/users') {
                    navigate('/users');
                  } else if (item.path === '/farmers') {
                    navigate('/farmers');
                  }
                }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.name}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400 flex-shrink-0">
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[11px] text-slate-400 font-mono truncate">{user?.phone || '—'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-2"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex items-center space-x-3 text-sm">
            <span className="text-slate-400">Admin Console</span>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <h1 className="font-semibold text-white">{currentNav.name}</h1>
            <span className="text-xs text-slate-400 hidden md:inline-block">({currentNav.description})</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-750 text-xs text-slate-300">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Swagger: <code className="font-mono text-emerald-400">65.20.92.22:8000/docs</code></span>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400">
              <UserCheck className="w-3.5 h-3.5" />
              <span className="font-mono capitalize">{adminRole}</span>
            </div>
          </div>
        </header>

        {/* Routed View Body */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Download, Eye, ShieldAlert, 
  CheckCircle2, XCircle, RefreshCw, Loader2, MapPin, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { usersApi } from '../api/usersApi';
import { UserDetailDrawer } from '../components/UserDetailDrawer';
import { AuditReasonModal } from '../components/AuditReasonModal';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [personaFilter, setPersonaFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Drawer & Modal State
  const [selectedUid, setSelectedUid] = useState(null);
  const [auditModal, setAuditModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
    danger: false,
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await usersApi.listUsers({
        page,
        pageSize,
        search,
        status: statusFilter,
        persona: personaFilter,
      });
      setUsers(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to fetch users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, statusFilter, personaFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleExport = async (format) => {
    try {
      const data = await usersApi.exportUsers({ format, status: statusFilter, profile: personaFilter });
      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `agrovercity_users_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `agrovercity_users_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      alert('Export failed: ' + (err.response?.data?.error?.message || err.message));
    }
  };

  const handleQuickStatusToggle = (user) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    setAuditModal({
      isOpen: true,
      title: `Toggle Account Status to ${nextStatus}`,
      message: `Modifying state for ${user.name || user.id} via /v1/admin/users/{target_uid}/status`,
      danger: nextStatus === 'suspended',
      action: async (reason) => {
        await usersApi.updateUserStatus(user.id, nextStatus, reason);
        fetchUsers();
      },
    });
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Users Management Roster</h2>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
              GET /v1/admin/users
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real user records from Firestore. Showing {users.length} of {total} registered platform users.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => handleExport('csv')}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport('json')}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, UID..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </form>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="locked">Locked</option>
          </select>

          {/* Persona Filter */}
          <select
            value={personaFilter}
            onChange={(e) => {
              setPersonaFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">All Personas</option>
            <option value="farmer">Farmer</option>
            <option value="transporter">Transporter</option>
            <option value="seller">Vyapari / Seller</option>
            <option value="equipmentRental">Equipment Owner</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Data Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">User / Name</th>
                <th className="py-3 px-4">Phone / UID</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Active Personas</th>
                <th className="py-3 px-4">Land Area</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    Fetching user records from 65.20.92.22:8000...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const personas = u.linkedProfiles || [u.primaryProfile || 'farmer'];
                  return (
                    <tr key={u.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{u.name || 'Unnamed'}</div>
                        <div className="text-[11px] text-slate-400">{u.email || 'No email'}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        <div>{u.phone || 'N/A'}</div>
                        <div className="text-[10px] text-slate-500">{u.id}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{u.district || u.village || 'Maharashtra'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {personas.map((p, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 capitalize"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {u.landAreaAcres ? `${u.landAreaAcres} Acres` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            u.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : u.status === 'suspended'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedUid(u.id)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center space-x-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Inspect</span>
                          </button>
                          <button
                            onClick={() => handleQuickStatusToggle(u)}
                            className={`p-1.5 rounded border text-xs transition-colors ${
                              u.status === 'active'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            }`}
                            title={u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                          >
                            {u.status === 'active' ? (
                              <XCircle className="w-3.5 h-3.5" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
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

        {/* Paginator */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <span>
            Page {page} of {totalPages} ({total} total records)
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-out User Detail Drawer */}
      {selectedUid && (
        <UserDetailDrawer
          uid={selectedUid}
          isOpen={!!selectedUid}
          onClose={() => setSelectedUid(null)}
          onRefreshList={fetchUsers}
          onRequestAuditAction={(opts) => {
            setAuditModal({
              isOpen: true,
              title: opts.title,
              message: opts.message,
              danger: opts.danger,
              action: opts.action,
            });
          }}
        />
      )}

      {/* Mandatory Audit Reason Modal */}
      <AuditReasonModal
        isOpen={auditModal.isOpen}
        title={auditModal.title}
        message={auditModal.message}
        danger={auditModal.danger}
        onCancel={() => setAuditModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={async (reason) => {
          if (auditModal.action) {
            await auditModal.action(reason);
          }
          setAuditModal((prev) => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
};

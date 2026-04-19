import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CalendarClock,
  Filter,
  Loader2,
  RefreshCw,
  Shield,
  CheckCircle2,
  XCircle,
  Ban,
  Building2,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function statusBadgeClass(status) {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-500/20 text-amber-200 border-amber-500/40';
    case 'APPROVED':
      return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40';
    case 'REJECTED':
      return 'bg-rose-500/20 text-rose-200 border-rose-500/40';
    case 'CANCELLED':
      return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    default:
      return 'bg-slate-700 text-slate-200 border-slate-600';
  }
}

async function parseErr(res) {
  try {
    const data = await res.json();
    if (data?.message) return data.message;
    const v = Object.values(data || {})[0];
    if (typeof v === 'string') return v;
  } catch {
    /* ignore */
  }
  return 'Request failed';
}

/** Module B: GET /api/admin/bookings — all bookings; approve / reject (reason) / cancel. */
export default function AdminBookingsPage() {
  const { user, isAdmin, fetchJson } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [resourceMap, setResourceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionBusyId, setActionBusyId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterResourceId, setFilterResourceId] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [modal, setModal] = useState(null);

  const loadResources = useCallback(async () => {
    try {
      const list = await fetchJson('/api/resources');
      const map = {};
      if (Array.isArray(list)) {
        list.forEach((r) => {
          if (r?.id) map[r.id] = r.name || r.id;
        });
      }
      setResourceMap(map);
    } catch {
      setResourceMap({});
    }
  }, [fetchJson]);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterResourceId) params.set('resourceId', filterResourceId);
      if (filterFrom) {
        const d = new Date(filterFrom);
        if (!Number.isNaN(d.getTime())) params.set('from', d.toISOString());
      }
      if (filterTo) {
        const d = new Date(filterTo);
        if (!Number.isNaN(d.getTime())) params.set('to', d.toISOString());
      }
      const q = params.toString();
      const path = q ? `/api/admin/bookings?${q}` : '/api/admin/bookings';
      const data = await fetchJson(path);
      setBookings(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Could not load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [fetchJson, filterStatus, filterResourceId, filterFrom, filterTo]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    loadResources();
  }, [user, isAdmin, loadResources]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    loadBookings();
  }, [user, isAdmin, loadBookings]);

  const resourceOptions = useMemo(() => Object.entries(resourceMap), [resourceMap]);

  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

  async function runAction(bookingId, kind) {
    setActionBusyId(`${bookingId}-${kind}`);
    setError(null);
    try {
      let url = '';
      let options = { method: 'PATCH', credentials: 'include' };
      if (kind === 'approve') {
        url = `${API_BASE}/api/admin/bookings/${encodeURIComponent(bookingId)}/approve`;
      } else if (kind === 'reject') {
        const reason = modal?.reason?.trim();
        if (!reason) {
          setError('Please provide a reason for rejection.');
          setActionBusyId(null);
          return;
        }
        url = `${API_BASE}/api/admin/bookings/${encodeURIComponent(bookingId)}/reject`;
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify({ reason });
      } else if (kind === 'cancel') {
        url = `${API_BASE}/api/admin/bookings/${encodeURIComponent(bookingId)}/cancel`;
        const r = modal?.reason?.trim();
        options.headers = { 'Content-Type': 'application/json' };
        options.body = r ? JSON.stringify({ reason: r }) : JSON.stringify({});
      }

      const response = await fetch(url, options);
      if (!response.ok) throw new Error(await parseErr(response));
      setModal(null);
      await loadBookings();
    } catch (e) {
      setError(e.message || 'Action failed');
    } finally {
      setActionBusyId(null);
    }
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shrink-0">
            <Shield className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-white">Booking management</h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              All bookings from every user. Approve or reject (reason required for reject). Cancel approved slots if needed.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => loadBookings()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-600 text-slate-200 shrink-0"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
        <div className="flex items-center gap-2 text-slate-300 mb-3">
          <Filter size={18} />
          <span className="font-medium text-sm">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-slate-500">Status</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || 'a'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-slate-500 flex items-center gap-1">
              <Building2 size={12} /> Resource
            </span>
            <select
              value={filterResourceId}
              onChange={(e) => setFilterResourceId(e.target.value)}
              className="bg-slate-950 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm"
            >
              <option value="">All</option>
              {resourceOptions.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-slate-500">From</span>
            <input
              type="datetime-local"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="bg-slate-950 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-slate-500">To</span>
            <input
              type="datetime-local"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="bg-slate-950 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-rose-100 text-sm">{error}</div>
      )}

      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <CalendarClock className="text-indigo-400" size={20} />
        All bookings
      </h2>

      <div className="rounded-xl border border-slate-700 overflow-hidden bg-slate-900/30">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
            <Loader2 className="animate-spin" size={22} />
            Loading…
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            <CalendarClock className="mx-auto mb-2 opacity-50" size={36} />
            No bookings match filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">Requester</th>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Att.</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Admin note</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bookings.map((b) => {
                  const resName = resourceMap[b.resourceId] || b.resourceId || '—';
                  const start = b.startDateTime ? new Date(b.startDateTime) : null;
                  const end = b.endDateTime ? new Date(b.endDateTime) : null;
                  const when =
                    start && end && !Number.isNaN(start.getTime())
                      ? `${start.toLocaleString()} → ${end.toLocaleString()}`
                      : '—';
                  const rowBusy = actionBusyId && actionBusyId.startsWith(`${b.id}-`);
                  return (
                    <tr key={b.id} className="text-slate-200">
                      <td className="px-4 py-3 align-top">{resName}</td>
                      <td className="px-4 py-3 align-top">
                        <div>{b.requesterName || '—'}</div>
                        <div className="text-xs text-slate-500">{b.requesterEmail}</div>
                      </td>
                      <td className="px-4 py-3 align-top text-xs max-w-[200px]">{when}</td>
                      <td className="px-4 py-3 align-top max-w-[200px]">{b.purpose}</td>
                      <td className="px-4 py-3 align-top">{b.expectedAttendees ?? '—'}</td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${statusBadgeClass(b.status)}`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-slate-400 max-w-[160px]">
                        {b.adminDecisionReason || '—'}
                      </td>
                      <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                        {b.status === 'PENDING' && (
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              disabled={rowBusy}
                              onClick={() => runAction(b.id, 'approve')}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 text-xs disabled:opacity-50"
                            >
                              <CheckCircle2 size={14} /> Approve
                            </button>
                            <button
                              type="button"
                              disabled={rowBusy}
                              onClick={() => setModal({ type: 'reject', bookingId: b.id, reason: '' })}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-600/30 text-rose-200 border border-rose-500/40 text-xs disabled:opacity-50"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        )}
                        {b.status === 'APPROVED' && (
                          <button
                            type="button"
                            disabled={rowBusy}
                            onClick={() => setModal({ type: 'cancel', bookingId: b.id, reason: '' })}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-600/40 text-slate-200 border border-slate-500/40 text-xs disabled:opacity-50"
                          >
                            <Ban size={14} /> Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-600 rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-2">
              {modal.type === 'reject' ? 'Reject booking' : 'Cancel booking'}
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              {modal.type === 'reject'
                ? 'A reason is required.'
                : 'Optional note when cancelling an approved booking.'}
            </p>
            <textarea
              value={modal.reason}
              onChange={(e) => setModal({ ...modal, reason: e.target.value })}
              placeholder={modal.type === 'reject' ? 'Reason…' : 'Optional note…'}
              rows={4}
              className="w-full bg-slate-950 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm mb-4"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800">
                Close
              </button>
              <button
                type="button"
                onClick={() => runAction(modal.bookingId, modal.type === 'reject' ? 'reject' : 'cancel')}
                className={`px-4 py-2 rounded-lg text-white ${modal.type === 'reject' ? 'bg-rose-600' : 'bg-slate-600'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

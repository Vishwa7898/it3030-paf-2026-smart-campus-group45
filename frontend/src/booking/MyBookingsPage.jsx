import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CalendarClock, Filter, Loader2, RefreshCw, Plus } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function badge(status) {
  const m = {
    PENDING: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
    APPROVED: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40',
    REJECTED: 'bg-rose-500/20 text-rose-200 border-rose-500/40',
    CANCELLED: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  };
  return m[status] || 'bg-slate-700 text-slate-200 border-slate-600';
}

/** Module B: current user’s bookings (GET /api/bookings/mine). */
export default function MyBookingsPage() {
  const { fetchJson } = useAuth();
  const [rows, setRows] = useState([]);
  const [resources, setResources] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  const loadResources = useCallback(async () => {
    try {
      const list = await fetchJson('/api/resources');
      const map = {};
      if (Array.isArray(list)) {
        list.forEach((r) => {
          if (r?.id) map[r.id] = r.name || r.id;
        });
      }
      setResources(map);
    } catch {
      setResources({});
    }
  }, [fetchJson]);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchJson('/api/bookings/mine');
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || 'Failed to load bookings');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [fetchJson]);

  useEffect(() => {
    loadResources();
    load();
  }, [loadResources, load]);

  const filtered = useMemo(() => {
    if (!filterStatus) return rows;
    return rows.filter((b) => b.status === filterStatus);
  }, [rows, filterStatus]);

  return (
    <div className="fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My bookings</h1>
          <p className="text-slate-400 text-sm mt-1">
            Requests you submitted (PENDING → APPROVED/REJECTED; APPROVED may be CANCELLED by admin).
          </p>
        </div>
        <Link
          to="/bookings/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500"
        >
          <Plus size={18} /> New booking
        </Link>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-slate-300">
          <Filter size={18} />
          <span className="text-sm font-medium">Filter</span>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-950 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value || 'x'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => load()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {err && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-rose-100 text-sm">{err}</div>
      )}

      <div className="rounded-xl border border-slate-700 overflow-hidden bg-slate-900/30">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
            <Loader2 className="animate-spin" size={22} />
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm px-4">
            <CalendarClock className="mx-auto mb-2 opacity-50" size={36} />
            {rows.length === 0 ? 'No booking requests yet.' : 'No rows for this filter.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Attendees</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((b) => {
                  const name = resources[b.resourceId] || b.resourceId;
                  const s = b.startDateTime ? new Date(b.startDateTime) : null;
                  const e = b.endDateTime ? new Date(b.endDateTime) : null;
                  const when =
                    s && e && !Number.isNaN(s.getTime())
                      ? `${s.toLocaleString()} → ${e.toLocaleString()}`
                      : '—';
                  return (
                    <tr key={b.id} className="text-slate-200">
                      <td className="px-4 py-3">{name}</td>
                      <td className="px-4 py-3 text-xs max-w-[200px]">{when}</td>
                      <td className="px-4 py-3 max-w-xs">{b.purpose}</td>
                      <td className="px-4 py-3">{b.expectedAttendees ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs border ${badge(b.status)}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 max-w-[180px]">{b.adminDecisionReason || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

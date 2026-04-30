import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarCheck,
  Filter,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Ban,
  User,
  MapPin,
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { facilityService } from '../../services/facilityService';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function formatRange(startIso, endIso) {
  try {
    const s = new Date(startIso);
    const e = new Date(endIso);
    return `${s.toLocaleString()} → ${e.toLocaleString()}`;
  } catch {
    return `${startIso} — ${endIso}`;
  }
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [resourceNames, setResourceNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [resourceIdFilter, setResourceIdFilter] = useState('');
  const [actionId, setActionId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState(null);

  const loadResourceNames = useCallback(async () => {
    try {
      const list = await facilityService.getAll({});
      const map = {};
      (Array.isArray(list) ? list : []).forEach((r) => {
        if (r?.id) map[r.id] = r.name || r.id;
      });
      setResourceNames(map);
    } catch {
      setResourceNames({});
    }
  }, []);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (resourceIdFilter.trim()) params.resourceId = resourceIdFilter.trim();
      const data = await bookingService.listAllForAdmin(params);
      setBookings(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, resourceIdFilter]);

  useEffect(() => {
    loadResourceNames();
  }, [loadResourceNames]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    if (!rejectTarget) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setRejectTarget(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rejectTarget]);

  const resourceLabel = useMemo(
    () => (id) => resourceNames[id] || id || '—',
    [resourceNames]
  );

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this booking request?')) return;
    setActionId(id);
    try {
      await bookingService.review(id, { status: 'APPROVED', reason: null });
      await loadBookings();
    } catch (e) {
      alert(e?.message || 'Approve failed');
    } finally {
      setActionId(null);
    }
  };

  const openReject = (booking) => {
    setRejectTarget(booking);
    setRejectReason('');
    setRejectError(null);
  };

  const submitReject = async () => {
    if (!rejectTarget?.id) return;
    const reason = rejectReason.trim();
    if (!reason) {
      setRejectError('A reason is required when rejecting.');
      return;
    }
    setActionId(rejectTarget.id);
    setRejectError(null);
    try {
      await bookingService.review(rejectTarget.id, { status: 'REJECTED', reason });
      setRejectTarget(null);
      await loadBookings();
    } catch (e) {
      setRejectError(e?.message || 'Reject failed');
    } finally {
      setActionId(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking? It will move to CANCELLED.')) return;
    setActionId(id);
    try {
      await bookingService.cancel(id);
      await loadBookings();
    } catch (e) {
      alert(e?.message || 'Cancel failed');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <CalendarCheck className="text-indigo-400 shrink-0" size={32} />
            Booking management
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl">
            Review pending requests, approve or reject with a reason, and cancel approved bookings when needed.
            Overlapping slots are blocked by the server.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadBookings()}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-600 text-slate-200 text-sm font-bold hover:bg-slate-800 shrink-0"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end bg-slate-800/40 border border-slate-700/50 p-4 rounded-3xl backdrop-blur-xl">
        <div className="flex items-center gap-2 text-indigo-400 shrink-0">
          <Filter size={20} />
          <span className="text-xs font-black uppercase tracking-widest">Filters</span>
        </div>
        <div className="flex-1 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 px-4 py-3 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Resource ID
            </label>
            <input
              type="text"
              value={resourceIdFilter}
              onChange={(e) => setResourceIdFilter(e.target.value)}
              placeholder="Filter by Mongo resource id…"
              className="w-full bg-slate-900/50 border border-slate-700/50 px-4 py-3 rounded-2xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>
      </div>

      {loading && !bookings.length ? (
        <div className="flex items-center justify-center h-64 text-indigo-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 min-w-[900px]">
              <thead className="bg-slate-900/50 text-xs uppercase font-black tracking-widest text-slate-500 border-b border-slate-700/50">
                <tr>
                  <th className="px-4 py-4">Resource</th>
                  <th className="px-4 py-4">Requester</th>
                  <th className="px-4 py-4">Schedule</th>
                  <th className="px-4 py-4">Purpose</th>
                  <th className="px-4 py-4">Attendees</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-500 font-medium">
                      No bookings match the current filters.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-white">{resourceLabel(b.resourceId)}</p>
                            <p className="text-[10px] font-mono text-slate-500 mt-0.5 break-all">{b.resourceId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-start gap-2">
                          <User size={16} className="text-slate-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-slate-200">{b.requesterName || '—'}</p>
                            <p className="text-xs text-slate-500 break-all">{b.requesterEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-xs text-slate-400 max-w-[220px]">
                        {formatRange(b.startDateTime, b.endDateTime)}
                      </td>
                      <td className="px-4 py-4 align-top text-xs text-slate-400 max-w-xs line-clamp-3">
                        {b.purpose}
                      </td>
                      <td className="px-4 py-4 align-top font-mono text-slate-300">{b.expectedAttendees}</td>
                      <td className="px-4 py-4 align-top">
                        <span
                          className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${
                            b.status === 'APPROVED'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : b.status === 'PENDING'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : b.status === 'REJECTED'
                                  ? 'bg-red-500/15 text-red-300 border-red-500/30'
                                  : 'bg-slate-600/30 text-slate-400 border-slate-600'
                          }`}
                        >
                          {b.status}
                        </span>
                        {b.reviewReason && (
                          <p className="text-[11px] text-slate-500 mt-2 italic line-clamp-2">{b.reviewReason}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 align-top text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          {b.status === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                disabled={actionId === b.id}
                                onClick={() => handleApprove(b.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50"
                              >
                                <CheckCircle2 size={14} />
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={actionId === b.id}
                                onClick={() => openReject(b)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold disabled:opacity-50"
                              >
                                <XCircle size={14} />
                                Reject
                              </button>
                            </>
                          )}
                          {b.status === 'APPROVED' && (
                            <button
                              type="button"
                              disabled={actionId === b.id}
                              onClick={() => handleCancel(b.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-600 text-slate-200 text-xs font-bold hover:bg-slate-800 disabled:opacity-50"
                            >
                              <Ban size={14} />
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {rejectTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setRejectTarget(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-labelledby="reject-title"
            className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="reject-title" className="text-lg font-black text-white mb-1">
              Reject booking
            </h2>
            <p className="text-xs text-slate-500 mb-4 font-mono break-all">{rejectTarget.id}</p>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Reason (required)
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Explain why this request cannot be approved…"
              className="w-full bg-slate-800 border border-slate-600 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none mb-2"
            />
            {rejectError && <p className="text-sm text-red-400 mb-4">{rejectError}</p>}
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                disabled={actionId === rejectTarget.id}
                onClick={submitReject}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white disabled:opacity-50"
              >
                Submit rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, RefreshCw, Trash2 } from 'lucide-react';
import { bookingService } from '../../services/bookingService';

function formatRange(startIso, endIso) {
  try {
    const s = new Date(startIso);
    const e = new Date(endIso);
    return `${s.toLocaleString()} → ${e.toLocaleString()}`;
  } catch {
    return `${startIso} → ${endIso}`;
  }
}

export default function MyBookingsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getMine();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Failed to load bookings');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setActionId(id);
    try {
      await bookingService.cancel(id);
      await load();
    } catch (e) {
      alert(e?.message || 'Could not cancel');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">My bookings</h1>
          <p className="text-slate-400 mt-1 text-sm">Pending, approved, and past requests for campus resources.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => load()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-600 text-slate-200 text-sm font-bold hover:bg-slate-800"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <Link
            to="/facilities"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500"
          >
            <MapPin size={16} />
            Book a resource
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 rounded-3xl border border-dashed border-slate-700 text-slate-500">
          <Calendar className="mx-auto mb-4 opacity-40" size={40} />
          <p className="font-medium">No bookings yet.</p>
          <Link to="/facilities" className="inline-block mt-4 text-indigo-400 font-bold hover:text-indigo-300">
            Browse facilities
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((b) => (
            <li
              key={b.id}
              className="rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${
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
                  <span className="text-xs text-slate-500 font-mono">Resource: {b.resourceId}</span>
                </div>
                <p className="text-slate-200 text-sm font-medium line-clamp-2">{b.purpose}</p>
                <p className="text-slate-500 text-xs mt-2">{formatRange(b.startDateTime, b.endDateTime)}</p>
                <p className="text-slate-500 text-xs">Attendees: {b.expectedAttendees}</p>
                {b.reviewReason && (
                  <p className="text-slate-400 text-xs mt-2 italic">Note: {b.reviewReason}</p>
                )}
              </div>
              {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                <button
                  type="button"
                  onClick={() => handleCancel(b.id)}
                  disabled={actionId === b.id}
                  className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-red-500/40 text-red-300 text-sm font-bold hover:bg-red-500/10 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  {actionId === b.id ? '…' : 'Cancel'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

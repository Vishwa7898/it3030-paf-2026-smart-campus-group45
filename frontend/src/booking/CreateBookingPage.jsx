import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Loader2 } from 'lucide-react';

/** Module B: POST /api/bookings — date/time range, purpose, optional expected attendees. */
export default function CreateBookingPage() {
  const { fetchJson } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    resourceId: '',
    startLocal: '',
    endLocal: '',
    purpose: '',
    expectedAttendees: '',
  });

  useEffect(() => {
    let c = true;
    (async () => {
      try {
        const data = await fetchJson('/api/resources');
        if (c && Array.isArray(data)) setResources(data);
      } catch {
        if (c) setResources([]);
      } finally {
        if (c) setLoading(false);
      }
    })();
    return () => {
      c = false;
    };
  }, [fetchJson]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!form.resourceId || !form.startLocal || !form.endLocal || !form.purpose.trim()) {
      setError('Please fill resource, start, end, and purpose.');
      return;
    }
    const start = new Date(form.startLocal);
    const end = new Date(form.endLocal);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      setError('End must be after start.');
      return;
    }

    const body = {
      resourceId: form.resourceId,
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
      purpose: form.purpose.trim(),
    };
    const n = parseInt(form.expectedAttendees, 10);
    if (form.expectedAttendees !== '' && !Number.isNaN(n) && n > 0) {
      body.expectedAttendees = n;
    }

    setSubmitting(true);
    try {
      await fetchJson('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      navigate('/bookings', { replace: true });
    } catch (err) {
      setError(err?.message || 'Could not create booking');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fade-in max-w-xl mx-auto">
      <Link to="/bookings" className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 mb-6">
        <ArrowLeft size={16} /> Back to my bookings
      </Link>

      <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-6">
        <h1 className="text-xl font-bold text-white mb-1">Request a booking</h1>
        <p className="text-slate-400 text-sm mb-6">Choose a resource, time range, and purpose. Your request starts as PENDING until an admin reviews it.</p>

        {loading ? (
          <div className="flex justify-center py-12 text-slate-400">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-950/30 px-3 py-2 text-rose-100 text-sm">{error}</div>
            )}

            <label className="block">
              <span className="text-sm text-slate-400">Resource</span>
              <select
                required
                value={form.resourceId}
                onChange={(e) => setForm({ ...form, resourceId: e.target.value })}
                className="mt-1 w-full bg-slate-950 border border-slate-600 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="">Select resource…</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.location}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm text-slate-400">Start</span>
              <input
                type="datetime-local"
                required
                value={form.startLocal}
                onChange={(e) => setForm({ ...form, startLocal: e.target.value })}
                className="mt-1 w-full bg-slate-950 border border-slate-600 rounded-lg px-3 py-2 text-slate-200"
              />
            </label>

            <label className="block">
              <span className="text-sm text-slate-400">End</span>
              <input
                type="datetime-local"
                required
                value={form.endLocal}
                onChange={(e) => setForm({ ...form, endLocal: e.target.value })}
                className="mt-1 w-full bg-slate-950 border border-slate-600 rounded-lg px-3 py-2 text-slate-200"
              />
            </label>

            <label className="block">
              <span className="text-sm text-slate-400">Purpose</span>
              <textarea
                required
                rows={3}
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                className="mt-1 w-full bg-slate-950 border border-slate-600 rounded-lg px-3 py-2 text-slate-200"
                placeholder="What is this booking for?"
              />
            </label>

            <label className="block">
              <span className="text-sm text-slate-400">Expected attendees (optional)</span>
              <input
                type="number"
                min={1}
                value={form.expectedAttendees}
                onChange={(e) => setForm({ ...form, expectedAttendees: e.target.value })}
                className="mt-1 w-full bg-slate-950 border border-slate-600 rounded-lg px-3 py-2 text-slate-200"
                placeholder="e.g. 10"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Users, FileText, Send } from 'lucide-react';
import { facilityService, API_BASE_URL } from '../../services/facilityService';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=800&auto=format&fit=crop';

function toIsoInstant(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const d = new Date(`${dateStr}T${timeStr}`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/** Local calendar date YYYY-MM-DD for date input min attribute. */
function localTodayYYYYMMDD() {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, '0');
  const d = String(t.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function BookingRequestPage() {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [resource, setResource] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successId, setSuccessId] = useState(null);

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [purpose, setPurpose] = useState('');
  const [expectedAttendees, setExpectedAttendees] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!resourceId) {
        setLoadError('Missing resource');
        return;
      }
      try {
        const data = await facilityService.getById(resourceId);
        if (!cancelled) {
          setResource(data);
          setLoadError(null);
          setDate((prev) => prev || localTodayYYYYMMDD());
          if (data?.capacity) {
            setExpectedAttendees((n) => Math.min(Math.max(n, 1), data.capacity));
          }
        }
      } catch {
        if (!cancelled) {
          setResource(null);
          setLoadError('Could not load this resource.');
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [resourceId]);

  const imageUrl = useMemo(() => {
    if (!resource?.imageUrl) return FALLBACK_IMAGE;
    const u = resource.imageUrl;
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    return `${API_BASE_URL}${u}`;
  }, [resource]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    const startDateTime = toIsoInstant(date, startTime);
    const endDateTime = toIsoInstant(date, endTime);
    if (!startDateTime || !endDateTime) {
      setFormError('Please choose a valid date and start/end times.');
      return;
    }
    if (new Date(endDateTime) <= new Date(startDateTime)) {
      setFormError('End time must be after start time.');
      return;
    }
    const nowMs = Date.now();
    if (new Date(startDateTime).getTime() <= nowMs) {
      setFormError('Booking cannot start in the past. Choose a future date and time.');
      return;
    }
    if (new Date(endDateTime).getTime() <= nowMs) {
      setFormError('Booking must end in the future.');
      return;
    }
    if (!purpose.trim()) {
      setFormError('Please describe the purpose of the booking.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await bookingService.create({
        resourceId,
        startDateTime,
        endDateTime,
        purpose: purpose.trim(),
        expectedAttendees: Number(expectedAttendees) || 1,
      });
      setSuccessId(created?.id ?? 'ok');
    } catch (err) {
      setFormError(err?.message || 'Could not submit booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-8 rounded-3xl bg-slate-800/40 border border-slate-700/50 text-center">
        <p className="text-red-300 font-medium mb-6">{loadError}</p>
        <Link
          to="/facilities"
          className="inline-flex items-center gap-2 text-indigo-400 font-bold hover:text-indigo-300"
        >
          <ArrowLeft size={18} />
          Back to facilities
        </Link>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-3xl mx-auto mt-24 text-center text-slate-500 font-medium">Loading resource…</div>
    );
  }

  if (resource.status !== 'ACTIVE') {
    return (
      <div className="max-w-lg mx-auto mt-16 p-8 rounded-3xl bg-slate-800/40 border border-slate-700/50 text-center">
        <p className="text-slate-300 mb-2">This resource is not available for booking right now.</p>
        <p className="text-slate-500 text-sm mb-6">Status: {resource.status}</p>
        <Link to="/facilities" className="text-indigo-400 font-bold hover:text-indigo-300">
          ← Back to catalogue
        </Link>
      </div>
    );
  }

  if (successId) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center">
        <h2 className="text-xl font-black text-white mb-2">Request submitted</h2>
        <p className="text-emerald-200/90 text-sm mb-6">
          Your booking is <span className="font-bold">pending approval</span>. You will be notified when an
          administrator reviews it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/bookings"
            className="py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm"
          >
            View my bookings
          </Link>
          <Link
            to="/facilities"
            className="py-3 px-6 rounded-2xl border border-slate-600 text-slate-200 font-bold text-sm hover:bg-slate-800"
          >
            Back to facilities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="rounded-3xl overflow-hidden border border-slate-700/50 bg-slate-800/40 backdrop-blur-xl shadow-xl">
        <div className="grid md:grid-cols-5 gap-0">
          <div className="md:col-span-2 relative h-48 md:h-auto min-h-[200px]">
            <img
              src={imageUrl}
              alt={resource.name}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent md:bg-gradient-to-r" />
          </div>
          <div className="md:col-span-3 p-6 md:p-8">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2">New booking request</p>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-1">{resource.name}</h1>
            <p className="text-slate-400 text-sm mb-6">
              {resource.location} · Capacity {resource.capacity}
            </p>
            {user?.email && (
              <p className="text-xs text-slate-500 mb-6">
                Signed in as <span className="text-slate-300">{user.email}</span>
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  <Calendar size={14} className="text-indigo-400" />
                  Date
                </label>
                <input
                  type="date"
                  required
                  min={localTodayYYYYMMDD()}
                  value={date}
                  onChange={(e) => {
                    const v = e.target.value;
                    const min = localTodayYYYYMMDD();
                    setDate(v < min ? min : v);
                  }}
                  className="w-full bg-slate-900/80 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    <Clock size={14} className="text-indigo-400" />
                    Start
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    <Clock size={14} className="text-indigo-400" />
                    End
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  <Users size={14} className="text-indigo-400" />
                  Expected attendees
                </label>
                <input
                  type="number"
                  min={1}
                  max={resource.capacity ?? 10000}
                  required
                  value={expectedAttendees}
                  onChange={(e) => setExpectedAttendees(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-900/80 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Must not exceed room capacity ({resource.capacity}).</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  <FileText size={14} className="text-indigo-400" />
                  Purpose
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={500}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Group study session, lab practical, club meeting…"
                  className="w-full bg-slate-900/80 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none text-white font-black text-xs uppercase tracking-widest transition-colors"
              >
                <Send size={18} />
                {submitting ? 'Submitting…' : 'Submit booking request'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <p className="text-center mt-6 text-sm text-slate-500">
        <Link to="/bookings" className="text-indigo-400 hover:text-indigo-300 font-bold">
          My bookings
        </Link>
      </p>
    </div>
  );
}

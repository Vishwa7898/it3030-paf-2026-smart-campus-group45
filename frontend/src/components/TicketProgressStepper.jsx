import { Check, Circle, XCircle } from 'lucide-react';

const STEPS = [
  { key: 'OPEN', label: 'Open', desc: 'Report received' },
  { key: 'IN_PROGRESS', label: 'In progress', desc: 'Staff are working on it' },
  { key: 'RESOLVED', label: 'Resolved', desc: 'Fix completed' },
  { key: 'CLOSED', label: 'Closed', desc: 'Ticket finished' },
];

function stepIndex(status) {
  if (status === 'REJECTED') return -1;
  const i = STEPS.findIndex((s) => s.key === status);
  return i >= 0 ? i : 0;
}

export default function TicketProgressStepper({ status, resolutionNotes }) {
  if (status === 'REJECTED') {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/80 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-red-900">Ticket rejected</h3>
            <p className="text-sm text-red-800/90 mt-1">
              An administrator rejected this report. Reason:
            </p>
            <p className="text-sm text-red-950 mt-2 whitespace-pre-wrap rounded-lg bg-white/60 border border-red-100 p-3">
              {resolutionNotes?.trim() || 'No reason was recorded.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const current = stepIndex(status);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-1">Your ticket progress</h3>
      <p className="text-xs text-slate-500 mb-5">
        Follow your report through the campus workflow (same stages your lecturer marks).
      </p>
      <ol className="space-y-0">
        {STEPS.map((step, idx) => {
          const done = idx < current;
          const active = idx === current;
          return (
            <li key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center w-8 shrink-0">
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold transition-colors ${
                    done
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : active
                        ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  {done ? <Check className="w-4 h-4" strokeWidth={3} /> : active ? idx + 1 : <Circle className="w-3 h-3" />}
                </span>
                {idx < STEPS.length - 1 && (
                  <span
                    className={`w-0.5 flex-1 min-h-[1.25rem] my-0.5 ${
                      done ? 'bg-emerald-400' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
              <div className={`pb-6 ${idx === STEPS.length - 1 ? 'pb-0' : ''}`}>
                <p
                  className={`font-semibold text-sm ${
                    active ? 'text-indigo-800' : done ? 'text-emerald-800' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
              </div>
            </li>
          );
        })}
      </ol>
      {(status === 'RESOLVED' || status === 'CLOSED') && resolutionNotes?.trim() && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase">Resolution notes</p>
          <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{resolutionNotes}</p>
        </div>
      )}
    </div>
  );
}

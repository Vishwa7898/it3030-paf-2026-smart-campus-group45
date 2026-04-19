import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, XCircle, FileText, User, Trash2 } from 'lucide-react';
import { TicketService, getImageUrl } from '../../services/api';
import CommentSection from '../../components/CommentSection';
import TicketProgressStepper from '../../components/TicketProgressStepper';
import { useAuth } from '../../context/AuthContext';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isStudent, isAdmin, isTechnician } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const backUrl = location.pathname.startsWith('/admin') ? '/admin/tickets' : '/tickets';
  const currentUserId =
    currentUser?.id ||
    currentUser?.userId ||
    currentUser?.studentId ||
    currentUser?.email ||
    '';

  const [status, setStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editContact, setEditContact] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [id, currentUserId, isAdmin, isTechnician]);

  const loadTicket = async () => {
    try {
      const viewerRole = isAdmin ? 'ADMIN' : isTechnician ? 'TECHNICIAN' : 'USER';
      const data = await TicketService.getTicketById(id, {
        viewerRole,
        viewerId: currentUserId,
      });
      setTicket(data);
      setStatus(data.status);
      setResolutionNotes(data.resolutionNotes || '');
      setAssigneeId(data.assigneeId || '');
      setEditDescription(data.description || '');
      setEditCategory(data.category || '');
      setEditContact(data.contactDetails || '');
    } catch (err) {
      if (err?.response?.status === 403) {
        alert(err?.response?.data?.message || 'You cannot view this ticket.');
        navigate('/tickets', { replace: true });
        return;
      }
      console.error(err);
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  const apiError = (err) => err?.response?.data?.message || err?.message || 'Request failed';

  const handleUpdateStatus = async () => {
    try {
      await TicketService.updateTicketStatus(id, status, resolutionNotes);
      await loadTicket();
      alert('Status updated successfully');
    } catch (err) {
      console.error(err);
      alert(apiError(err));
    }
  };

  const handleAssign = async () => {
    try {
      await TicketService.assignTicket(id, assigneeId);
      await loadTicket();
      alert('Ticket assigned successfully');
    } catch (err) {
      console.error(err);
      alert(apiError(err));
    }
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      await TicketService.updateTicketDetails(id, {
        description: editDescription,
        category: editCategory,
        contactDetails: editContact,
      });
      await loadTicket();
      alert('Ticket updated');
    } catch (err) {
      alert(apiError(err));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!window.confirm('Delete this ticket permanently?')) return;
    try {
      await TicketService.deleteTicket(id);
      navigate(backUrl);
    } catch (err) {
      alert(apiError(err));
    }
  };

  const canAssign = isAdmin;
  const canManageWorkflow =
    isAdmin ||
    (isTechnician && ticket?.assigneeId === currentUserId);
  const canDelete =
    isAdmin ||
    ((ticket?.status === 'OPEN' || ticket?.status === 'REJECTED') && ticket?.submitterId === currentUserId);
  const canEditOpen =
    ticket?.status === 'OPEN' &&
    (isAdmin || ticket?.submitterId === currentUserId);
  const technicianReadOnly =
    isTechnician && !canManageWorkflow && ticket;
  const statusOptions = (() => {
    if (!ticket) return [];
    const current = ticket.status;
    if (isAdmin) {
      if (current === 'OPEN' || current === 'IN_PROGRESS') return [current, 'REJECTED'];
      if (current === 'RESOLVED') return [current, 'CLOSED', 'REJECTED'];
      return [current];
    }
    if (isTechnician && ticket.assigneeId === currentUserId) {
      if (current === 'OPEN') return [current, 'IN_PROGRESS'];
      if (current === 'IN_PROGRESS') return [current, 'RESOLVED'];
      if (current === 'RESOLVED') return [current];
      return [current];
    }
    return [current];
  })();

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  if (!ticket) return <div className="text-center py-20 text-slate-500">Ticket not found</div>;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPEN': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'IN_PROGRESS': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'RESOLVED': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'CLOSED': return <CheckCircle2 className="w-5 h-5 text-slate-500" />;
      case 'REJECTED': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to={backUrl}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-800">#{ticket.id?.substring(0, 8)}</h2>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-sm font-semibold shadow-sm">
              {getStatusIcon(ticket.status)}
              <span className="text-slate-700">{ticket.status.replace('_', ' ')}</span>
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Submitted on {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-indigo-600 font-semibold text-sm mb-1 block">{ticket.category}</span>
                <h1 className="text-2xl font-bold text-slate-900">{ticket.resourceId}</h1>
                <p className="text-slate-500 flex items-center gap-1.5 mt-1">
                  Location: <span className="font-medium text-slate-700">{ticket.location}</span>
                </p>
              </div>
              <div className={`px-4 py-1.5 border rounded-lg text-sm font-bold ${ticket.priority === 'CRITICAL' ? 'bg-red-50 border-red-200 text-red-700' :
                  ticket.priority === 'HIGH' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                    ticket.priority === 'MEDIUM' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                      'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                {ticket.priority} PRIORITY
              </div>
            </div>

            <div className="prose prose-slate max-w-none mb-8">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Description</h3>
              {canEditOpen ? (
                <div className="space-y-3">
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Category</label>
                      <input
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Contact</label>
                      <input
                        value={editContact}
                        onChange={(e) => setEditContact(e.target.value)}
                        className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={savingEdit}
                    className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {savingEdit ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              ) : (
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
              )}
            </div>

            {ticket.imagePaths && ticket.imagePaths.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Evidence Attachments</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {ticket.imagePaths.map((path, idx) => (
                    <a
                      key={idx}
                      href={getImageUrl(path)}
                      target="_blank"
                      rel="noreferrer"
                      className="block aspect-square rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-400 hover:ring-2 hover:ring-indigo-100 transition-all"
                    >
                      <img
                        src={getImageUrl(path)}
                        alt="Evidence"
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="w-1/2 border-r border-slate-200 pr-4">
                <p className="text-xs text-slate-500 font-medium mb-1">Submitter Details</p>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <User className="w-4 h-4 text-slate-400" />
                  {ticket.submitterId || 'Anonymous'}
                </div>
                <p className="text-sm text-slate-600 mt-1">{ticket.contactDetails}</p>
              </div>
              <div className="w-1/2 pl-4">
                <p className="text-xs text-slate-500 font-medium mb-1">Assigned Technician</p>
                {ticket.assigneeId ? (
                  <div className="flex items-center gap-2 text-indigo-700 font-medium">
                    <User className="w-4 h-4 text-indigo-400" />
                    {ticket.assigneeId}
                  </div>
                ) : (
                  <span className="text-sm text-slate-400 italic">Unassigned</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
            <CommentSection ticketId={id} currentUser={currentUser} />
          </div>
        </div>

        {/* Right column: student progress vs staff workflow */}
        <div className="space-y-6">
          {isStudent && (
            <div className="sticky top-24">
              <TicketProgressStepper
                status={ticket.status}
                resolutionNotes={ticket.resolutionNotes}
              />
              <p className="text-xs text-slate-500 mt-3 px-1 leading-relaxed">
                Your assigned technician moves OPEN → IN_PROGRESS → RESOLVED. Admin can reject, and admin/system can close.
              </p>
              {canDelete && (
                <button
                  type="button"
                  onClick={handleDeleteTicket}
                  className="w-full mt-4 py-2.5 flex items-center justify-center gap-2 text-sm text-red-700 border border-red-200 rounded-xl bg-red-50 hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" /> Remove ticket
                </button>
              )}
            </div>
          )}

          {technicianReadOnly && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-5 text-sm text-amber-950 sticky top-24">
              <p className="font-semibold">Read-only for you</p>
              <p className="mt-2 text-amber-900/90">
                This ticket is assigned to <strong>{ticket.assigneeId || '—'}</strong>. Only that technician can move
                work status on it. Ask an admin to assign you if you should handle it.
              </p>
            </div>
          )}

          {canManageWorkflow && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" /> Staff workflow
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {isAdmin
                  ? 'Admin actions: assign technician, reject with reason, and close when appropriate.'
                  : 'As assigned technician: OPEN → IN_PROGRESS → RESOLVED → CLOSED with notes on resolve.'}
              </p>

              {canDelete && (
                <button
                  type="button"
                  onClick={handleDeleteTicket}
                  className="w-full mb-4 py-2 flex items-center justify-center gap-2 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" /> Delete ticket
                </button>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Update status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                  >
                    {statusOptions.map((nextStatus) => (
                      <option key={nextStatus} value={nextStatus}>
                        {nextStatus === 'REJECTED' ? 'Rejected (requires reason)' : nextStatus.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {(status === 'RESOLVED' || status === 'REJECTED' || status === 'CLOSED') && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                      Resolution / rejection notes
                    </label>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm resize-none"
                      rows={3}
                      placeholder={
                        status === 'REJECTED'
                          ? 'Reason students will see…'
                          : 'What was fixed or verified…'
                      }
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Save updates
                </button>

                {canAssign && (
                  <>
                    <hr className="border-slate-100 my-4" />

                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                        Assign technician
                      </label>
                      <p className="text-[11px] text-slate-400 mb-2">
                        Demo technician id: <code className="bg-slate-100 px-1 rounded">tech-jamith</code>
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={assigneeId}
                          onChange={(e) => setAssigneeId(e.target.value)}
                          placeholder="Technician user id"
                          className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleAssign}
                          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-medium transition-colors border border-indigo-200"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;

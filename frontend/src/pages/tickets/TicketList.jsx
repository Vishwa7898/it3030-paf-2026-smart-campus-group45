import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, AlertCircle, Clock, CheckCircle2, XCircle, Info } from 'lucide-react';
import { TicketService } from '../../services/api';
import { useAuth } from '../../auth/AuthContext';

const TicketList = () => {
  const { user, isStudent, isAdmin, isTechnician } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const statusFilter = filter === 'ALL' ? null : filter;
      const result = await TicketService.getAllTickets({
        status: statusFilter,
        q: search.trim() || undefined,
      });
      setData(result);
    } catch (error) {
      console.error('Failed to load tickets', error);
    } finally {
      setLoading(false);
    }
  }, [filter, search, user?.id, user?.role]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'OPEN': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'IN_PROGRESS': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'RESOLVED': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'CLOSED': return <CheckCircle2 className="w-4 h-4 text-slate-500" />;
      case 'REJECTED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      OPEN: 'bg-amber-100 text-amber-700 border-amber-200',
      IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
      RESOLVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',
      REJECTED: 'bg-red-100 text-red-700 border-red-200'
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status] || styles.OPEN} flex items-center gap-1.5 w-fit`}>
        {getStatusIcon(status)}
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      LOW: 'bg-slate-100 text-slate-600',
      MEDIUM: 'bg-blue-50 text-blue-600',
      HIGH: 'bg-orange-50 text-orange-600',
      CRITICAL: 'bg-red-50 text-red-600 font-bold'
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${styles[priority] || styles.LOW}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div
        className={`flex gap-3 p-4 rounded-2xl border text-sm ${
          isStudent
            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
            : isAdmin
              ? 'bg-violet-50/90 border-violet-200 text-violet-900'
              : 'bg-amber-50/90 border-amber-200 text-amber-950'
        }`}
      >
        <Info className="w-5 h-5 shrink-0 mt-0.5 opacity-80" />
        <div>
          <p className="font-semibold">
            {isStudent && 'Student view — only your submitted tickets'}
            {isAdmin && 'Admin view — all tickets from every student'}
            {isTechnician && !isAdmin && 'Technician view — all tickets (update status when you are the assignee)'}
          </p>
          <p className="text-xs mt-1 opacity-90 leading-relaxed">
            {isStudent &&
              'You will see OPEN, IN_PROGRESS, RESOLVED, CLOSED, or REJECTED (with reason) on each card. Open a ticket for the full progress timeline.'}
            {isAdmin &&
              'Use ticket details to assign staff and move the workflow: OPEN → IN_PROGRESS → RESOLVED → CLOSED, or set REJECTED with a reason.'}
            {isTechnician && !isAdmin &&
              'After an admin assigns you (your id: tech-jamith), you can add resolution notes and mark IN_PROGRESS → RESOLVED.'}
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isStudent ? 'Search your tickets…' : 'Search all tickets…'}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-full sm:w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent border-none text-sm text-slate-600 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
        
        <Link 
          to="/tickets/new" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm shadow-indigo-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Ticket
        </Link>
      </div>

      {/* Ticket Grid/List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No tickets found</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            There are no incident tickets matching your current filter. Create a new ticket if you found an issue.
          </p>
          <Link 
            to="/tickets/new" 
            className="text-indigo-600 font-medium hover:text-indigo-700"
          >
            Create your first ticket &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((ticket) => (
            <Link 
              key={ticket.id} 
              to={`/tickets/${ticket.id}`}
              className="group block bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-indigo-500 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-4">
                {getStatusBadge(ticket.status)}
                <span className="text-xs text-slate-400 font-medium">#{ticket.id?.substring(0, 8)}</span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-1 group-hover:text-indigo-700 transition-colors">
                {ticket.category}
              </h3>
              
              <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">
                {ticket.description}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-400">Resource/Location</span>
                  <span className="text-sm font-medium text-slate-700">{ticket.resourceId} / {ticket.location}</span>
                </div>
                {getPriorityBadge(ticket.priority)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;

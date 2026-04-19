import { useState, useEffect } from 'react';
import { Send, UserCircle2, Trash2, Edit2, X, Check } from 'lucide-react';
import { CommentService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CommentSection = ({ ticketId, currentUser }) => {
  const { isAdmin, isTechnician } = useAuth();
  const currentUserId =
    currentUser?.id ||
    currentUser?.userId ||
    currentUser?.studentId ||
    currentUser?.email ||
    '';
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadComments();
  }, [ticketId]);

  const loadComments = async () => {
    try {
      const data = await CommentService.getComments(ticketId);
      setComments(data || []);
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setLoading(true);
    try {
      await CommentService.addComment(ticketId, newComment);
      setNewComment('');
      loadComments();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (commentId) => {
    if (!editContent.trim()) return;
    
    try {
      await CommentService.updateComment(ticketId, commentId, editContent);
      setEditingId(null);
      loadComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await CommentService.deleteComment(ticketId, commentId);
      loadComments();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString([], {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Discussion ({comments.length})</h3>
      
      <div className="space-y-4">
        {comments.map(comment => {
          const isOwner = comment.authorId === currentUserId;
          const staffModerator = isAdmin || isTechnician;
          const canDelete = isOwner || staffModerator;
          const isEditing = editingId === comment.id;

          return (
            <div key={comment.id} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-indigo-500">
                  <UserCircle2 className="w-6 h-6" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-800">{comment.authorId}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-medium">
                      {comment.authorRole}
                    </span>
                    <span className="text-xs text-slate-400">&bull; {formatDate(comment.createdAt)}</span>
                  </div>
                  
                  {!isEditing && (
                    <div className="flex gap-1">
                      {isOwner && (
                        <button 
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditContent(comment.content);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-md transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button 
                          onClick={() => handleDelete(comment.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="mt-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm shadow-sm"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button 
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-sm bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 flex items-center gap-1 inline-flex"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                      <button 
                        onClick={() => handleEditSubmit(comment.id)}
                        className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1 inline-flex"
                      >
                        <Check className="w-3.5 h-3.5" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-600 text-sm whitespace-pre-wrap">{comment.content}</p>
                )}
              </div>
            </div>
          );
        })}
        
        {comments.length === 0 && (
          <div className="text-center py-6 text-slate-500 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No comments yet. Start the discussion!
          </div>
        )}
      </div>

      <form onSubmit={handleAddComment} className="flex gap-4 mt-6 items-start">
        <div className="shrink-0 mt-1">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <UserCircle2 className="w-6 h-6" />
          </div>
        </div>
        <div className="flex-1 relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-4 pr-14 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none shadow-sm min-h-[100px]"
          />
          <button 
            type="submit"
            disabled={!newComment.trim() || loading}
            className="absolute bottom-4 right-4 p-2 bg-indigo-600 text-white rounded-xl shadow-sm shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;

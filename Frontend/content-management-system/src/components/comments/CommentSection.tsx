import React, { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Reply, Trash2, Edit2, Send, ShieldCheck, Loader2 } from 'lucide-react';
import { createComment, deleteComment, fetchComments, updateComment } from '../../services/comments';
import type { Comment } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface CommentSectionProps {
  contentId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ contentId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [contentId]);

  useEffect(() => {
    loadComments(page);
  }, [contentId, page]);

  const loadComments = async (pageToLoad = 1) => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchComments(contentId, pageToLoad, pageSize);
      setComments(data.items);
      setTotal(data.total);
    } catch (err: any) {
      console.error('Failed to load comments', err);
      setError(err.response?.data?.message || 'Could not load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!isAuthenticated) {
      setError('You need to sign in to post a comment.');
      return;
    }
    if (!newComment.trim()) {
      return;
    }
    try {
      setBusyId('new');
      const created = await createComment({ contentId, text: newComment.trim() });
      setNewComment('');
      // Newest-first ordering - prepend
      setComments(prev => [created, ...prev]);
      setTotal(prev => prev + 1);
      setPage(1);
    } catch (err: any) {
      console.error('Failed to add comment', err);
      setError(err.response?.data?.message || 'Unable to add comment.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!isAuthenticated) {
      setError('You need to sign in to reply.');
      return;
    }
    if (!replyText.trim()) return;

    try {
      setBusyId(parentId);
      const created = await createComment({ contentId, text: replyText.trim(), parentId });
      setReplyText('');
      setReplyTo(null);
      injectComment(created);
    } catch (err: any) {
      console.error('Failed to reply to comment', err);
      setError(err.response?.data?.message || 'Unable to reply to this comment.');
    } finally {
      setBusyId(null);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editText.trim()) return;
    try {
      setBusyId(id);
      const updated = await updateComment(id, { text: editText.trim() });
      applyToComment(id, () => updated);
      setEditId(null);
      setEditText('');
    } catch (err: any) {
      console.error('Failed to edit comment', err);
      setError(err.response?.data?.message || 'Unable to edit comment.');
    } finally {
      setBusyId(null);
    }
  };

  const handleModerate = async (id: string, isModerated: boolean) => {
    try {
      setBusyId(id);
      const updated = await updateComment(id, { isModerated });
      applyToComment(id, () => updated);
    } catch (err: any) {
      console.error('Failed to moderate comment', err);
      setError(err.response?.data?.message || 'Unable to moderate comment.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setBusyId(id);
      await deleteComment(id);
      applyToComment(id, (existing) => ({
        ...existing,
        text: '[deleted]',
        isDeleted: true
      }));
    } catch (err: any) {
      console.error('Failed to delete comment', err);
      setError(err.response?.data?.message || 'Unable to delete comment.');
    } finally {
      setBusyId(null);
    }
  };

  const applyToComment = (id: string, updater: (existing: Comment) => Comment) => {
    const mapComment = (comment: Comment): Comment => {
      const updated = comment.id === id ? updater(comment) : comment;
      const replies = updated.replies?.map(mapComment);
      return replies ? { ...updated, replies } : updated;
    };
    setComments(prev => prev.map(mapComment));
  };

  const injectComment = (newComment: Comment) => {
    if (newComment.parentId) {
      applyToComment(newComment.parentId, (parent) => ({
        ...parent,
        replies: [...(parent.replies || []), newComment]
      }));
    } else {
      setComments(prev => [newComment, ...prev]);
      setTotal(prev => prev + 1);
    }
  };

  const canEditOrDelete = (comment: Comment) => {
    if (!user) return false;
    return user.role === 'Admin' || comment.userId === user.userId;
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isBusy = busyId === comment.id;
    return (
      <div
        key={comment.id}
        className="comment-card"
        style={{
          border: '1px solid var(--border-color)',
          borderRadius: '0.75rem',
          padding: '1.25rem',
          background: isReply ? 'var(--bg-primary)' : 'var(--bg-secondary)',
          marginTop: isReply ? '0.75rem' : '1rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{comment.username}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
              {new Date(comment.createdAt).toLocaleString()}
            </div>
            {comment.isModerated && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#0f766e', fontSize: '0.8125rem' }}>
                <ShieldCheck size={14} /> Moderated
              </span>
            )}
          </div>
        </div>
        <div style={{ marginTop: '0.5rem', color: 'var(--text-primary)' }}>
          {comment.isDeleted ? (
            <em style={{ color: 'var(--text-secondary)' }}>[deleted]</em>
          ) : editId === comment.id ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  borderRadius: '0.5rem', 
                  border: '1px solid var(--border-color)',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="btn-primary" onClick={() => handleUpdate(comment.id)} disabled={isBusy} style={{ padding: '0.5rem 1rem' }}>
                  {isBusy ? <Loader2 size={16} className="spin" /> : 'Save'}
                </button>
                <button className="btn-secondary" onClick={() => { setEditId(null); setEditText(''); }} style={{ padding: '0.5rem 1rem' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, lineHeight: 1.6 }}>{comment.text}</p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.875rem', flexWrap: 'wrap' }}>
          {isAuthenticated && !comment.isDeleted && !isReply && (
            <button
              onClick={() => {
                setReplyTo(comment.id);
                setEditId(null);
              }}
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.375rem', 
                border: 'none', 
                background: 'transparent', 
                color: 'var(--accent-primary)', 
                cursor: 'pointer', 
                fontWeight: 600,
                padding: '0.25rem 0',
                fontSize: '0.875rem'
              }}
            >
              <Reply size={16} /> Reply
            </button>
          )}

          {canEditOrDelete(comment) && !comment.isDeleted && (
            <>
              <button
                onClick={() => {
                  setEditId(comment.id);
                  setEditText(comment.text);
                  setReplyTo(null);
                }}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.375rem', 
                  border: 'none', 
                  background: 'transparent', 
                  color: 'var(--text-secondary)', 
                  cursor: 'pointer',
                  padding: '0.25rem 0',
                  fontSize: '0.875rem'
                }}
              >
                <Edit2 size={16} /> Edit
              </button>
              <button
                onClick={() => handleDelete(comment.id)}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.375rem', 
                  border: 'none', 
                  background: 'transparent', 
                  color: '#ef4444', 
                  cursor: 'pointer',
                  padding: '0.25rem 0',
                  fontSize: '0.875rem'
                }}
                disabled={isBusy}
              >
                {isBusy ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />}
                Delete
              </button>
            </>
          )}

          {user?.role === 'Admin' && (
            <button
              onClick={() => handleModerate(comment.id, !comment.isModerated)}
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.375rem', 
                border: 'none', 
                background: 'transparent', 
                color: '#0f766e', 
                cursor: 'pointer',
                padding: '0.25rem 0',
                fontSize: '0.875rem'
              }}
              disabled={isBusy}
            >
              {comment.isModerated ? 'Unmark' : 'Moderate'}
            </button>
          )}
        </div>

        {replyTo === comment.id && (
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
            <textarea
              rows={3}
              placeholder="Write your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '0.5rem', 
                border: '1px solid var(--border-color)',
                marginBottom: '0.75rem',
                resize: 'vertical',
                minHeight: '80px'
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                className="btn-primary" 
                onClick={() => handleReply(comment.id)} 
                disabled={busyId === comment.id}
                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {busyId === comment.id ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                Reply
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => { setReplyTo(null); setReplyText(''); }}
                style={{ padding: '0.5rem 1rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!!comment.replies?.length && (
          <div style={{ marginTop: '0.75rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '0.75rem' }}>
            {comment.replies.map(r => renderComment(r, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <MessageSquare size={24} />
        <h3 style={{ margin: 0 }}>Discussion</h3>
        <span style={{ color: 'var(--text-secondary)' }}>({total} comments)</span>
      </div>

      {error && (
        <div style={{ color: '#b91c1c', marginBottom: '1rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {isAuthenticated ? (
        <div className="card" style={{ padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
          <textarea
            rows={3}
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              borderRadius: '0.5rem', 
              border: '1px solid var(--border-color)', 
              marginBottom: '0.75rem',
              resize: 'vertical',
              minHeight: '80px'
            }}
          />
          <button 
            className="btn-primary" 
            onClick={handleCreate} 
            disabled={busyId === 'new'}
            style={{ 
              padding: '0.625rem 1.25rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem' 
            }}
          >
            {busyId === 'new' ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
            Post Comment
          </button>
        </div>
      ) : (
        <div style={{ 
          padding: '1rem', 
          borderRadius: '0.75rem', 
          background: 'rgba(59,130,246,0.08)', 
          color: '#1d4ed8', 
          fontWeight: 600,
          border: '1px solid rgba(59,130,246,0.2)'
        }}>
          Sign in to join the conversation.
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
          <Loader2 className="spin" />
        </div>
      ) : (
        <div style={{ marginTop: '1rem' }}>
          {comments.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No comments yet. Be the first to contribute.</p>
          ) : (
            comments.map(c => renderComment(c))
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '0.75rem', 
          marginTop: '1.5rem', 
          alignItems: 'center',
          flexWrap: 'wrap',
          padding: '1rem 0'
        }}>
          <button 
            className="btn-secondary" 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1}
            style={{ padding: '0.5rem 1rem', minWidth: '90px' }}
          >
            Previous
          </button>
          <span style={{ color: 'var(--text-secondary)', padding: '0 0.5rem', fontSize: '0.9375rem' }}>
            Page {page} of {totalPages}
          </span>
          <button 
            className="btn-secondary" 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
            disabled={page === totalPages}
            style={{ padding: '0.5rem 1rem', minWidth: '90px' }}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default CommentSection;

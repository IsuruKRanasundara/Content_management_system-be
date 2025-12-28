import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Content } from '../types';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const extractImageMarkdown = (text: string) => {
  // Match both absolute URLs and relative paths
  const regex = /!\[[^\]]*]\(([^)]+)\)/g;
  const urls: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    urls.push(match[1]);
  }
  return urls;
};

const renderBodyWithImages = (text: string) => {
  // Match both absolute URLs and relative paths
  const imageRegex = /!\[[^\]]*]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  const pushText = (slice: string, keyPrefix: string) => {
    if (!slice) return;
    const lines = slice.split('\n');
    lines.forEach((line, idx) => {
      parts.push(<span key={`${keyPrefix}-line-${idx}`}>{line}</span>);
      if (idx < lines.length - 1) {
        parts.push(<br key={`${keyPrefix}-br-${idx}`} />);
      }
    });
  };

  while ((match = imageRegex.exec(text)) !== null) {
    const [fullMatch, url] = match;
    const matchIndex = match.index ?? 0;
    pushText(text.slice(lastIndex, matchIndex), `text-${lastIndex}`);
    parts.push(
      <div key={`img-${matchIndex}`} style={{ margin: '0.75rem 0' }}>
        <img
          src={url}
          alt=""
          style={{ maxWidth: '100%', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
        />
      </div>
    );
    lastIndex = matchIndex + fullMatch.length;
  }

  pushText(text.slice(lastIndex), `text-${lastIndex}`);
  return parts;
};

const ContentList: React.FC = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [previewContent, setPreviewContent] = useState<Content | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const response = await api.get('/contents');
      setContents(response.data);
    } catch (error) {
      console.error('Failed to fetch contents', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await api.delete(`/contents/${id}`);
        setContents(contents.filter(c => c.contentId !== id));
      } catch (error) {
        console.error('Failed to delete content', error);
      }
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Content Library</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>Manage and organize your content</p>
        </div>
        {isAuthenticated && (
          <Link to="/contents/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75em 1.5em', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '1rem', fontWeight: 600 }}>
            <Plus size={20} /> Create New
          </Link>
        )}
      </div>

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {contents.map((content) => (
          <div 
            key={content.contentId} 
            className="card"
            style={{
              padding: '1.5rem',
              transition: 'transform 0.3s, box-shadow 0.3s',
              cursor: 'pointer',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => setPreviewContent(content)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <h3 style={{ marginTop: 0, fontSize: '1.25rem', fontWeight: 600 }}>{content.title}</h3>
              <span style={{ 
                padding: '0.25rem 0.75rem', 
                borderRadius: '9999px', 
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: content.status === 'Published' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                color: content.status === 'Published' ? '#10b981' : 'var(--accent-primary)'
              }}>
                {content.status}
              </span>
            </div>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '0.95rem',
              lineHeight: 1.6,
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              display: '-webkit-box', 
              WebkitLineClamp: 3, 
              WebkitBoxOrient: 'vertical',
              marginBottom: '1.5rem'
            }}>
              {content.body}
            </p>
            {isAuthenticated && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                <Link 
                  to={`/contents/${content.contentId}`} 
                  style={{ 
                    padding: '0.5rem 1rem', 
                    borderRadius: '0.375rem', 
                    backgroundColor: 'var(--accent-primary)', 
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flex: 1,
                    justifyContent: 'center',
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Edit size={16} /> Edit
                </Link>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(content.contentId);
                  }} 
                  style={{ 
                    padding: '0.5rem 1rem', 
                    borderRadius: '0.375rem', 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 500
                  }}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {contents.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '1.5rem' }}>No content available yet.</p>
          {isAuthenticated && (
            <Link to="/contents/new" className="btn-primary" style={{ padding: '0.75em 2em', textDecoration: 'none', borderRadius: '0.5rem', display: 'inline-block' }}>
              Create Your First Content
            </Link>
          )}
        </div>
      )}

      {previewContent && (
        <div
          onClick={() => setPreviewContent(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 999,
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '800px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              padding: '1.5rem',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setPreviewContent(null)}
              style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                background: 'transparent',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
            }}
            aria-label="Close preview"
          >
              x
          </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span style={{ 
                padding: '0.25rem 0.75rem', 
                borderRadius: '9999px', 
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: previewContent.status === 'Published' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                color: previewContent.status === 'Published' ? '#10b981' : 'var(--accent-primary)'
              }}>
                {previewContent.status}
              </span>
              {previewContent.categoryId && (
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Category ID: {previewContent.categoryId}
                </span>
              )}
            </div>
            <h2 style={{ margin: '0 0 0.75rem 0' }}>{previewContent.title}</h2>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {renderBodyWithImages(previewContent.body)}
            </div>
            {extractImageMarkdown(previewContent.body).length > 0 && (
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {extractImageMarkdown(previewContent.body).map((url, idx) => (
                  <img
                    key={`thumb-${idx}`}
                    src={url}
                    alt=""
                    style={{
                      width: '120px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '0.375rem',
                      border: '1px solid var(--border-color)',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentList;

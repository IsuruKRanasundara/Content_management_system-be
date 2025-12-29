import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import api from '../services/api';
import type { Content } from '../types';
import CommentSection from '../components/comments/CommentSection';
import { useAuth } from '../context/AuthContext';

const renderBodyWithImages = (text: string) => {
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
      <div key={`img-${matchIndex}`} style={{ margin: '1rem 0' }}>
        <img
          src={url}
          alt=""
          style={{ maxWidth: '100%', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}
        />
      </div>
    );
    lastIndex = matchIndex + fullMatch.length;
  }

  pushText(text.slice(lastIndex), `text-${lastIndex}`);
  return parts;
};

const ContentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const contentId = useMemo(() => Number(id), [id]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const response = await api.get(`/contents/${id}`);
        setContent(response.data);
      } catch (err: any) {
        console.error('Failed to load content', err);
        setError(err.response?.data?.message || 'Could not load this content.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', color: '#b91c1c', fontWeight: 600 }}>{error}</div>;
  }

  if (!content) {
    return <div style={{ padding: '2rem' }}>Content not found.</div>;
  }

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: '0.75rem', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <Link 
          to="/contents" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            padding: '0.5rem 0'
          }}
        >
          <ArrowLeft size={18} /> Back to list
        </Link>
        {isAuthenticated && (
          <Link
            to={`/contents/${content.contentId}`}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              textDecoration: 'none',
              padding: '0.5rem 1rem'
            }}
            className="btn-secondary"
          >
            <Edit size={16} /> Edit Content
          </Link>
        )}
      </div>

      <div 
        className="card" 
        style={{ 
          padding: '2rem 1.5rem', 
          borderRadius: '0.75rem', 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--border-color)' 
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          marginBottom: '1rem',
          flexWrap: 'wrap'
        }}>
          <span style={{
            padding: '0.375rem 0.875rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 700,
            backgroundColor: content.status === 'Published' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(249, 115, 22, 0.1)',
            color: content.status === 'Published' ? '#065f46' : '#c2410c'
          }}>
            {content.status}
          </span>
          {content.categoryId && (
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Category #{content.categoryId}
            </span>
          )}
        </div>

        <h1 style={{ margin: '0 0 1rem 0', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: 1.2 }}>{content.title}</h1>
        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.0625rem' }}>
          {renderBodyWithImages(content.body)}
        </div>
      </div>

      {Number.isFinite(contentId) && (
        <CommentSection contentId={contentId} />
      )}
    </div>
  );
};

export default ContentDetails;

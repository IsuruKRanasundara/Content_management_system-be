import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { Save, X } from 'lucide-react';

const ContentEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Published'>('Draft');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchContent();
    }
  }, [id]);

  const fetchContent = async () => {
    try {
      const response = await api.get(`/contents/${id}`);
      const { title, body, status, categoryId } = response.data;
      setTitle(title);
      setBody(body);
      setStatus(status);
      setCategoryId(categoryId);
    } catch (error) {
      console.error('Failed to fetch content', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = { title, body, status, categoryId };

    try {
      if (isEditing) {
        await api.put(`/contents/${id}`, data);
      } else {
        await api.post('/contents', data);
      }
      navigate('/contents');
    } catch (error) {
      console.error('Failed to save content', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          {isEditing ? 'Edit Content' : 'Create New Content'}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {isEditing ? 'Update your content details' : 'Fill in the details to create new content'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter content title"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Content Body *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={12}
              placeholder="Write your content here..."
              style={{ width: '100%', resize: 'vertical', padding: '0.75rem', fontSize: '1rem', lineHeight: 1.6 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Draft' | 'Published')}
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Category ID</label>
              <input
                type="number"
                value={categoryId || ''}
                onChange={(e) => setCategoryId(parseInt(e.target.value) || undefined)}
                placeholder="Optional"
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <button 
              type="button" 
              onClick={() => navigate('/contents')}
              style={{
                padding: '0.75rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              <X size={18} /> Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              <Save size={18} /> {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ContentEditor;

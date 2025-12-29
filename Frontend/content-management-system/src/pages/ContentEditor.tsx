import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { Save, X, Upload, Bold, Italic, List, AlignLeft, Image as ImageIcon } from 'lucide-react';

const ContentEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Published'>('Draft');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<string[]>([]);
  const [mediaUrl, setMediaUrl] = useState('');
  
  // Formatting preferences
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [fontFamily, setFontFamily] = useState<string>('Arial');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');

  const fontSizes = {
    small: '14px',
    medium: '16px',
    large: '18px'
  };

  const fontFamilies = ['Arial', 'Times New Roman', 'Georgia', 'Courier New', 'Verdana', 'Helvetica'];

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
    } catch (error: any) {
      console.error('Failed to fetch content', error);
      setError(error.response?.data?.message || 'Failed to load content. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Debug: Check token before making request
    const token = localStorage.getItem('token');
    console.log('📝 Submitting content, token exists:', !!token);
    if (token) {
      console.log('🔑 Token preview:', token.substring(0, 20) + '...');
      console.log('🔑 Full token length:', token.length);
    }
    
    // Prepare content with formatting metadata
    const contentWithFormatting = {
      title,
      body,
      status,
      categoryId,
      metadata: JSON.stringify({
        fontSize,
        fontFamily,
        textAlign,
        uploadedMedia
      })
    };
    
    console.log('📤 Sending data:', contentWithFormatting);

    try {
      let response;
      if (isEditing) {
        response = await api.put(`/contents/${id}`, contentWithFormatting);
      } else {
        response = await api.post('/contents', contentWithFormatting);
      }
      console.log('✅ Content saved successfully:', response.data);
      navigate('/contents');
    } catch (error: any) {
      console.error('❌ Failed to save content:', error);
      console.error('❌ Error details:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      setError(error.response?.data?.message || error.message || 'Failed to save content. Please check your authentication and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    setError('');

    try {
      // Get user ID from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.userId || user?.id;

      // Upload each file to the backend
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        if (userId) {
          formData.append('userId', userId.toString());
        }

        console.log('📤 Uploading file:', file.name);
        const response = await api.post('/media/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('✅ File uploaded:', response.data);
        return response.data;
      });

      const uploadResults = await Promise.all(uploadPromises);
      
      // Store uploaded media URLs - use relative paths so proxy works
      const mediaUrls = uploadResults.map((item: any) => item.fileUrl);
      
      setUploadedMedia(prev => [...prev, ...mediaUrls]);
      console.log('✅ All media uploaded:', mediaUrls);
    } catch (error: any) {
      console.error('❌ Failed to upload media:', error);
      console.error('❌ Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to upload media. Please try again.');
    } finally {
      setUploadingMedia(false);
    }
  };

  const insertTextFormatting = (formatType: 'bold' | 'italic' | 'list') => {
    const textarea = document.getElementById('contentBody') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = body.substring(start, end);
    let formattedText = '';

    switch (formatType) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        break;
      case 'list':
        formattedText = `\n- ${selectedText || 'list item'}\n`;
        break;
    }

    const newBody = body.substring(0, start) + formattedText + body.substring(end);
    setBody(newBody);
  };

  const insertMediaLink = (mediaUrl: string) => {
    setBody(prev => `${prev}\n![Image](${mediaUrl})\n`);
  };

  const addMediaUrl = () => {
    if (mediaUrl.trim()) {
      setUploadedMedia(prev => [...prev, mediaUrl.trim()]);
      setMediaUrl('');
      console.log('✅ Media URL added:', mediaUrl);
    }
  };

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '0.5rem', margin: 0 }}>
          {isEditing ? 'Edit Content' : 'Create New Content'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
          {isEditing ? 'Update your content details' : 'Fill in the details to create new content'}
        </p>
      </div>

      {error && (
        <div style={{ 
          color: '#ef4444', 
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Title Input */}
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

          {/* Formatting Preferences */}
          <div style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
              Content Formatting Preferences
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Font Size
                </label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value as 'small' | 'medium' | 'large')}
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.9rem' }}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Font Family
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.9rem' }}
                >
                  {fontFamilies.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Text Align
                </label>
                <select
                  value={textAlign}
                  onChange={(e) => setTextAlign(e.target.value as 'left' | 'center' | 'right' | 'justify')}
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.9rem' }}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>
              </div>
            </div>
          </div>

          {/* Formatting Toolbar */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Content Body * 
              <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                (Supports Markdown)
              </span>
            </label>
            
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              marginBottom: '0.5rem',
              padding: '0.5rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-color)',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <button
                type="button"
                onClick={() => insertTextFormatting('bold')}
                title="Bold (Markdown: **text**)"
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  fontSize: '0.875rem'
                }}
              >
                <Bold size={16} /> Bold
              </button>
              
              <button
                type="button"
                onClick={() => insertTextFormatting('italic')}
                title="Italic (Markdown: *text*)"
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  fontSize: '0.875rem'
                }}
              >
                <Italic size={16} /> Italic
              </button>
              
              <button
                type="button"
                onClick={() => insertTextFormatting('list')}
                title="List (Markdown: - item)"
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  fontSize: '0.875rem'
                }}
              >
                <List size={16} /> List
              </button>

              <div style={{ 
                borderLeft: '1px solid var(--border-color)', 
                height: '24px',
                margin: '0 0.25rem'
              }} />

              <label style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                fontSize: '0.875rem'
              }}>
                <Upload size={16} />
                {uploadingMedia ? 'Uploading...' : 'Upload'}
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  disabled={uploadingMedia}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Add Media URL Section */}
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              marginBottom: '0.75rem',
              alignItems: 'stretch'
            }}>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="Or paste media URL (https://...)"
                style={{ 
                  flex: 1,
                  padding: '0.625rem 0.75rem', 
                  fontSize: '0.875rem'
                }}
              />
              <button
                type="button"
                onClick={addMediaUrl}
                disabled={!mediaUrl.trim()}
                style={{
                  padding: '0.625rem 1rem',
                  backgroundColor: mediaUrl.trim() ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  color: mediaUrl.trim() ? 'white' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.375rem',
                  cursor: mediaUrl.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                Add URL
              </button>
            </div>
            
            <textarea
              id="contentBody"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={12}
              placeholder="Write your content here... You can use Markdown formatting."
              style={{ 
                width: '100%', 
                resize: 'vertical', 
                padding: '0.75rem', 
                fontSize: fontSizes[fontSize],
                fontFamily: fontFamily,
                textAlign: textAlign,
                lineHeight: 1.6 
              }}
            />
            
            {/* Uploaded Media Preview */}
            {uploadedMedia.length > 0 && (
              <div style={{ 
                marginTop: '0.75rem',
                padding: '0.75rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <ImageIcon size={16} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Uploaded Media</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {uploadedMedia.map((url, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => insertMediaLink(url)}
                        title="Click to insert into content"
                        style={{
                          padding: '0.5rem',
                          backgroundColor: 'white',
                          border: '1px solid var(--border-color)',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          maxWidth: '150px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        📎 Media {index + 1}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

          <div style={{ 
            display: 'flex', 
            gap: '0.75rem', 
            justifyContent: 'flex-end', 
            marginTop: '1rem', 
            paddingTop: '1.5rem', 
            borderTop: '1px solid var(--border-color)',
            flexWrap: 'wrap'
          }}>
            <button 
              type="button" 
              onClick={() => navigate('/contents')}
              className="btn-secondary"
              style={{
                padding: '0.75rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                opacity: loading ? 0.6 : 1
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

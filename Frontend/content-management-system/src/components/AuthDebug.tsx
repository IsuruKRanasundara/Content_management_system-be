import React from 'react';
import { useAuth } from '../context/AuthContext';

const AuthDebug: React.FC = () => {
  const { user, token, isAuthenticated } = useAuth();
  const localToken = localStorage.getItem('token');
  const localUser = localStorage.getItem('user');

  const handleTestToken = () => {
    console.log('=== AUTH DEBUG ===');
    console.log('Context token:', token);
    console.log('Context user:', user);
    console.log('Context isAuthenticated:', isAuthenticated);
    console.log('localStorage token:', localToken);
    console.log('localStorage user:', localUser);
    console.log('Token match:', token === localToken);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '1rem', 
      right: '1rem', 
      padding: '1rem', 
      backgroundColor: '#333', 
      color: 'white',
      borderRadius: '0.5rem',
      fontSize: '0.75rem',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <h4 style={{ margin: '0 0 0.5rem 0' }}>🔍 Auth Debug</h4>
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>User:</strong> {user?.email || 'None'}
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'None'}
      </div>
      <button 
        onClick={handleTestToken}
        style={{ 
          padding: '0.5rem',
          backgroundColor: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: 'pointer',
          width: '100%',
          fontSize: '0.75rem'
        }}
      >
        Log Full Details
      </button>
    </div>
  );
};

export default AuthDebug;

import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { User } from '../types';
import { Trash2, Users as UsersIcon } from 'lucide-react';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        setUsers(users.filter(u => u.userId !== id));
      } catch (error) {
        console.error('Failed to delete user', error);
      }
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <UsersIcon size={32} color="var(--accent-primary)" />
          <h1 style={{ fontSize: '2.5rem' }}>User Management</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>Manage system users and permissions</p>
      </div>
      
      <div className="card" style={{ overflowX: 'auto', padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ 
              borderBottom: '2px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)'
            }}>
              <th style={{ padding: '1.25rem', fontWeight: 600 }}>ID</th>
              <th style={{ padding: '1.25rem', fontWeight: 600 }}>Username</th>
              <th style={{ padding: '1.25rem', fontWeight: 600 }}>Email</th>
              <th style={{ padding: '1.25rem', fontWeight: 600 }}>Role</th>
              <th style={{ padding: '1.25rem', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '1.25rem', fontWeight: 600, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr 
                key={user.userId} 
                style={{ 
                  borderBottom: index !== users.length - 1 ? '1px solid var(--border-color)' : 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '1.25rem', fontWeight: 500 }}>{user.userId}</td>
                <td style={{ padding: '1.25rem', fontWeight: 500 }}>{user.username}</td>
                <td style={{ padding: '1.25rem', color: 'var(--text-secondary)' }}>{user.email}</td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ 
                    padding: '0.375rem 0.75rem', 
                    borderRadius: '0.375rem', 
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    backgroundColor: 
                      user.role === 'Admin' ? 'rgba(249, 115, 22, 0.1)' : 
                      user.role === 'Editor' ? 'rgba(59, 130, 246, 0.1)' : 
                      'rgba(107, 114, 128, 0.1)',
                    color: 
                      user.role === 'Admin' ? 'var(--accent-primary)' : 
                      user.role === 'Editor' ? '#3b82f6' : 
                      '#6b7280'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ 
                    padding: '0.375rem 0.75rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    backgroundColor: user.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: user.isActive ? '#10b981' : '#ef4444'
                  }}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <button 
                    onClick={() => handleDelete(user.userId)} 
                    style={{ 
                      padding: '0.5rem 1rem', 
                      color: '#ef4444', 
                      background: 'rgba(239, 68, 68, 0.1)', 
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '0.375rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }} className="card">
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>No users found.</p>
        </div>
      )}
    </div>
  );
};

export default UserList;

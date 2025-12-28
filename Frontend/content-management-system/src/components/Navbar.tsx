import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, User as UserIcon, Menu } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    transition: 'background-color 0.2s',
    fontWeight: 500,
  };

  return (
    <nav style={{ 
      padding: '1rem 2rem', 
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'var(--bg-secondary)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" style={{ 
          fontSize: '1.75rem', 
          fontWeight: 'bold', 
          color: 'var(--accent-primary)',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ 
            width: '40px', 
            height: '40px', 
            backgroundColor: 'var(--accent-primary)', 
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}>C</span>
          CMS
        </Link>
        {isAuthenticated && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/contents" style={navLinkStyle}>Contents</Link>
            {user?.role === 'Admin' && <Link to="/users" style={navLinkStyle}>Users</Link>}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={toggleTheme} 
          style={{ 
            padding: '0.5rem', 
            display: 'flex', 
            alignItems: 'center',
            borderRadius: '0.5rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-color)'
            }}>
              <UserIcon size={18} />
              <span style={{ fontWeight: 500 }}>{user?.username}</span>
            </span>
            <button 
              onClick={handleLogout} 
              style={{ 
                padding: '0.5rem 1rem', 
                display: 'flex', 
                alignItems: 'center',
                gap: '0.5rem',
                borderRadius: '0.5rem',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)'
              }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/login" style={{
              ...navLinkStyle,
              border: '1px solid var(--border-color)'
            }}>Login</Link>
            <Link to="/register" className="btn-primary" style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              textDecoration: 'none'
            }}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

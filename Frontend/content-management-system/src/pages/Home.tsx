import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, Users, Shield, Zap, Globe, Lock } from 'lucide-react';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <FileText size={32} />,
      title: 'Content Management',
      description: 'Create, edit, and manage your content with an intuitive interface'
    },
    {
      icon: <Users size={32} />,
      title: 'User Management',
      description: 'Control user access with role-based permissions'
    },
    {
      icon: <Shield size={32} />,
      title: 'Secure & Reliable',
      description: 'Built with security best practices and JWT authentication'
    },
    {
      icon: <Zap size={32} />,
      title: 'Fast & Efficient',
      description: 'Optimized performance for seamless content operations'
    },
    {
      icon: <Globe size={32} />,
      title: 'API First',
      description: 'RESTful API design for easy integration with any platform'
    },
    {
      icon: <Lock size={32} />,
      title: 'Data Protection',
      description: 'Your content is protected with enterprise-grade security'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
        padding: '6rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
            marginBottom: '1.5rem', 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-hover) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Welcome to Modern CMS
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: 'var(--text-secondary)', 
            marginBottom: '3rem', 
            maxWidth: '700px', 
            margin: '0 auto 3rem',
            lineHeight: 1.6
          }}>
            A powerful and flexible content management system built for modern web applications.
            Manage your content efficiently with our intuitive interface.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <Link to="/contents" className="btn-primary" style={{ 
                padding: '1rem 2.5rem', 
                textDecoration: 'none', 
                borderRadius: '0.5rem',
                fontSize: '1.125rem',
                fontWeight: 600,
                display: 'inline-block',
                transition: 'transform 0.2s'
              }}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-primary" style={{ 
                  padding: '1rem 2.5rem', 
                  textDecoration: 'none', 
                  borderRadius: '0.5rem',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  display: 'inline-block'
                }}>
                  Get Started
                </Link>
                <Link to="/contents" style={{ 
                  padding: '1rem 2.5rem', 
                  textDecoration: 'none', 
                  borderRadius: '0.5rem', 
                  border: '2px solid var(--accent-primary)', 
                  color: 'var(--accent-primary)',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  display: 'inline-block',
                  backgroundColor: 'transparent'
                }}>
                  View Contents
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ 
          textAlign: 'center', 
          fontSize: '2.5rem', 
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}>
          Powerful Features
        </h2>
        <p style={{ 
          textAlign: 'center', 
          color: 'var(--text-secondary)', 
          fontSize: '1.125rem',
          marginBottom: '4rem',
          maxWidth: '600px',
          margin: '0 auto 4rem'
        }}>
          Everything you need to manage your content effectively
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem'
        }}>
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="card"
              style={{ 
                padding: '2rem',
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ 
                color: 'var(--accent-primary)', 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '60px',
                height: '60px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '0.75rem',
                border: '2px solid var(--accent-primary)'
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 600 }}>
                {feature.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section style={{ 
          padding: '5rem 2rem',
          backgroundColor: 'var(--bg-secondary)',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>
              Ready to Get Started?
            </h2>
            <p style={{ 
              fontSize: '1.125rem', 
              color: 'var(--text-secondary)', 
              marginBottom: '2rem',
              lineHeight: 1.6
            }}>
              Join thousands of users who trust our CMS for their content management needs.
            </p>
            <Link to="/register" className="btn-primary" style={{ 
              padding: '1rem 3rem', 
              textDecoration: 'none', 
              borderRadius: '0.5rem',
              fontSize: '1.125rem',
              fontWeight: 600,
              display: 'inline-block'
            }}>
              Create Your Account
            </Link>
          </div>
        </section>
      )}
    </>
  );
};

export default Home;

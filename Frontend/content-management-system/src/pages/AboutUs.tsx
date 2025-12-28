import React from 'react';
import { Target, Eye, Heart, Users, Code, Shield, Rocket, Award } from 'lucide-react';

const AboutUs: React.FC = () => {
  const values = [
    {
      icon: <Target size={40} />,
      title: 'Our Mission',
      description: 'To empower businesses and individuals with powerful, intuitive content management tools that simplify digital workflows and enhance productivity.'
    },
    {
      icon: <Eye size={40} />,
      title: 'Our Vision',
      description: 'To become the leading content management platform that bridges the gap between simplicity and advanced functionality, making content management accessible to everyone.'
    },
    {
      icon: <Heart size={40} />,
      title: 'Our Values',
      description: 'We believe in user-centric design, continuous innovation, transparency, and building solutions that truly make a difference in how people manage their digital content.'
    }
    ];
    //about us

  const features = [
    {
      icon: <Code size={32} />,
      title: 'Modern Technology',
      description: 'Built with cutting-edge technologies including React, TypeScript, and Node.js for optimal performance and maintainability.'
    },
    {
      icon: <Shield size={32} />,
      title: 'Security First',
      description: 'Enterprise-grade security with JWT authentication, role-based access control, and data encryption to keep your content safe.'
    },
    {
      icon: <Rocket size={32} />,
      title: 'Continuous Innovation',
      description: 'Regular updates and new features based on user feedback and industry best practices to stay ahead of the curve.'
    },
    {
      icon: <Award size={32} />,
      title: 'Quality Assurance',
      description: 'Rigorous testing and quality standards ensure reliability and excellence in every aspect of our platform.'
    }
  ];

  const team = [
    {
      name: 'Development Team',
      role: 'Full Stack Engineers',
      description: 'Passionate developers building scalable and efficient solutions'
    },
    {
      name: 'Design Team',
      role: 'UX/UI Designers',
      description: 'Creating intuitive and beautiful user experiences'
    },
    {
      name: 'Security Team',
      role: 'Security Experts',
      description: 'Ensuring your data remains protected at all times'
    },
    {
      name: 'Support Team',
      role: 'Customer Success',
      description: 'Dedicated to helping you succeed with our platform'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Users' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' },
    { number: '50+', label: 'Features' }
  ];

  return (
    <>
      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
        padding: '5rem 2rem',
        textAlign: 'center',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '700',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)',
            lineHeight: '1.2'
          }}>
            About Our Platform
          </h1>
          <p style={{ 
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            We're dedicated to revolutionizing content management with innovative solutions 
            that combine simplicity, power, and security. Our platform is designed by developers, 
            for everyone who needs to manage digital content efficiently.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ 
        padding: '3rem 2rem',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem'
        }}>
          {stats.map((stat, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '2.5rem',
                fontWeight: '700',
                color: 'var(--accent-primary)',
                marginBottom: '0.5rem'
              }}>
                {stat.number}
              </div>
              <div style={{ 
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                fontWeight: '500'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission, Vision, Values Section */}
      <section style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {values.map((value, index) => (
              <div 
                key={index}
                style={{
                  padding: '2rem',
                  borderRadius: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ 
                  color: 'var(--accent-primary)',
                  marginBottom: '1rem'
                }}>
                  {value.icon}
                </div>
                <h3 style={{ 
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: 'var(--text-primary)'
                }}>
                  {value.title}
                </h3>
                <p style={{ 
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Sets Us Apart Section */}
      <section style={{ 
        padding: '5rem 2rem',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '3rem',
            color: 'var(--text-primary)'
          }}>
            What Sets Us Apart
          </h2>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {features.map((feature, index) => (
              <div 
                key={index}
                style={{
                  padding: '2rem',
                  borderRadius: '12px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center',
                  transition: 'transform 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div style={{ 
                  color: 'var(--accent-primary)',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ 
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '0.75rem',
                  color: 'var(--text-primary)'
                }}>
                  {feature.title}
                </h3>
                <p style={{ 
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  margin: 0,
                  fontSize: '0.95rem'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '1rem',
            color: 'var(--text-primary)'
          }}>
            Our Team
          </h2>
          <p style={{ 
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            marginBottom: '3rem',
            maxWidth: '700px',
            margin: '0 auto 3rem'
          }}>
            We're a diverse group of talented individuals working together to create 
            the best content management experience for our users.
          </p>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            {team.map((member, index) => (
              <div 
                key={index}
                style={{
                  padding: '2rem',
                  borderRadius: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center',
                  transition: 'transform 0.3s, box-shadow 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ 
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))',
                  margin: '0 auto 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <Users size={40} />
                </div>
                <h3 style={{ 
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)'
                }}>
                  {member.name}
                </h3>
                <div style={{ 
                  fontSize: '0.9rem',
                  color: 'var(--accent-primary)',
                  fontWeight: '500',
                  marginBottom: '0.75rem'
                }}>
                  {member.role}
                </div>
                <p style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section style={{ 
        padding: '5rem 2rem',
        background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-hover) 100%)',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '1.5rem'
          }}>
            Join Us on Our Journey
          </h2>
          <p style={{ 
            fontSize: '1.2rem',
            marginBottom: '2rem',
            opacity: 0.95,
            lineHeight: '1.6'
          }}>
            Be part of a growing community of content creators, managers, and innovators. 
            Together, we're shaping the future of content management.
          </p>
          <div style={{ 
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button style={{
              background: 'white',
              color: 'var(--accent-primary)',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'transform 0.3s, box-shadow 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => window.location.href = '/register'}
            >
              Get Started Today
            </button>
            <button style={{
              background: 'transparent',
              color: 'white',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              border: '2px solid white',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'transform 0.3s, background 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'transparent';
            }}
            onClick={() => window.location.href = '/contact'}
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUs;

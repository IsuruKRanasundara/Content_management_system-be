import React from 'react';
import { Github, Mail, Globe } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-secondary)',
      marginTop: 'auto'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '3rem 2rem 2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem'
      }}>
        <div>
          <h3 style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', marginBottom: '1rem' }}>CMS</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            A modern, powerful content management system designed for efficiency and scalability.
          </p>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><a href="/contents" style={{ color: 'var(--text-secondary)' }}>Contents</a></li>
            <li><a href="/about" style={{ color: 'var(--text-secondary)' }}>About</a></li>
            <li><a href="/docs" style={{ color: 'var(--text-secondary)' }}>Documentation</a></li>
            <li><a href="/contact" style={{ color: 'var(--text-secondary)' }}>Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem' }}>Connect</h4>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
              <Github size={20} />
            </a>
            <a href="#" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
              <Mail size={20} />
            </a>
            <a href="#" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
              <Globe size={20} />
            </a>
          </div>
        </div>
      </div>

      <div style={{ 
        borderTop: '1px solid var(--border-color)', 
        padding: '1.5rem 2rem',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem'
      }}>
        <p>© {new Date().getFullYear()} CMS. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

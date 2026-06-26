import React from 'react';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const Navbar = () => {
  const { user, logout } = useAuth();

  const navbarStyle = {
    height: 'var(--navbar-height)',
    position: 'fixed',
    top: 0,
    right: 0,
    left: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 30px 0 calc(var(--sidebar-width) + 30px)',
    zIndex: 900,
  };

  const logoStyle = {
    fontSize: '1.25rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontFamily: "'Outfit', sans-serif",
  };

  const userSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  };

  const userInfoStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  };

  const nameStyle = {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  };

  const roleStyle = {
    fontSize: '0.75rem',
    color: 'var(--primary)',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  return (
    <header style={navbarStyle}>
      <div style={logoStyle}>EduConnect</div>
      <div style={userSectionStyle}>
        <div style={userInfoStyle}>
          <span style={nameStyle}>{user?.name}</span>
          <span style={roleStyle}>{user?.role}</span>
        </div>
        <Button variant="outline" onClick={logout} style={{ padding: '8px 16px' }}>
          Sair
        </Button>
      </div>
    </header>
  );
};

export default Navbar;

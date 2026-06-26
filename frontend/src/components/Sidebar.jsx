import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { role } = useAuth();

  const sidebarStyle = {
    width: 'var(--sidebar-width)',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    backgroundColor: '#0f172a', // Premium dark sidebar
    color: '#94a3b8',
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '35px',
    zIndex: 1000,
    boxShadow: '4px 0 25px rgba(15, 23, 42, 0.15)',
  };

  const titleStyle = {
    color: '#ffffff',
    fontSize: '1.5rem',
    fontWeight: 800,
    fontFamily: "'Outfit', sans-serif",
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const menuStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    listStyle: 'none',
  };

  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: 'var(--border-radius)',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#94a3b8',
    transition: 'var(--transition)',
  };

  const activeLinkStyle = {
    ...linkStyle,
    color: '#ffffff',
    backgroundColor: 'var(--primary)',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
  };

  return (
    <aside style={sidebarStyle}>
      <div style={titleStyle}>
        <span style={{ color: 'var(--accent)' }}>■</span> EduConnect
      </div>
      <nav>
        <ul style={menuStyle}>
          <li>
            <NavLink
              to="/dashboard"
              style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
            >
              Dashboard
            </NavLink>
          </li>
          
          {role === 'admin' && (
            <li>
              <NavLink
                to="/users"
                style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
              >
                Gerenciar Usuários
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

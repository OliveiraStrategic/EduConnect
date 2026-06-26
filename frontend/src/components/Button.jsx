import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false, fullWidth = false, style = {} }) => {
  const baseStyle = {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    fontWeight: 600,
    padding: '12px 24px',
    borderRadius: 'var(--border-radius)',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'var(--transition)',
    width: fullWidth ? '100%' : 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    ...style,
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--primary)',
      color: '#ffffff',
      boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)',
    },
    secondary: {
      backgroundColor: 'var(--primary-light)',
      color: 'var(--primary)',
    },
    danger: {
      backgroundColor: 'var(--danger)',
      color: '#ffffff',
      boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-color)',
    }
  };

  const activeStyle = {
    ...baseStyle,
    ...variants[variant],
  };

  // Efeito de hover via JS simples ou classes
  const handleMouseEnter = (e) => {
    if (disabled) return;
    if (variant === 'primary') e.target.style.backgroundColor = 'var(--primary-hover)';
    if (variant === 'danger') e.target.style.backgroundColor = 'var(--danger-hover)';
    if (variant === 'outline') e.target.style.backgroundColor = 'var(--bg-primary)';
    e.target.style.transform = 'translateY(-1px)';
  };

  const handleMouseLeave = (e) => {
    if (disabled) return;
    e.target.style.backgroundColor = variants[variant].backgroundColor;
    e.target.style.transform = 'translateY(0)';
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={activeStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
};

export default Button;

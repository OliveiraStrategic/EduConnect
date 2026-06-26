import React from 'react';

const Input = ({ label, type = 'text', value, onChange, placeholder, name, required = false, error = '', style = {} }) => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%',
    ...style,
  };

  const labelStyle = {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  };

  const inputStyle = {
    padding: '12px 16px',
    fontSize: '0.95rem',
    fontFamily: "'Inter', sans-serif",
    borderRadius: 'var(--border-radius)',
    border: error ? '1px solid var(--danger)' : '1px solid var(--border-color)',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: 'var(--text-primary)',
    transition: 'var(--transition)',
    boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.02)',
  };

  const errorStyle = {
    fontSize: '0.75rem',
    color: 'var(--danger)',
    fontWeight: 500,
    marginTop: '2px',
  };

  const handleFocus = (e) => {
    if (!error) {
      e.target.style.borderColor = 'var(--primary)';
      e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.12)';
    }
  };

  const handleBlur = (e) => {
    if (!error) {
      e.target.style.borderColor = 'var(--border-color)';
      e.target.style.boxShadow = 'none';
    }
  };

  return (
    <div style={containerStyle}>
      {label && <label style={labelStyle}>{label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        name={name}
        required={required}
        style={inputStyle}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
};

export default Input;

import React from 'react';

const Loading = () => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    width: '100%',
    gap: '15px',
  };

  const spinnerStyle = {
    width: '50px',
    height: '50px',
    border: '5px solid rgba(79, 70, 229, 0.1)',
    borderTop: '5px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const textStyle = {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  };

  // Cria dinamicamente a animação de rotação caso não esteja no CSS global
  const styleSheet = document.styleSheets[0];
  const spinRule = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
  try {
    styleSheet.insertRule(spinRule, styleSheet.cssRules.length);
  } catch (e) {
    // Silencia se a regra já existir
  }

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      <span style={textStyle}>Carregando dados...</span>
    </div>
  );
};

export default Loading;

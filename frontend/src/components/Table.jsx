import React from 'react';

const Table = ({ headers = [], data = [], renderRow }) => {
  const containerStyle = {
    width: '100%',
    overflowX: 'auto',
    borderRadius: 'var(--border-radius)',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)',
    backgroundColor: '#ffffff',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.875rem',
  };

  const headerRowStyle = {
    backgroundColor: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border-color)',
  };

  const headerCellStyle = {
    padding: '16px 20px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
  };

  const emptyStyle = {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
  };

  return (
    <div style={containerStyle}>
      {data.length === 0 ? (
        <div style={emptyStyle}>Nenhum registro encontrado.</div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr style={headerRowStyle}>
              {headers.map((header, idx) => (
                <th key={idx} style={headerCellStyle}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => renderRow(item, index))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Table;

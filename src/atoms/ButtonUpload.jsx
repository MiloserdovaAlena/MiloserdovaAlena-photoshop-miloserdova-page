import React from 'react';

export default function Button({ onClick, children }) {
  const style = {
    backgroundColor: 'blue',
    color: '#fff',
    borderRadius: '4px',
    textTransform: 'none',
    fontWeight: 500,
    padding: '8px 16px',
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
  };

  return (
    <button style={style} onClick={onClick}>
      {children}
    </button>
  );
}
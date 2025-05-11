import React from 'react';

const tools = [
  { key: 'H', id: 'hand', label: 'Hand (H)', title: 'Pan the image' },
  { key: 'E', id: 'eyedropper', label: 'Eyedropper (E)', title: 'Sample colors' },
];

const toolBarStyle = {
  display: 'flex',
  gap: '5px',
  marginBottom: '10px',
}

const toolBarButtonStyle = {
  padding: '0.5rem 1rem',
  border: '1px solid #ccc',
  background: 'white',
  color: 'black',
  cursor: 'pointer',
}
const toolBarButtonActiveStyle = {
  border: '#007bff',
  background: '#e7f1ff',
}


export default function ToolBar({ activeTool, onSelect }) {
  return (
    <div style={toolBarStyle}>
      {tools.map(tool => (
        <button
          key={tool.id}
          style={{
            ...toolBarButtonStyle,
            ...(activeTool === tool.id && toolBarButtonActiveStyle)
          }}
          onClick={() => onSelect(tool.id)}
          title={tool.title}
        >
          {tool.label}
        </button>
      ))}
    </div>
  );
}
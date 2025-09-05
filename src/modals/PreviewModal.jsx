import React, { useEffect, useRef } from 'react';

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle = {
  background: '#1f1f1f',
  border: '1px solid #444',
  borderRadius: '8px',
  padding: '12px',
  maxWidth: '90vw',
  maxHeight: '90vh',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const canvasWrapStyle = {
  flex: 1,
  minHeight: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#2b2b2b',
  borderRadius: '6px',
  padding: '8px',
};

export default function PreviewModal({ isOpen, onClose, data, width, height, title = 'Просмотр' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !canvasRef.current || !data) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Fit into available area with aspect ratio
    const maxW = Math.floor(window.innerWidth * 0.8);
    const maxH = Math.floor(window.innerHeight * 0.8);
    const scale = Math.min(maxW / width, maxH / height, 1);
    const dw = Math.round(width * scale);
    const dh = Math.round(height * scale);
    canvas.width = dw;
    canvas.height = dh;

    const off = document.createElement('canvas');
    off.width = width; off.height = height;
    const octx = off.getContext('2d');
    const imgData = new ImageData(data, width, height);
    octx.putImageData(imgData, 0, 0);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, dw, dh);
    ctx.drawImage(off, 0, 0, width, height, 0, 0, dw, dh);
  }, [isOpen, data, width, height]);

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, color: '#fff' }}>{title}</h3>
          <button onClick={onClose}>Закрыть</button>
        </div>
        <div style={canvasWrapStyle}>
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
} 
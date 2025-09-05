import { useEffect, useRef, useState } from 'react';

const CanvasSectionStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: 0,
  border: 'none',
  backgroundColor: '#242424',
  position: 'relative',
  overflow: 'hidden',
};
export default function CanvasSection({
  data,
  width,
  height,
  scale = 1,
  interpolationMethod = 'bilinear',
  activeTool,
  onSample
}) {
  const containerRef = useRef();
  const canvasRef = useRef();
  const tempCanvasRef = useRef(document.createElement('canvas'));

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current || !data) return;
    const ctx = canvasRef.current.getContext('2d');
    const tempCtx = tempCanvasRef.current.getContext('2d');

    tempCanvasRef.current.width = width;
    tempCanvasRef.current.height = height;
    const imageData = new ImageData(data, width, height);
    tempCtx.putImageData(imageData, 0, 0);

    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    canvasRef.current.width = scaledWidth;
    canvasRef.current.height = scaledHeight;

    ctx.imageSmoothingEnabled = interpolationMethod === 'bilinear';
    ctx.imageSmoothingQuality = 'high';

    ctx.clearRect(0, 0, scaledWidth, scaledHeight);
    ctx.drawImage(
      tempCanvasRef.current,
      0, 0, width, height,
      0, 0, scaledWidth, scaledHeight
    );
    canvasRef.current.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
  }, [data, width, height, scale, interpolationMethod, offset]);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const handleMouseDown = (e) => {
      if (activeTool !== 'hand') return;
      setDragging(true);
      dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
      e.preventDefault();
    };
    const handleMouseMove = (e) => {
      if (!dragging) return;
      setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    };
    const handleMouseUp = () => setDragging(false);

    c.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      c.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, activeTool, offset]);

  const handleClick = (e) => {
    if (activeTool !== 'eyedropper') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = Math.floor((e.clientX - rect.left) / (rect.width / (width * scale)));
    const rawY = Math.floor((e.clientY - rect.top) / (rect.height / (height * scale)));

    const x = Math.max(0, Math.min(width - 1, rawX));
    const y = Math.max(0, Math.min(height - 1, rawY));

    const tempCtx = tempCanvasRef.current.getContext('2d');
    const [r, g, b, a] = tempCtx.getImageData(x, y, 1, 1).data;
    onSample(
      { r, g, b, a },
      { x, y },
      e.altKey || e.ctrlKey || e.shiftKey
    );
  };

  return (
    <div
      ref={containerRef}
      style={CanvasSectionStyle}
      onClick={handleClick}
      aria-label="Просмотр изображения"
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
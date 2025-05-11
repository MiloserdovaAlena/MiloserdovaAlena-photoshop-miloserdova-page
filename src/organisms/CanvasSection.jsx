import { useEffect, useRef, useState } from 'react';

const CanvasSectionStyle = {
  maxWidth: '90vw',
  maxHeight: '65vh',
  width: 'auto',
  height: 'auto',
  display: 'block',
  margin: '16px auto',
  border: '1px solid #fff',
  backgroundColor: '#f0f0f0',
  position: 'relative',
  overflow: 'auto',
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
    const onMouseDown = e => {
      if (activeTool !== 'hand') return;
      setDragging(true);
      dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    };
    const onMouseMove = e => {
      if (activeTool !== 'hand' || !dragging) return;
      setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    };
    const onMouseUp = () => {
      if (activeTool === 'hand') setDragging(false);
    };
    c.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      c.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [activeTool, dragging, offset]);

  useEffect(() => {
    const onKey = e => {
      if (activeTool !== 'hand') return;
      const step = 10;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
        setOffset(o => ({
          x: o.x + (e.key === 'ArrowLeft' ? step : e.key === 'ArrowRight' ? -step : 0),
          y: o.y + (e.key === 'ArrowUp' ? step : e.key === 'ArrowDown' ? -step : 0),
        }));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeTool]);

  const handleClick = e => {
    if (activeTool !== 'eyedropper') return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const rawX = Math.floor((e.clientX - canvasRect.left) / scale);
    const rawY = Math.floor((e.clientY - canvasRect.top) / scale);
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
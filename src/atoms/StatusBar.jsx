export default function StatusBar({ width, height, depth }) {
  return (
    <div style={{display: 'flex', gap: '12px'}}>
      <p>Ширина: {width}px</p>
      <p>Высота: {height}px</p>
      <p>Глубина: {depth}</p>
    </div>
  );
}
export default function StatusBar({ width, height, depth }) {
  return (
    <div className="image-info">
      <p>Ширина: {width}px</p>
      <p>Высота: {height}px</p>
      <p>Глубина: {depth}</p>
    </div>
  );
}
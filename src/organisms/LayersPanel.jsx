import { useMemo, useRef } from 'react';
import { BlendMode } from '../utils/blending';

const panelStyle = { width: '300px', height: 'calc(100vh - 80px)', borderLeft: '1px solid #444', padding: '8px', color: '#fff', background: '#2b2b2b', boxSizing: 'border-box', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '8px' };
const headerStyle = { display: 'flex', gap: '8px' };
const listStyle = { overflow: 'auto', flex: 1, minHeight: 0 };
const itemStyle = (active) => ({ border: active ? '2px solid #4da3ff' : '1px solid #555', marginBottom: '8px', padding: '8px', background: '#1f1f1f', borderRadius: '4px', cursor: 'pointer' });
const rowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' };
const previewStyle = { width: '64px', height: '64px', background: 'transparent', border: '1px solid #444', imageRendering: 'pixelated' };
const labelStyle = { fontSize: '12px', color: '#ddd' };
const selectStyle = { background: '#2b2b2b', color: '#fff', border: '1px solid #555', borderRadius: '4px' };
const rangeStyle = { width: '100%' };

const blendModeInfo = {
  [BlendMode.NORMAL]: 'Normal: верхний слой поверх нижнего, учитывая альфу.',
  [BlendMode.MULTIPLY]: 'Multiply: умножает цвета, затемняет итог.',
  [BlendMode.SCREEN]: 'Screen: инвертирует, умножает, инвертирует обратно — осветляет.',
  [BlendMode.OVERLAY]: 'Overlay: сочетает multiply и screen в зависимости от яркости базового.',
};

export default function LayersPanel({ layers, activeLayerId, onSetActive, onAddLayer, onRemoveLayer, onToggleVisible, onToggleAlphaVisible, onChangeOpacity, onChangeBlendMode, onMoveUp, onMoveDown, onDeleteAlpha, onAddImage, onAddColor }) {
  const fileInputRef = useRef(null);

  return (
    <div style={panelStyle} aria-label="Окно слоев">
      <div style={headerStyle}>
        <button onClick={() => onAddImage?.()} disabled={layers.length >= 2}>Добавить изображение</button>
        <button onClick={() => onAddColor?.()} disabled={layers.length >= 2}>Добавить цвет</button>
      </div>

      <div style={listStyle}>
        {layers.slice().reverse().map((layer) => (
          <div key={layer.id} style={itemStyle(layer.id === activeLayerId)} onClick={() => onSetActive(layer.id)}>
            <div style={rowStyle}>
              <strong style={{ color: '#fff' }}>{layer.name}</strong>
              <div>
                <button onClick={(e) => { e.stopPropagation(); onMoveUp(layer.id); }} title="Переместить вверх">▲</button>
                <button onClick={(e) => { e.stopPropagation(); onMoveDown(layer.id); }} title="Переместить вниз">▼</button>
                <button onClick={(e) => { e.stopPropagation(); onRemoveLayer(layer.id); }} title="Удалить слой">🗑</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={labelStyle}>Превью</span>
                <canvas width={64} height={64} style={previewStyle} ref={(c) => {
                  if (!c) return;
                  const ctx = c.getContext('2d');
                  const { width, height, data } = layer;
                  const tmp = new ImageData(data, width, height);
                  const off = document.createElement('canvas');
                  off.width = width; off.height = height;
                  const octx = off.getContext('2d');
                  octx.putImageData(tmp, 0, 0);
                  ctx.clearRect(0, 0, 64, 64);
                  const scale = Math.min(64 / width, 64 / height);
                  const w = Math.round(width * scale);
                  const h = Math.round(height * scale);
                  const x = Math.floor((64 - w) / 2);
                  const y = Math.floor((64 - h) / 2);
                  ctx.imageSmoothingEnabled = true;
                  ctx.imageSmoothingQuality = 'high';
                  ctx.drawImage(off, 0, 0, width, height, x, y, w, h);
                }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={labelStyle}>Альфа</span>
                <canvas width={64} height={64} style={previewStyle} title="Предпросмотр альфа-канала" ref={(c) => {
                  if (!c) return;
                  const ctx = c.getContext('2d');
                  const { width, height, data } = layer;
                  const alphaImg = ctx.createImageData(width, height);
                  for (let i = 0; i < width * height; i++) {
                    const ai = i * 4;
                    const a = (layer.alphaVisible === false ? 255 : data[ai + 3]);
                    alphaImg.data[ai + 0] = a;
                    alphaImg.data[ai + 1] = a;
                    alphaImg.data[ai + 2] = a;
                    alphaImg.data[ai + 3] = 255;
                  }
                  const off = document.createElement('canvas');
                  off.width = width; off.height = height;
                  const octx = off.getContext('2d');
                  octx.putImageData(alphaImg, 0, 0);
                  ctx.clearRect(0, 0, 64, 64);
                  const scale = Math.min(64 / width, 64 / height);
                  const w = Math.round(width * scale);
                  const h = Math.round(height * scale);
                  const x = Math.floor((64 - w) / 2);
                  const y = Math.floor((64 - h) / 2);
                  ctx.imageSmoothingEnabled = true;
                  ctx.imageSmoothingQuality = 'high';
                  ctx.drawImage(off, 0, 0, width, height, x, y, w, h);
                }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <div style={rowStyle}>
                  <label style={labelStyle}>Видимость</label>
                  <input type="checkbox" checked={layer.visible} onChange={(e) => onToggleVisible(layer.id, e.target.checked)} />
                </div>

                <div style={rowStyle}>
                  <label style={labelStyle}>Альфа</label>
                  <input type="checkbox" checked={layer.alphaVisible !== false} onChange={(e) => onToggleAlphaVisible(layer.id, e.target.checked)} />
                  <button onClick={(e) => { e.stopPropagation(); onDeleteAlpha(layer.id); }} title="Удалить альфа-канал">✖</button>
                </div>

                <div>
                  <label style={labelStyle}>Непрозрачность: {Math.round((layer.opacity ?? 1) * 100)}%</label>
                  <input style={rangeStyle} type="range" min={0} max={100} value={Math.round((layer.opacity ?? 1) * 100)} onChange={(e) => onChangeOpacity(layer.id, Number(e.target.value) / 100)} />
                </div>

                <div style={rowStyle}>
                  <label style={labelStyle}>Режим</label>
                  <select style={selectStyle} value={layer.blendMode} onChange={(e) => onChangeBlendMode(layer.id, e.target.value)} title={blendModeInfo[layer.blendMode] || ''}>
                    {Object.values(BlendMode).map((m) => (
                      <option key={m} value={m} title={blendModeInfo[m]}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '12px', color: '#bbb', margin: 0 }}>Поддерживается до 2 слоев.</p>
    </div>
  );
} 
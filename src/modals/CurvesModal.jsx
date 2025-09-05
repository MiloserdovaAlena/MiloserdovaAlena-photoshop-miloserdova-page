import { useEffect, useMemo, useState } from 'react';
import { computeHistograms } from '../utils/histogram';
import { buildLUT } from '../utils/curves';

const clamp255 = (v) => Math.max(0, Math.min(255, v|0));

export default function CurvesModal({
  isOpen,
  onClose,
  layer,
  onPreview,
  onApply,
}) {
  const [channel, setChannel] = useState('rgb');
  const [p0in, setP0in]   = useState(0);
  const [p0out, setP0out] = useState(0);
  const [p1in, setP1in]   = useState(255);
  const [p1out, setP1out] = useState(255);
  const [preview, setPreview] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setChannel('rgb');
      setP0in(0); setP0out(0);
      setP1in(255); setP1out(255);
      setPreview(true);
    }
  }, [isOpen]);

  const hist = useMemo(() => {
    if (!layer) return null;
    return computeHistograms(layer.data);
  }, [layer]);

  const lut = useMemo(() => {
    return buildLUT(
      { x: clamp255(p0in), y: clamp255(p0out) },
      { x: clamp255(p1in), y: clamp255(p1out) }
    );
  }, [p0in, p0out, p1in, p1out]);

  useEffect(() => {
    onPreview?.(preview, lut, channel);
  }, [preview, lut, channel, onPreview]);

  if (!isOpen) return null;

  const makePoints = (arr) => {
    if (!arr) return '';
    const max = Math.max(1, ...arr);
    // 256x256 (нижняя линия = 0, верх = max)
    const pts = [];
    for (let x = 0; x < 256; x++) {
      const v = arr[x] / max; // 0..1
      const y = 256 - (v * 256);
      pts.push(`${x},${y.toFixed(2)}`);
    }
    return pts.join(' ');
  };

  const rPts = hist ? makePoints(hist.r) : '';
  const gPts = hist ? makePoints(hist.g) : '';
  const bPts = hist ? makePoints(hist.b) : '';
  const aPts = hist ? makePoints(hist.a) : '';

  // отрисовка ломаной кривых: горизонталь слева, сегмент, горизонталь справа
  const x0 = clamp255(p0in),  y0 = clamp255(p0out);
  const x1 = clamp255(p1in),  y1 = clamp255(p1out);
  const safeX0 = Math.min(x0, x1);            // защитимся от перепутанных входов
  const safeX1 = Math.max(x0, x1);
  const left  = `0,${256 - y0} ${safeX0},${256 - y0}`;
  const mid   = `${safeX0},${256 - y0} ${safeX1},${256 - y1}`;
  const right = `${safeX1},${256 - y1} 255,${256 - y1}`;

  return (
    <dialog open className="resize-modal" style={{
      position: 'fixed',
      right: 16,
      top: 16,
      margin: 0,
      maxWidth: 520,
      background: '#2b2b2b',
      color: '#fff'
    }}>
      <h3 style={{marginTop: 0}}>Кривые</h3>

      <div className="form-group">
        <label>Канал</label>
        <div style={{display:'flex', gap: 12}}>
          <label><input type="radio" checked={channel==='rgb'} onChange={()=>setChannel('rgb')} /> RGB</label>
          <label><input type="radio" checked={channel==='alpha'} onChange={()=>setChannel('alpha')} /> Alpha</label>
        </div>
      </div>

      <div className="form-group">
        <label style={{display:'block', marginBottom: 8}}>Гистограмма и кривая</label>
        <div style={{border:'1px solid #555', background:'#1f1f1f', width: 256, height: 256}}>
          <svg width="256" height="256" viewBox="0 0 256 256">
            {/* сетка */}
            {[0,51,102,153,204,255].map((x)=>(
              <line key={'v'+x} x1={x} y1="0" x2={x} y2="256" stroke="#333" strokeWidth="1"/>
            ))}
            {[0,51,102,153,204,255].map((y)=>(
              <line key={'h'+y} x1="0" y1={y} x2="256" y2={y} stroke="#333" strokeWidth="1"/>
            ))}

            {/* диагональ (y=x) */}
            <line x1="0" y1="256" x2="256" y2="0" stroke="#3b82f6" strokeWidth="1" />

            {/* гистограммы */}
            {channel==='rgb' ? (
              <>
                <polyline points={rPts} fill="none" stroke="red"   strokeWidth="1" opacity="0.6" />
                <polyline points={gPts} fill="none" stroke="lime"  strokeWidth="1" opacity="0.6" />
                <polyline points={bPts} fill="none" stroke="cyan"  strokeWidth="1" opacity="0.6" />
              </>
            ) : (
              <polyline points={aPts} fill="none" stroke="#aaa" strokeWidth="1" opacity="0.9" />
            )}

            {/* ломаная коррекции */}
            <polyline points={`${left} ${mid} ${right}`} fill="none" stroke="#bbb" strokeWidth="2" />
            {/* точки */}
            <circle cx={safeX0} cy={256 - y0} r="4" fill="#1f1f1f" stroke="#bbb" strokeWidth="2" />
            <circle cx={safeX1} cy={256 - y1} r="4" fill="#bbb" />
          </svg>
        </div>
      </div>

      <div className="form-group" style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8}}>
        <div>
          <label>Вход 1</label>
          <input type="number" min={0} max={255} value={p0in}
                 onChange={(e)=>setP0in(clamp255(e.target.value))}
                 style={{width:'100%'}} />
        </div>
        <div>
          <label>Выход 1</label>
          <input type="number" min={0} max={255} value={p0out}
                 onChange={(e)=>setP0out(clamp255(e.target.value))}
                 style={{width:'100%'}} />
        </div>
        <div>
          <label>Вход 2</label>
          <input type="number" min={0} max={255} value={p1in}
                 onChange={(e)=>setP1in(clamp255(e.target.value))}
                 style={{width:'100%'}} />
        </div>
        <div>
          <label>Выход 2</label>
          <input type="number" min={0} max={255} value={p1out}
                 onChange={(e)=>setP1out(clamp255(e.target.value))}
                 style={{width:'100%'}} />
        </div>
      </div>

      <div className="form-group">
        <label>
          <input type="checkbox" checked={preview} onChange={(e)=>setPreview(e.target.checked)} /> Предпросмотр
        </label>
      </div>

      <div className="button-group">
        <button onClick={() => {
          setP0in(0); setP0out(0); setP1in(255); setP1out(255);
        }}>Сброс</button>

        <button onClick={() => onApply(lut, channel)}>Применить</button>

        <button onClick={() => {
          onPreview(false, null, channel);
          onClose();
        }}>Закрыть</button>
      </div>
    </dialog>
  );
}

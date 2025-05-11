import React from 'react';
import { convertRGBtoXYZ, convertXYZtoLab, convertLabToOKLch, contrastRatio } from '../utils/colorConversions';

export default function EyedropperPanel({ samples }) {
  const { first, second } = samples;
  return (
    <div style={{ width: 300, marginLeft: '1rem' }}>
      {!first || !second ? (
        <p>Выберите два цвета: первый — обычным кликом, второй — с Alt/Ctrl/Shift.</p>
      ) : (
        <>
          <div>
            {[first, second].map((s, i) => {
              const xyz = convertRGBtoXYZ(s.color);
              const lab = convertXYZtoLab(xyz);
              const oklch = convertLabToOKLch(lab);
              return (
                <div key={i} style={{ marginBottom: '1rem' }}>
                  <div style={{ width: 40, height: 40, background: `rgba(${s.color.r},${s.color.g},${s.color.b},${s.color.a / 255})` }} />
                  <p>Coords: ({s.coords.x}, {s.coords.y})</p>
                  <p title="Red, Green, Blue [0–255]">RGB: {s.color.r}, {s.color.g}, {s.color.b}</p>
                  <p title="CIE 1931 X and Y">XYZ: {xyz.x.toFixed(2)}, {xyz.y.toFixed(2)}, {xyz.z.toFixed(2)}</p>
                  <p title="Lab lightness L0–127">Lab: {lab.L.toFixed(2)}, {lab.a.toFixed(2)}, {lab.b.toFixed(2)}</p>
                  <p title="OKLch chroma-lightness-hue">OKLch: {oklch.l.toFixed(2)}, {oklch.c.toFixed(2)}, {oklch.h.toFixed(2)}</p>
                </div>
              );
            })}
            <p>Контраст: {contrastRatio(first.color, second.color).toFixed(2)}:1 {contrastRatio(first.color, second.color) < 4.5 ? '(Недостаточный)' : ''}</p>
          </div>
        </>
      )}
    </div>
  );
}
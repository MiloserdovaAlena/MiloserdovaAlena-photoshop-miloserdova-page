const clamp255 = (v) => Math.max(0, Math.min(255, v|0));

/**
 * Формирует LUT по двум точкам:
 * до x0 — горизонталь на y0; между x0..x1 — линейная; после x1 — горизонталь на y1
 */
export function buildLUT(p0, p1) {
  const x0 = Math.min(clamp255(p0.x), clamp255(p1.x));
  const y0 = clamp255(p0.y);
  const x1 = Math.max(clamp255(p0.x), clamp255(p1.x));
  const y1 = clamp255(p1.y);

  const lut = new Uint8Array(256);
  for (let x = 0; x < 256; x++) {
    let y;
    if (x <= x0) y = y0;
    else if (x >= x1) y = y1;
    else {
      const t = (x - x0) / Math.max(1, (x1 - x0));
      y = y0 + t * (y1 - y0);
    }
    lut[x] = clamp255(Math.round(y));
  }
  return lut;
}

/** Применение LUT к RGBA-массиву. channel: 'rgb' | 'alpha' */
export function applyLUTToImageData(src /*Uint8ClampedArray*/, lut /*Uint8Array*/, channel) {
  const out = new Uint8ClampedArray(src.length);
  for (let i = 0; i < src.length; i += 4) {
    if (channel === 'rgb') {
      out[i+0] = lut[src[i+0]];
      out[i+1] = lut[src[i+1]];
      out[i+2] = lut[src[i+2]];
      out[i+3] = src[i+3];
    } else { // alpha
      out[i+0] = src[i+0];
      out[i+1] = src[i+1];
      out[i+2] = src[i+2];
      out[i+3] = lut[src[i+3]];
    }
  }
  return out;
}

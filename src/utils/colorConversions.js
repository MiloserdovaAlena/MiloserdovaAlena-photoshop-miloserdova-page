export function convertRGBtoXYZ({ r, g, b }) {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const lin = c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const [rL, gL, bL] = [lin(R), lin(G), lin(B)];
  const x = rL * 0.4124 + gL * 0.3576 + bL * 0.1805;
  const y = rL * 0.2126 + gL * 0.7152 + bL * 0.0722;
  const z = rL * 0.0193 + gL * 0.1192 + bL * 0.9505;
  return { x: x * 100, y: y * 100, z: z * 100 };
}

export function convertXYZtoLab({ x, y, z }) {
  const refX = 95.047, refY = 100.0, refZ = 108.883;
  const f = t => t > 0.008856 ? Math.cbrt(t) : (7.787 * t) + (16 / 116);
  const L = (116 * f(y / refY) - 16) * (127 / 100);
  const a = 500 * (f(x / refX) - f(y / refY));
  const b = 200 * (f(y / refY) - f(z / refZ));
  return { L, a, b };
}

export function convertLabToOKLch({ L, a, b }) {
  const c = Math.hypot(a, b);
  const h = Math.atan2(b, a) * (180 / Math.PI);
  return { l: L, c, h };
}

export function contrastRatio(c1, c2) {
  const lum = ({ r, g, b }) => {
    const toLin = v => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const [R, G, B] = [r, g, b].map(toLin);
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };
  const L1 = lum(c1), L2 = lum(c2);
  const [bright, dark] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (bright + 0.05) / (dark + 0.05);
}

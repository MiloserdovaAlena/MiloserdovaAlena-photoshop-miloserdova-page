export function computeHistograms(data /* Uint8ClampedArray RGBA... */) {
  const r = new Uint32Array(256);
  const g = new Uint32Array(256);
  const b = new Uint32Array(256);
  const a = new Uint32Array(256);

  for (let i = 0; i < data.length; i += 4) {
    r[data[i+0]]++;
    g[data[i+1]]++;
    b[data[i+2]]++;
    a[data[i+3]]++;
  }
  return { r, g, b, a };
}

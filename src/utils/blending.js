export const BlendMode = {
  NORMAL: 'normal',
  MULTIPLY: 'multiply',
  SCREEN: 'screen',
  OVERLAY: 'overlay',
};

function clamp01(x) {
  return Math.min(1, Math.max(0, x));
}

function blendChannel(a, b, mode) {
  switch (mode) {
    case BlendMode.MULTIPLY:
      return a * b;
    case BlendMode.SCREEN:
      return 1 - (1 - a) * (1 - b);
    case BlendMode.OVERLAY:
      return a < 0.5 ? (2 * a * b) : (1 - 2 * (1 - a) * (1 - b));
    case BlendMode.NORMAL:
    default:
      return b; // top replaces based on alpha later
  }
}

export function blendPixel(dstR, dstG, dstB, dstA, srcR, srcG, srcB, srcA, mode) {
  const Da = dstA / 255;
  const Sa = srcA / 255;
  const outA = Sa + Da * (1 - Sa);
  if (outA === 0) {
    return [0, 0, 0, 0];
  }

  const dr = dstR / 255, dg = dstG / 255, db = dstB / 255;
  const sr = srcR / 255, sg = srcG / 255, sb = srcB / 255;

  // Precompute blended color (ignoring alpha), then alpha composite
  const br = blendChannel(dr, sr, mode);
  const bg = blendChannel(dg, sg, mode);
  const bb = blendChannel(db, sb, mode);

  // Porter-Duff source-over with blended color as source
  const outR = (sr * Sa + dr * Da * (1 - Sa));
  const outG = (sg * Sa + dg * Da * (1 - Sa));
  const outB = (sb * Sa + db * Da * (1 - Sa));

  // Replace src terms with blended values
  const outR2 = (br * Sa + dr * Da * (1 - Sa));
  const outG2 = (bg * Sa + dg * Da * (1 - Sa));
  const outB2 = (bb * Sa + db * Da * (1 - Sa));

  return [
    Math.round(clamp01(outR2) * 255),
    Math.round(clamp01(outG2) * 255),
    Math.round(clamp01(outB2) * 255),
    Math.round(clamp01(outA) * 255),
  ];
}

// layer: { id, data: Uint8ClampedArray, opacity: 0..1, visible: boolean, blendMode, width, height, alphaVisible: boolean, alphaMask?: Uint8ClampedArray }
export function compositeLayers(baseWidth, baseHeight, layers) {
  const out = new Uint8ClampedArray(baseWidth * baseHeight * 4);

  for (let i = 0; i < baseWidth * baseHeight; i++) {
    let r = 0, g = 0, b = 0, a = 0;
    for (const layer of layers) {
      if (!layer.visible) continue;
      const idx = i * 4;
      const lr = layer.data[idx + 0];
      const lg = layer.data[idx + 1];
      const lb = layer.data[idx + 2];
      let la = layer.data[idx + 3];

      // Apply alpha mask visibility toggle
      if (layer.alphaMask) {
        const maskA = layer.alphaMask[idx + 3] ?? 255;
        la = Math.round(la * (maskA / 255));
      }

      // If alpha channel hidden, treat alpha as 255 for preview purposes
      if (layer.alphaVisible === false) {
        la = 255;
      }

      // Apply layer opacity
      la = Math.round(la * clamp01(layer.opacity ?? 1));

      const [nr, ng, nb, na] = blendPixel(
        r, g, b, a,
        lr, lg, lb, la,
        layer.blendMode || BlendMode.NORMAL
      );
      r = nr; g = ng; b = nb; a = na;
    }
    const oi = i * 4;
    out[oi + 0] = r;
    out[oi + 1] = g;
    out[oi + 2] = b;
    out[oi + 3] = a;
  }

  return out;
} 
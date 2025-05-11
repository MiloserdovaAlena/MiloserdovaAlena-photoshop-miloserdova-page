export function nearestNeighbor(src, srcWidth, srcHeight, dstWidth, dstHeight) {
    const dstData = new Uint8ClampedArray(dstWidth * dstHeight * 4);
    const xRatio = srcWidth / dstWidth;
    const yRatio = srcHeight / dstHeight;
  
    for (let y = 0; y < dstHeight; y++) {
      for (let x = 0; x < dstWidth; x++) {
        const srcX = Math.floor(x * xRatio);
        const srcY = Math.floor(y * yRatio);
        const srcIdx = (srcY * srcWidth + srcX) * 4;
        const dstIdx = (y * dstWidth + x) * 4;
  
        dstData.set(src.subarray(srcIdx, srcIdx + 4), dstIdx);
      }
    }
    return dstData;
  }
  
  export function bilinearInterpolation(src, srcWidth, srcHeight, dstWidth, dstHeight) {
    const dstData = new Uint8ClampedArray(dstWidth * dstHeight * 4);
    const xRatio = (srcWidth - 1) / dstWidth;
    const yRatio = (srcHeight - 1) / dstHeight;
  
    for (let y = 0; y < dstHeight; y++) {
      for (let x = 0; x < dstWidth; x++) {
        const gx = x * xRatio;
        const gy = y * yRatio;
        const gxi = Math.floor(gx);
        const gyi = Math.floor(gy);
        const dx = gx - gxi;
        const dy = gy - gyi;
  
        const x1 = Math.min(gxi + 1, srcWidth - 1);
        const y1 = Math.min(gyi + 1, srcHeight - 1);

        const idx00 = (gyi * srcWidth + gxi) * 4;
        const idx01 = (gyi * srcWidth + x1) * 4;
        const idx10 = (y1 * srcWidth + gxi) * 4;
        const idx11 = (y1 * srcWidth + x1) * 4;
  
        for (let ch = 0; ch < 4; ch++) {
          const v00 = src[idx00 + ch];
          const v01 = src[idx01 + ch];
          const v10 = src[idx10 + ch];
          const v11 = src[idx11 + ch];
  
          const val = 
            v00 * (1 - dx) * (1 - dy) +
            v01 * dx * (1 - dy) +
            v10 * (1 - dx) * dy +
            v11 * dx * dy;
  
          dstData[(y * dstWidth + x) * 4 + ch] = Math.round(val);
        }
      }
    }
    return dstData;
  }
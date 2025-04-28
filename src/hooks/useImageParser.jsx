import { useState, useCallback } from 'react';
import { decodePng } from '../utils/decodePng';
import decodeGb7 from '../utils/decodeGb7';

export default function useImageBitParser() {
  const [imageMeta, setImageMeta] = useState({ width: 0, height: 0, depth: 0 });
  const [pixelDataArray, setPixelDataArray] = useState();

  const handleFileInput = useCallback(async (inputElement) => {
    const file = inputElement.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt === 'gb7') {
      const buf = new Uint8Array(await file.arrayBuffer());
      const { width, height, depth, imageData } = decodeGb7(buf);
      setImageMeta({ width, height, depth });
      setPixelDataArray(imageData);
    } else if (fileExt === 'png') {
      const { width, height, bitDepth, colorType } = await decodePng(file);
      const alphaPresent = colorType === 6 || colorType === 4;
      const totalDepth = bitDepth * (alphaPresent ? 4 : 3);

      setImageMeta({ width, height, depth: totalDepth });

      const imageEl = new Image();
      imageEl.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageEl, 0, 0);
        const rawData = ctx.getImageData(0, 0, width, height).data;
        setPixelDataArray(new Uint8ClampedArray(rawData));
      };
      imageEl.src = URL.createObjectURL(file);
    } else {
      const imageEl = new Image();
      imageEl.onload = () => {
        const w = imageEl.width;
        const h = imageEl.height;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageEl, 0, 0);
        const rawData = ctx.getImageData(0, 0, w, h).data;

        setImageMeta({ width: w, height: h, depth: 24 }); //потому что у jpg всегда 24
        setPixelDataArray(new Uint8ClampedArray(rawData));
      };
      imageEl.src = URL.createObjectURL(file);
    }
  }, []);

  return [imageMeta, pixelDataArray, handleFileInput];
}
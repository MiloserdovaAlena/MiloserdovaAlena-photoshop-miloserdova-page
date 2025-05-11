import { useState, useCallback } from 'react';
import { decodePng } from '../utils/decodePng';
import decodeGb7 from '../utils/decodeGb7';
import { nearestNeighbor, bilinearInterpolation } from '../utils/interpolation';

export default function useImageBitParser() {
  const [imageMeta, setImageMeta] = useState({ width: 0, height: 0, depth: 0 });
  const [pixelDataArray, setPixelDataArray] = useState();
  const [interpolationMethod, setInterpolationMethod] = useState('bilinear');

  const setInterpolation = useCallback((method) => {
    setInterpolationMethod(method);
  }, []);

  const resizeImage = useCallback((originalData, srcWidth, srcHeight, newWidth, newHeight) => {
    if (interpolationMethod === 'nearest') {
      return nearestNeighbor(originalData, srcWidth, srcHeight, newWidth, newHeight);
    }
    return bilinearInterpolation(originalData, srcWidth, srcHeight, newWidth, newHeight);
  }, [interpolationMethod]);

  const handleFileInput = useCallback(async (inputElement) => {
    const file = inputElement.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    const processAndSetImage = (width, height, depth, imageData, targetWidth, targetHeight) => {
      const resizedData = resizeImage(imageData, width, height, targetWidth, targetHeight);
      setImageMeta({ width: targetWidth, height: targetHeight, depth });
      setPixelDataArray(resizedData);
    };

    if (fileExt === 'gb7') {
      const buf = new Uint8Array(await file.arrayBuffer());
      const { width, height, depth, imageData } = decodeGb7(buf);
      processAndSetImage(width, height, depth, imageData, width, height);
    
    } else if (fileExt === 'png') {
      const { width, height, bitDepth, colorType } = await decodePng(file);
      const alphaPresent = colorType === 6 || colorType === 4;
      const totalDepth = bitDepth * (alphaPresent ? 4 : 3);

      const imageEl = new Image();
      imageEl.onload = () => {
        const canvas = document.createElement('canvas');
        const [srcWidth, srcHeight] = [width, height];
        
        const maxSize = 1024;
        const scale = Math.min(maxSize/srcWidth, maxSize/srcHeight);
        const [targetWidth, targetHeight] = [
          Math.round(srcWidth * scale),
          Math.round(srcHeight * scale)
        ];

        canvas.width = srcWidth;
        canvas.height = srcHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageEl, 0, 0);
        const originalData = ctx.getImageData(0, 0, srcWidth, srcHeight).data;
        
        processAndSetImage(
          srcWidth, 
          srcHeight, 
          totalDepth,
          new Uint8ClampedArray(originalData),
          targetWidth,
          targetHeight
        );
      };
      imageEl.src = URL.createObjectURL(file);
    
    } else {
      const imageEl = new Image();
      imageEl.onload = () => {
        const canvas = document.createElement('canvas');
        const [srcWidth, srcHeight] = [imageEl.width, imageEl.height];
        
        const maxSize = 1024;
        const scale = Math.min(maxSize/srcWidth, maxSize/srcHeight);
        const [targetWidth, targetHeight] = [
          Math.round(srcWidth * scale),
          Math.round(srcHeight * scale)
        ];

        canvas.width = srcWidth;
        canvas.height = srcHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageEl, 0, 0);
        const originalData = ctx.getImageData(0, 0, srcWidth, srcHeight).data;
        
        processAndSetImage(
          srcWidth, 
          srcHeight, 
          24,
          new Uint8ClampedArray(originalData),
          targetWidth,
          targetHeight
        );
      };
      imageEl.src = URL.createObjectURL(file);
    }
  }, [resizeImage]);

  return [imageMeta, pixelDataArray, handleFileInput, setInterpolation];
}
export default function decodeGb7(buffer) {
  const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  if (
    dataView.getUint8(0) !== 0x47 ||
    dataView.getUint8(1) !== 0x42 ||
    dataView.getUint8(2) !== 0x37 ||
    dataView.getUint8(3) !== 0x1D
  ) {
    throw new Error('Invalid GrayBit-7 signature');
  }

  const headerFlag = dataView.getUint8(5);
  const maskPresent = (headerFlag & 1) === 1;
  const imgWidth = (dataView.getUint8(6) << 8) | dataView.getUint8(7);
  const imgHeight = (dataView.getUint8(8) << 8) | dataView.getUint8(9);
  const dataOffset = 12;

  const pixelBuffer = new Uint8ClampedArray(imgWidth * imgHeight * 4);
  for (let i = 0; i < imgWidth * imgHeight; i++) {
    const byteVal = dataView.getUint8(dataOffset + i);
    const grayValue7 = byteVal & 0b01111111;
    const grayValue8 = Math.floor((grayValue7 / 127) * 255);
    const alphaValue = maskPresent
      ? ((byteVal & 0b10000000) ? 255 : 0)
      : 255;

    const pixelIndex = i * 4;
    pixelBuffer[pixelIndex]     = grayValue8;
    pixelBuffer[pixelIndex + 1] = grayValue8;
    pixelBuffer[pixelIndex + 2] = grayValue8;
    pixelBuffer[pixelIndex + 3] = alphaValue;
  }

  const bitDepth = maskPresent ? 8 : 7;
  return { width: imgWidth, height: imgHeight, depth: bitDepth, imageData: pixelBuffer };
}
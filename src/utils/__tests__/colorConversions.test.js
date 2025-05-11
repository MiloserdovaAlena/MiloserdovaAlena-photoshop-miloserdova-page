import { convertRGBtoXYZ, convertXYZtoLab, convertLabToOKLch, contrastRatio } from '../colorConversions';

describe('colorConversions', () => {
  test('convertRGBtoXYZ should convert white correctly', () => {
    const { x, y, z } = convertRGBtoXYZ({ r:255, g:255, b:255 });
    expect(x).toBeCloseTo(95.047, 2);
    expect(y).toBeCloseTo(100.0, 2);
    expect(z).toBeCloseTo(108.883, 1);
  });

  test('convertXYZtoLab should map D65 white to max lightness', () => {
    const lab = convertXYZtoLab({ x:95.047, y:100.0, z:108.883 });
    expect(lab.L).toBeCloseTo(127, 1);
    expect(lab.a).toBeCloseTo(0, 1);
    expect(lab.b).toBeCloseTo(0, 1);
  });

  test('convertLabToOKLch should compute correct chroma and hue', () => {
    const lab = { L: 50, a: 30, b: 40 };
    const { l, c, h } = convertLabToOKLch(lab);
    expect(l).toBeCloseTo(50, 5);
    expect(c).toBeCloseTo(Math.hypot(30, 40), 5);
    expect(h).toBeCloseTo(Math.atan2(40,30) * (180/Math.PI), 5);
  });

  test('contrastRatio should be 1 for identical colors', () => {
    const ratio = contrastRatio({ r: 128, g:128, b:128 }, { r:128, g:128, b:128 });
    expect(ratio).toBeCloseTo(1, 3);
  });

  test('contrastRatio black vs white should be approx 21:1', () => {
    const ratio = contrastRatio({ r:0, g:0, b:0 }, { r:255, g:255, b:255 });
    expect(ratio).toBeCloseTo(21, 0);
  });
});

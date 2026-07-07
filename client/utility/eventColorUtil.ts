export const lightenColor = (hex: string, type: string, isDark: boolean = false): string => {
  let saturationPercentChange = 0;
  let valuePercentChange = 0;

  if (type === 'border') {
    saturationPercentChange = isDark ? 40 : 50;
    valuePercentChange = isDark ? -10 : 0;
  } else if (type === 'text') {
    saturationPercentChange = isDark ? -20 : 40;
    valuePercentChange = isDark ? 40 : -50;
  } else {
    saturationPercentChange = isDark ? 20 : 0;
    valuePercentChange = isDark ? -30 : 0;
  }

  let { h, s, v } = hexToHSV(hex);
  const isGreen = h >= 60 && h <= 150;
  const greenValue = Math.max(0, -1 * Math.abs(h - 120) + 120) / 120;
  const greenOffset = isGreen && type === 'border' ? -10 * greenValue : 0;

  if (s !== 0) {
    s = Math.max(0, Math.min(100, s + saturationPercentChange));
  }

  v = Math.max(0, Math.min(100, v + valuePercentChange + greenOffset));

  return hsvToHex(h, s, v);
};

// Helper: Converts Hex to HSV
const hexToHSV = (hex: string) => {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let d = max - min;
  let h = 0;
  let s = max === 0 ? 0 : (d / max) * 100;
  let v = max * 100;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s, v };
};

// Helper: Converts HSV to Hex
const hsvToHex = (h: number, s: number, v: number): string => {
  s /= 100;
  v /= 100;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r = 0,
    g = 0,
    b = 0;
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  const toHex = (n: number) =>
    Math.round(n * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

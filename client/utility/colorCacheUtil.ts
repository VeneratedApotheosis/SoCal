//convert Hex to RGB
export const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

//map default colors to custom colors
export const findClosestColor = (targetHex: string, palette: string[]) => {
  const target = hexToRgb(targetHex);
  let closest = palette[0];
  let minDistance = Infinity;

  palette.forEach((color) => {
    const current = hexToRgb(color);
    // Euclidean distance formula: sqrt((r2-r1)^2 + (g2-g1)^2 + (b2-b1)^2)
    const distance = Math.sqrt(Math.pow(target.r - current.r, 2) + Math.pow(target.g - current.g, 2) + Math.pow(target.b - current.b, 2));

    if (distance < minDistance) {
      minDistance = distance;
      closest = color;
    }
  });

  return closest;
};
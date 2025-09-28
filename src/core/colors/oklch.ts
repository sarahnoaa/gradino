// Simple RGB to HSL conversion
export const rgbToHsl = (rgb: [number, number, number]): { h: number; s: number; l: number } => {
  const [r, g, b] = rgb.map(x => x / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

// Convert HSL back to hex
export const hslToHex = (hsl: { h: number; s: number; l: number }): string => {
  const { h, s, l } = hsl;
  
  // Normalize values
  const hNorm = h / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;
  
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs((hNorm * 6) % 2 - 1));
  const m = lNorm - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (0 <= hNorm && hNorm < 1/6) { r = c; g = x; b = 0; }
  else if (1/6 <= hNorm && hNorm < 2/6) { r = x; g = c; b = 0; }
  else if (2/6 <= hNorm && hNorm < 3/6) { r = 0; g = c; b = x; }
  else if (3/6 <= hNorm && hNorm < 4/6) { r = 0; g = x; b = c; }
  else if (4/6 <= hNorm && hNorm < 5/6) { r = x; g = 0; b = c; }
  else if (5/6 <= hNorm && hNorm < 1) { r = c; g = 0; b = x; }
  
  const toHex = (n: number) => {
    const value = Math.max(0, Math.min(255, Math.round((n + m) * 255)));
    const hex = value.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Interpolate between two HSL colors
export const interpolateHsl = (
  start: { h: number; s: number; l: number },
  end: { h: number; s: number; l: number },
  steps: number
): { h: number; s: number; l: number }[] => {
  const colors: { h: number; s: number; l: number }[] = [];
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    colors.push({
      h: start.h + (end.h - start.h) * t,
      s: start.s + (end.s - start.s) * t,
      l: start.l + (end.l - start.l) * t
    });
  }
  
  return colors;
};

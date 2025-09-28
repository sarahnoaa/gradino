import { converter, interpolate, formatHex } from 'culori';

// Convert RGB array to culori color object
export const rgbToColor = (rgbArray: [number, number, number]) => {
  return { 
    mode: 'rgb', 
    r: rgbArray[0] / 255, 
    g: rgbArray[1] / 255, 
    b: rgbArray[2] / 255 
  };
};

// Generate perceptually uniform color gradient using culori's built-in interpolator
export const generateColorGradient = (
  startRgb: [number, number, number],
  endRgb: [number, number, number],
  steps: number
): string[] => {
  // Convert RGB arrays to culori color objects
  const startColor = rgbToColor(startRgb);
  const endColor = rgbToColor(endRgb);
  
  // Create interpolator in OKLab color space (perceptually uniform)
  const interpolator = interpolate([startColor, endColor], 'oklab');
  
  // Generate gradient steps
  const gradient: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const interpolatedColor = interpolator(t);
    gradient.push(formatHex(interpolatedColor));
  }
  
  return gradient;
};

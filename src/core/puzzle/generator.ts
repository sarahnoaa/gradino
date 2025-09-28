import { getPrimaryById, PrimaryId } from '../colors/primaries';
import { rgbToHsl, hslToHex, interpolateHsl } from '../colors/oklch';

export interface Tile {
  id: string;
  hex: string;
  hsl: { h: number; s: number; l: number };
  isAnchor: boolean;
  label?: string;
}

export interface Puzzle {
  slots: number;
  anchors: {
    start: Tile;
    end: Tile;
  };
  tiles: Tile[];
  solutionOrder: string[];
}

// Generate the first puzzle: Cool Blue → Cool Yellow with 5 total tiles
export const generateFirstPuzzle = (): Puzzle => {
  const startPrimary = getPrimaryById('CB'); // Cool Blue
  const endPrimary = getPrimaryById('CY'); // Cool Yellow
  
  if (!startPrimary || !endPrimary) {
    throw new Error('Primary colors not found');
  }

  // Convert to HSL
  const startHsl = rgbToHsl(startPrimary.rgb);
  const endHsl = rgbToHsl(endPrimary.rgb);
  

  // Create anchor tiles
  const startTile: Tile = {
    id: 'start',
    hex: startPrimary.hex,
    hsl: startHsl,
    isAnchor: true,
    label: startPrimary.name
  };

  const endTile: Tile = {
    id: 'end',
    hex: endPrimary.hex,
    hsl: endHsl,
    isAnchor: true,
    label: endPrimary.name
  };

  // Generate 3 intermediate colors (5 total - 2 anchors = 3 intermediate)
  const intermediateHsl = interpolateHsl(startHsl, endHsl, 4); // 4 steps gives us 5 colors total
  const intermediateTiles: Tile[] = intermediateHsl
    .slice(1, -1) // Remove first and last (anchors)
    .map((hsl, index) => ({
      id: `intermediate-${index}`,
      hex: hslToHex(hsl),
      hsl,
      isAnchor: false,
      label: `Step ${index + 1}`
    }));

  // Shuffle the intermediate tiles for the tray
  const shuffledTiles = [...intermediateTiles].sort(() => Math.random() - 0.5);

  // Solution order: start, intermediate tiles in order, end
  const solutionOrder = [
    startTile.id,
    ...intermediateTiles.map(t => t.id),
    endTile.id
  ];

  return {
    slots: 5,
    anchors: {
      start: startTile,
      end: endTile
    },
    tiles: shuffledTiles,
    solutionOrder
  };
};

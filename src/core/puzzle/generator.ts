import { getPrimaryById, PrimaryId } from '../colors/primaries';
import { generateColorGradient } from '../colors/oklch';

export interface Tile {
  id: string;
  hex: string;
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

  // Generate perceptually uniform gradient using culori's OKLab interpolator
  const gradient = generateColorGradient(startPrimary.rgb, endPrimary.rgb, 4); // 4 steps gives us 5 colors total
  
  console.log('Generated gradient:', gradient);

  // Create anchor tiles
  const startTile: Tile = {
    id: 'start',
    hex: startPrimary.hex,
    isAnchor: true,
    label: startPrimary.name
  };

  const endTile: Tile = {
    id: 'end',
    hex: endPrimary.hex,
    isAnchor: true,
    label: endPrimary.name
  };

  // Create intermediate tiles from gradient (skip first and last - those are anchors)
  const intermediateTiles: Tile[] = gradient
    .slice(1, -1) // Remove first and last (anchors)
    .map((hex, index) => {
      console.log(`Intermediate ${index}: ${hex}`);
      return {
        id: `intermediate-${index}`,
        hex,
        isAnchor: false,
        label: `Step ${index + 1}`
      };
    });

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

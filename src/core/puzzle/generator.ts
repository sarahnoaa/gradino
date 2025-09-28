import { getPrimaryById, PrimaryId } from '../colors/primaries';
import { generateColorGradient } from '../colors/oklch';
import { PUZZLE_DEFINITIONS, PuzzleDefinition } from './levels';

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

// Generate a puzzle for a specific level
export const generatePuzzle = (level: number): Puzzle => {
  const definition = PUZZLE_DEFINITIONS[level];
  if (!definition) {
    throw new Error(`No puzzle definition found for level ${level}`);
  }

  const startPrimary = getPrimaryById(definition.colors[0] as PrimaryId);
  const endPrimary = getPrimaryById(definition.colors[1] as PrimaryId);
  
  if (!startPrimary || !endPrimary) {
    throw new Error('Primary colors not found');
  }

  // Generate perceptually uniform gradient using culori's OKLab interpolator
  // We need gradations + 1 colors total (gradations intermediate + 2 anchors)
  const gradient = generateColorGradient(startPrimary.rgb, endPrimary.rgb, definition.gradations + 1);
  
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
    slots: definition.gradations + 2, // gradations + 2 anchors
    anchors: {
      start: startTile,
      end: endTile
    },
    tiles: shuffledTiles,
    solutionOrder
  };
};

// Backward compatibility - generates level 1 puzzle
export const generateFirstPuzzle = (): Puzzle => {
  return generatePuzzle(1);
};

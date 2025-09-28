import { getPrimaryById, PrimaryId } from '../colors/primaries';
import { generateColorGradient } from '../colors/oklch';
import { PUZZLE_DEFINITIONS, PuzzleDefinition } from './levels';

export interface Tile {
  id: string;
  hex: string;
  isAnchor: boolean;
  label?: string;
}

export interface Column {
  slots: number;
  anchors: {
    start: Tile;
    end: Tile;
  };
  tiles: Tile[];
  solutionOrder: string[];
}

export interface SingleColumnPuzzle {
  type: 'single';
  slots: number;
  anchors: {
    start: Tile;
    end: Tile;
  };
  tiles: Tile[];
  solutionOrder: string[];
}

export interface ThreeAnchorPuzzle {
  type: 'three-anchor';
  slots: number;
  anchors: {
    top: Tile;
    middle: Tile;
    bottom: Tile;
  };
  tiles: Tile[];
  solutionOrder: string[];
}

export interface MultiColumnPuzzle {
  type: 'multi';
  columns: Column[];
  tiles: Tile[]; // All tiles from all columns mixed together
  solutionOrder: string[]; // Combined solution order for all columns
}

export type Puzzle = SingleColumnPuzzle | ThreeAnchorPuzzle | MultiColumnPuzzle;

// Generate a single column
const generateColumn = (columnDef: { gradations: number; colors: [string, string] }, columnIndex: number): Column => {
  const startPrimary = getPrimaryById(columnDef.colors[0] as PrimaryId);
  const endPrimary = getPrimaryById(columnDef.colors[1] as PrimaryId);

  if (!startPrimary || !endPrimary) {
    throw new Error('Primary colors not found');
  }

  // Generate perceptually uniform gradient using culori's OKLab interpolator
  const gradient = generateColorGradient(startPrimary.rgb, endPrimary.rgb, columnDef.gradations + 1);

  // Create anchor tiles
  const startTile: Tile = {
    id: `col${columnIndex}-start`,
    hex: startPrimary.hex,
    isAnchor: true,
    label: startPrimary.name
  };

  const endTile: Tile = {
    id: `col${columnIndex}-end`,
    hex: endPrimary.hex,
    isAnchor: true,
    label: endPrimary.name
  };

  // Create intermediate tiles from gradient (skip first and last - those are anchors)
  const intermediateTiles: Tile[] = gradient
    .slice(1, -1) // Remove first and last (anchors)
    .map((hex, index) => ({
      id: `col${columnIndex}-intermediate-${index}`,
      hex,
      isAnchor: false,
      label: `Step ${index + 1}`
    }));

  // Solution order: start, intermediate tiles in order, end
  const solutionOrder = [
    startTile.id,
    ...intermediateTiles.map(t => t.id),
    endTile.id
  ];

  return {
    slots: columnDef.gradations + 2, // gradations + 2 anchors
    anchors: {
      start: startTile,
      end: endTile
    },
    tiles: intermediateTiles,
    solutionOrder
  };
};

// Generate a puzzle for a specific level
export const generatePuzzle = (level: number): Puzzle => {
  const definition = PUZZLE_DEFINITIONS[level];
  if (!definition) {
    throw new Error(`No puzzle definition found for level ${level}`);
  }

  if (definition.type === 'single') {
    // Generate single column puzzle
    const column = generateColumn({ gradations: definition.gradations, colors: definition.colors }, 0);
    
    // Shuffle the intermediate tiles for the tray
    const shuffledTiles = [...column.tiles].sort(() => Math.random() - 0.5);

    return {
      type: 'single',
      slots: column.slots,
      anchors: column.anchors,
      tiles: shuffledTiles,
      solutionOrder: column.solutionOrder
    };
  } else if (definition.type === 'three-anchor') {
    // Generate three-anchor puzzle
    const topPrimary = getPrimaryById(definition.colors[0] as PrimaryId);
    const middlePrimary = getPrimaryById(definition.colors[1] as PrimaryId);
    const bottomPrimary = getPrimaryById(definition.colors[2] as PrimaryId);

    if (!topPrimary || !middlePrimary || !bottomPrimary) {
      throw new Error('Primary colors not found');
    }

    // Generate top gradient (top to middle)
    const topGradient = generateColorGradient(topPrimary.rgb, middlePrimary.rgb, definition.topGradations + 1);
    
    // Generate bottom gradient (middle to bottom)
    const bottomGradient = generateColorGradient(middlePrimary.rgb, bottomPrimary.rgb, definition.bottomGradations + 1);

    // Create anchor tiles
    const topTile: Tile = {
      id: 'top',
      hex: topPrimary.hex,
      isAnchor: true,
      label: topPrimary.name
    };

    const middleTile: Tile = {
      id: 'middle',
      hex: middlePrimary.hex,
      isAnchor: true,
      label: middlePrimary.name
    };

    const bottomTile: Tile = {
      id: 'bottom',
      hex: bottomPrimary.hex,
      isAnchor: true,
      label: bottomPrimary.name
    };

    // Create intermediate tiles from gradients (skip first and last - those are anchors)
    const topIntermediateTiles: Tile[] = topGradient
      .slice(1, -1) // Remove first and last (anchors)
      .map((hex, index) => ({
        id: `top-intermediate-${index}`,
        hex,
        isAnchor: false,
        label: `Top Step ${index + 1}`
      }));

    const bottomIntermediateTiles: Tile[] = bottomGradient
      .slice(1, -1) // Remove first and last (anchors)
      .map((hex, index) => ({
        id: `bottom-intermediate-${index}`,
        hex,
        isAnchor: false,
        label: `Bottom Step ${index + 1}`
      }));

    // Combine all intermediate tiles
    const allIntermediateTiles = [...topIntermediateTiles, ...bottomIntermediateTiles];
    const shuffledTiles = [...allIntermediateTiles].sort(() => Math.random() - 0.5);

    // Solution order: top, top intermediates, middle, bottom intermediates, bottom
    const solutionOrder = [
      topTile.id,
      ...topIntermediateTiles.map(t => t.id),
      middleTile.id,
      ...bottomIntermediateTiles.map(t => t.id),
      bottomTile.id
    ];

    return {
      type: 'three-anchor',
      slots: definition.topGradations + definition.bottomGradations + 3, // top + bottom + 3 anchors
      anchors: {
        top: topTile,
        middle: middleTile,
        bottom: bottomTile
      },
      tiles: shuffledTiles,
      solutionOrder
    };
  } else {
    // Generate multi-column puzzle
    const columns: Column[] = definition.columns.map((colDef, index) => 
      generateColumn(colDef, index)
    );

    // Combine all intermediate tiles from all columns and shuffle them
    const allTiles = columns.flatMap(col => col.tiles);
    const shuffledTiles = [...allTiles].sort(() => Math.random() - 0.5);

    // Combined solution order for all columns
    const solutionOrder = columns.flatMap(col => col.solutionOrder);

    return {
      type: 'multi',
      columns,
      tiles: shuffledTiles,
      solutionOrder
    };
  }
};

// Backward compatibility - generates level 1 puzzle
export const generateFirstPuzzle = (): Puzzle => {
  return generatePuzzle(1);
};

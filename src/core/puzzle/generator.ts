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

export interface ConnectedGridPuzzle {
  type: 'connected-grid';
  grid: (Tile | null)[][]; // 3x4 grid: [column][row]
  tiles: Tile[]; // All intermediate tiles mixed together
  solutionOrder: string[]; // Combined solution order for all tiles
}

export type Puzzle = SingleColumnPuzzle | ThreeAnchorPuzzle | MultiColumnPuzzle | ConnectedGridPuzzle;

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
  } else if (definition.type === 'multi') {
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
  } else if (definition.type === 'connected-grid') {
    // Generate connected grid puzzle
    const topLeftPrimary = getPrimaryById(definition.corners.topLeft as PrimaryId);
    const topRightPrimary = getPrimaryById(definition.corners.topRight as PrimaryId);
    const bottomLeftPrimary = getPrimaryById(definition.corners.bottomLeft as PrimaryId);
    const bottomRightPrimary = getPrimaryById(definition.corners.bottomRight as PrimaryId);

    if (!topLeftPrimary || !topRightPrimary || !bottomLeftPrimary || !bottomRightPrimary) {
      throw new Error('Corner colors not found');
    }

    // Generate left column gradient (topLeft to bottomLeft)
    const leftGradient = generateColorGradient(topLeftPrimary.rgb, bottomLeftPrimary.rgb, definition.leftGradations + 1);
    
    // Generate right column gradient (topRight to bottomRight)
    const rightGradient = generateColorGradient(topRightPrimary.rgb, bottomRightPrimary.rgb, definition.rightGradations + 1);

    // Generate top middle gradient (topLeft to topRight)
    const topMiddleGradient = generateColorGradient(topLeftPrimary.rgb, topRightPrimary.rgb, 2); // Just 1 intermediate
    
    // Generate bottom middle gradient (bottomLeft to bottomRight)
    const bottomMiddleGradient = generateColorGradient(bottomLeftPrimary.rgb, bottomRightPrimary.rgb, 2); // Just 1 intermediate

    // Create corner tiles
    const topLeftTile: Tile = {
      id: 'top-left',
      hex: topLeftPrimary.hex,
      isAnchor: true,
      label: topLeftPrimary.name
    };

    const topRightTile: Tile = {
      id: 'top-right',
      hex: topRightPrimary.hex,
      isAnchor: true,
      label: topRightPrimary.name
    };

    const bottomLeftTile: Tile = {
      id: 'bottom-left',
      hex: bottomLeftPrimary.hex,
      isAnchor: true,
      label: bottomLeftPrimary.name
    };

    const bottomRightTile: Tile = {
      id: 'bottom-right',
      hex: bottomRightPrimary.hex,
      isAnchor: true,
      label: bottomRightPrimary.name
    };

    // Create intermediate tiles
    console.log('Left gradient (WB → WY):', leftGradient);
    console.log('Right gradient (CB → CY):', rightGradient);
    
    const leftIntermediateTiles: Tile[] = leftGradient
      .slice(1, -1) // Remove first and last (anchors)
      .map((hex, index) => {
        console.log(`Left intermediate ${index}: ${hex}`);
        return {
          id: `left-intermediate-${index}`,
          hex,
          isAnchor: false,
          label: `Left Step ${index + 1}`
        };
      });

    const rightIntermediateTiles: Tile[] = rightGradient
      .slice(1, -1) // Remove first and last (anchors)
      .map((hex, index) => {
        console.log(`Right intermediate ${index}: ${hex}`);
        return {
          id: `right-intermediate-${index}`,
          hex,
          isAnchor: false,
          label: `Right Step ${index + 1}`
        };
      });

    const topMiddleTile: Tile = {
      id: 'top-middle',
      hex: topMiddleGradient[1], // The intermediate color
      isAnchor: false,
      label: 'Top Middle'
    };

    const bottomMiddleTile: Tile = {
      id: 'bottom-middle',
      hex: bottomMiddleGradient[1], // The intermediate color
      isAnchor: false,
      label: 'Bottom Middle'
    };

    // Combine only the intermediate tiles (not the middle tiles)
    const allIntermediateTiles = [...leftIntermediateTiles, ...rightIntermediateTiles];
    const shuffledTiles = [...allIntermediateTiles].sort(() => Math.random() - 0.5);

    // Create 3x4 grid with middle tiles as fixed anchors
    const grid: (Tile | null)[][] = [
      [topLeftTile, null, null, bottomLeftTile], // Left column
      [topMiddleTile, null, null, bottomMiddleTile], // Middle column (fixed)
      [topRightTile, null, null, bottomRightTile] // Right column
    ];

    // Generate solution order by flattening the grid the same way completion check does
    const solutionOrder = grid.flat().map(tile => tile ? tile.id : null);

    return {
      type: 'connected-grid',
      grid,
      tiles: shuffledTiles,
      solutionOrder
    };
  }
};

// Backward compatibility - generates level 1 puzzle
export const generateFirstPuzzle = (): Puzzle => {
  return generatePuzzle(1);
};

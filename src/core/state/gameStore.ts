import { create } from 'zustand';
import { Puzzle, Tile, generatePuzzle } from '../puzzle/generator';
import { TOTAL_LEVELS } from '../puzzle/levels';

interface GameState {
  currentPuzzle: Puzzle | null;
  placedTiles: (Tile | null)[][]; // Array of columns, each with placed tiles
  grid: (Tile | null)[][]; // 2D grid for connected grid puzzles
  trayTiles: Tile[];
  isComplete: boolean;
  moves: number;
  currentLevel: number;
  
  // Actions
  setPuzzle: (puzzle: Puzzle) => void;
  setLevel: (level: number) => void;
  nextLevel: () => void;
  placeTile: (tile: Tile, columnIndex: number, slotIndex: number) => void;
  placeTileInGrid: (tile: Tile, columnIndex: number, rowIndex: number) => void;
  removeTile: (columnIndex: number, slotIndex: number) => void;
  removeTileFromGrid: (columnIndex: number, rowIndex: number) => void;
  checkCompletion: () => void;
  resetPuzzle: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentPuzzle: null,
  placedTiles: [],
  grid: [],
  trayTiles: [],
  isComplete: false,
  moves: 0,
  currentLevel: 1,

  setPuzzle: (puzzle: Puzzle) => {
    if (puzzle.type === 'single') {
      // Single column puzzle
      const initialPlacedTiles = new Array(puzzle.slots).fill(null);
      // Place anchors at start and end
      initialPlacedTiles[0] = puzzle.anchors.start;
      initialPlacedTiles[puzzle.slots - 1] = puzzle.anchors.end;
      
      set({
        currentPuzzle: puzzle,
        placedTiles: [initialPlacedTiles], // Single column in array
        trayTiles: [...puzzle.tiles],
        isComplete: false,
        moves: 0
      });
    } else if (puzzle.type === 'three-anchor') {
      // Three-anchor puzzle
      const initialPlacedTiles = new Array(puzzle.slots).fill(null);
      // Place anchors at top, middle, and bottom
      initialPlacedTiles[0] = puzzle.anchors.top;
      initialPlacedTiles[3] = puzzle.anchors.middle; // Middle anchor is at position 3 (after 2 top intermediates + 1 slot)
      initialPlacedTiles[puzzle.slots - 1] = puzzle.anchors.bottom;
      
      set({
        currentPuzzle: puzzle,
        placedTiles: [initialPlacedTiles], // Single column in array
        grid: [],
        trayTiles: [...puzzle.tiles],
        isComplete: false,
        moves: 0
      });
    } else if (puzzle.type === 'connected-grid') {
      // Connected grid puzzle
      set({
        currentPuzzle: puzzle,
        placedTiles: [],
        grid: puzzle.grid,
        trayTiles: [...puzzle.tiles],
        isComplete: false,
        moves: 0
      });
    } else {
      // Multi-column puzzle
      const initialPlacedTiles = puzzle.columns.map(column => {
        const columnTiles = new Array(column.slots).fill(null);
        // Place anchors at start and end
        columnTiles[0] = column.anchors.start;
        columnTiles[column.slots - 1] = column.anchors.end;
        return columnTiles;
      });
      
      set({
        currentPuzzle: puzzle,
        placedTiles: initialPlacedTiles,
        grid: [],
        trayTiles: [...puzzle.tiles],
        isComplete: false,
        moves: 0
      });
    }
  },

  setLevel: (level: number) => {
    if (level < 1 || level > TOTAL_LEVELS) {
      console.error(`Invalid level: ${level}. Must be between 1 and ${TOTAL_LEVELS}`);
      return;
    }
    
    try {
      const puzzle = generatePuzzle(level);
      get().setPuzzle(puzzle);
      set({ currentLevel: level });
    } catch (error) {
      console.error('Error generating puzzle for level:', level, error);
    }
  },

  nextLevel: () => {
    const state = get();
    const nextLevel = state.currentLevel + 1;
    
    if (nextLevel <= TOTAL_LEVELS) {
      console.log(`Advancing to level ${nextLevel}`);
      get().setLevel(nextLevel);
    } else {
      console.log('All levels completed!');
      // Could show a completion screen or loop back to level 1
      get().setLevel(1);
    }
  },

  placeTile: (tile: Tile, columnIndex: number, slotIndex: number) => {
    const state = get();
    if (!state.currentPuzzle || state.isComplete) return;
    
    const column = state.placedTiles[columnIndex];
    if (!column) return;
    
    // Can't place on anchor slots
    if (slotIndex === 0 || slotIndex === column.length - 1) return;
    
    const newPlacedTiles = [...state.placedTiles];
    const newColumn = [...column];
    const newTrayTiles = [...state.trayTiles];
    
    // If there's already a tile in this slot, return it to tray
    if (newColumn[slotIndex]) {
      newTrayTiles.push(newColumn[slotIndex]!);
    }
    
    // Place the new tile
    newColumn[slotIndex] = tile;
    newPlacedTiles[columnIndex] = newColumn;
    
    // Remove from tray
    const tileIndex = newTrayTiles.findIndex(t => t.id === tile.id);
    if (tileIndex !== -1) {
      newTrayTiles.splice(tileIndex, 1);
    }
    
    set({
      placedTiles: newPlacedTiles,
      trayTiles: newTrayTiles,
      moves: state.moves + 1
    });
    
    // Check completion after placing
    get().checkCompletion();
  },

  removeTile: (columnIndex: number, slotIndex: number) => {
    const state = get();
    if (!state.currentPuzzle || state.isComplete) return;
    
    const column = state.placedTiles[columnIndex];
    if (!column) return;
    
    // Can't remove anchor tiles
    if (slotIndex === 0 || slotIndex === column.length - 1) return;
    
    const tile = column[slotIndex];
    if (!tile) return;
    
    const newPlacedTiles = [...state.placedTiles];
    const newColumn = [...column];
    const newTrayTiles = [...state.trayTiles];
    
    newColumn[slotIndex] = null;
    newPlacedTiles[columnIndex] = newColumn;
    newTrayTiles.push(tile);
    
    set({
      placedTiles: newPlacedTiles,
      trayTiles: newTrayTiles,
      moves: state.moves + 1
    });
  },

  placeTileInGrid: (tile: Tile, columnIndex: number, rowIndex: number) => {
    const state = get();
    if (!state.currentPuzzle || state.isComplete) return;
    
    const newGrid = state.grid.map(col => [...col]);
    const newTrayTiles = [...state.trayTiles];
    
    // If there's already a tile in this slot, return it to tray
    if (newGrid[columnIndex][rowIndex]) {
      newTrayTiles.push(newGrid[columnIndex][rowIndex]!);
    }
    
    // Place the new tile
    newGrid[columnIndex][rowIndex] = tile;
    
    // Remove from tray
    const tileIndex = newTrayTiles.findIndex(t => t.id === tile.id);
    if (tileIndex !== -1) {
      newTrayTiles.splice(tileIndex, 1);
    }
    
    set({
      grid: newGrid,
      trayTiles: newTrayTiles,
      moves: state.moves + 1
    });
    
    // Check completion after placing
    get().checkCompletion();
  },

  removeTileFromGrid: (columnIndex: number, rowIndex: number) => {
    const state = get();
    if (!state.currentPuzzle || state.isComplete) return;
    
    const tile = state.grid[columnIndex][rowIndex];
    if (!tile) return;
    
    const newGrid = state.grid.map(col => [...col]);
    const newTrayTiles = [...state.trayTiles];
    
    newGrid[columnIndex][rowIndex] = null;
    newTrayTiles.push(tile);
    
    set({
      grid: newGrid,
      trayTiles: newTrayTiles,
      moves: state.moves + 1
    });
  },

  checkCompletion: () => {
    const state = get();
    if (!state.currentPuzzle) return;
    
    if (state.currentPuzzle.type === 'single') {
      // Single column completion check
      const column = state.placedTiles[0];
      if (!column) return;
      
      // Check if all slots are filled
      const allFilled = column.every(tile => tile !== null);
      console.log('All slots filled:', allFilled);
      if (!allFilled) return;
      
      // Check if the order matches the solution
      const placedOrder = column.map(tile => tile!.id);
      const isCorrect = JSON.stringify(placedOrder) === JSON.stringify(state.currentPuzzle.solutionOrder);
      
      console.log('Placed order:', placedOrder);
      console.log('Solution order:', state.currentPuzzle.solutionOrder);
      console.log('Is correct:', isCorrect);
      
      if (isCorrect) {
        console.log('PUZZLE COMPLETED! Setting isComplete to true');
        set({ isComplete: true });
      }
    } else if (state.currentPuzzle.type === 'three-anchor') {
      // Three-anchor completion check
      const column = state.placedTiles[0];
      if (!column) return;
      
      // Check if all slots are filled
      const allFilled = column.every(tile => tile !== null);
      console.log('All slots filled:', allFilled);
      if (!allFilled) return;
      
      // Check if the order matches the solution
      const placedOrder = column.map(tile => tile!.id);
      const isCorrect = JSON.stringify(placedOrder) === JSON.stringify(state.currentPuzzle.solutionOrder);
      
      console.log('Placed order:', placedOrder);
      console.log('Solution order:', state.currentPuzzle.solutionOrder);
      console.log('Is correct:', isCorrect);
      
      if (isCorrect) {
        console.log('THREE-ANCHOR PUZZLE COMPLETED! Setting isComplete to true');
        set({ isComplete: true });
      }
    } else if (state.currentPuzzle.type === 'connected-grid') {
      // Connected grid completion check
      const puzzle = state.currentPuzzle;
      
      // Check if all slots are filled
      const allFilled = puzzle.grid.every(column => 
        column.every(tile => tile !== null)
      );
      console.log('All grid slots filled:', allFilled);
      if (!allFilled) return;
      
      // Check if the order matches the solution
      const placedOrder = puzzle.grid.flat().map(tile => tile!.id);
      const isCorrect = JSON.stringify(placedOrder) === JSON.stringify(puzzle.solutionOrder);
      
      console.log('Grid placed order:', placedOrder);
      console.log('Grid solution order:', puzzle.solutionOrder);
      console.log('Grid is correct:', isCorrect);
      
      if (isCorrect) {
        console.log('CONNECTED GRID PUZZLE COMPLETED! Setting isComplete to true');
        set({ isComplete: true });
      }
    } else {
      // Multi-column completion check
      const puzzle = state.currentPuzzle;
      
      // Check if all columns are complete
      const allColumnsComplete = puzzle.columns.every((columnDef, columnIndex) => {
        const column = state.placedTiles[columnIndex];
        if (!column) return false;
        
        // Check if all slots in this column are filled
        const allFilled = column.every(tile => tile !== null);
        if (!allFilled) return false;
        
        // Check if the order matches the solution for this column
        const placedOrder = column.map(tile => tile!.id);
        const isCorrect = JSON.stringify(placedOrder) === JSON.stringify(columnDef.solutionOrder);
        
        console.log(`Column ${columnIndex} - Placed order:`, placedOrder);
        console.log(`Column ${columnIndex} - Solution order:`, columnDef.solutionOrder);
        console.log(`Column ${columnIndex} - Is correct:`, isCorrect);
        
        return isCorrect;
      });
      
      if (allColumnsComplete) {
        console.log('MULTI-COLUMN PUZZLE COMPLETED! Setting isComplete to true');
        set({ isComplete: true });
      }
    }
  },

  resetPuzzle: () => {
    const state = get();
    if (!state.currentPuzzle) return;
    
    // Use the same logic as setPuzzle to reset
    get().setPuzzle(state.currentPuzzle);
  }
}));

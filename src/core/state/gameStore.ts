import { create } from 'zustand';
import { Puzzle, Tile, generatePuzzle } from '../puzzle/generator';
import { TOTAL_LEVELS } from '../puzzle/levels';

interface GameState {
  currentPuzzle: Puzzle | null;
  placedTiles: (Tile | null)[];
  trayTiles: Tile[];
  isComplete: boolean;
  moves: number;
  currentLevel: number;
  
  // Actions
  setPuzzle: (puzzle: Puzzle) => void;
  setLevel: (level: number) => void;
  nextLevel: () => void;
  placeTile: (tile: Tile, slotIndex: number) => void;
  removeTile: (slotIndex: number) => void;
  checkCompletion: () => void;
  resetPuzzle: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentPuzzle: null,
  placedTiles: [],
  trayTiles: [],
  isComplete: false,
  moves: 0,
  currentLevel: 1,

  setPuzzle: (puzzle: Puzzle) => {
    const initialPlacedTiles = new Array(puzzle.slots).fill(null);
    // Place anchors at start and end
    initialPlacedTiles[0] = puzzle.anchors.start;
    initialPlacedTiles[puzzle.slots - 1] = puzzle.anchors.end;
    
    set({
      currentPuzzle: puzzle,
      placedTiles: initialPlacedTiles,
      trayTiles: [...puzzle.tiles],
      isComplete: false,
      moves: 0
    });
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

  placeTile: (tile: Tile, slotIndex: number) => {
    const state = get();
    if (!state.currentPuzzle || state.isComplete) return;
    
    // Can't place on anchor slots
    if (slotIndex === 0 || slotIndex === state.currentPuzzle.slots - 1) return;
    
    const newPlacedTiles = [...state.placedTiles];
    const newTrayTiles = [...state.trayTiles];
    
    // If there's already a tile in this slot, return it to tray
    if (newPlacedTiles[slotIndex]) {
      newTrayTiles.push(newPlacedTiles[slotIndex]!);
    }
    
    // Place the new tile
    newPlacedTiles[slotIndex] = tile;
    
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

  removeTile: (slotIndex: number) => {
    const state = get();
    if (!state.currentPuzzle || state.isComplete) return;
    
    // Can't remove anchor tiles
    if (slotIndex === 0 || slotIndex === state.currentPuzzle.slots - 1) return;
    
    const tile = state.placedTiles[slotIndex];
    if (!tile) return;
    
    const newPlacedTiles = [...state.placedTiles];
    const newTrayTiles = [...state.trayTiles];
    
    newPlacedTiles[slotIndex] = null;
    newTrayTiles.push(tile);
    
    set({
      placedTiles: newPlacedTiles,
      trayTiles: newTrayTiles,
      moves: state.moves + 1
    });
  },

  checkCompletion: () => {
    const state = get();
    if (!state.currentPuzzle) return;
    
    // Check if all slots are filled
    const allFilled = state.placedTiles.every(tile => tile !== null);
    console.log('All slots filled:', allFilled);
    if (!allFilled) return;
    
    // Check if the order matches the solution
    const placedOrder = state.placedTiles.map(tile => tile!.id);
    const isCorrect = JSON.stringify(placedOrder) === JSON.stringify(state.currentPuzzle.solutionOrder);
    
    console.log('Placed order:', placedOrder);
    console.log('Solution order:', state.currentPuzzle.solutionOrder);
    console.log('Is correct:', isCorrect);
    
    if (isCorrect) {
      console.log('PUZZLE COMPLETED! Setting isComplete to true');
      set({ isComplete: true });
    }
  },

  resetPuzzle: () => {
    const state = get();
    if (!state.currentPuzzle) return;
    
    const initialPlacedTiles = new Array(state.currentPuzzle.slots).fill(null);
    initialPlacedTiles[0] = state.currentPuzzle.anchors.start;
    initialPlacedTiles[state.currentPuzzle.slots - 1] = state.currentPuzzle.anchors.end;
    
    set({
      placedTiles: initialPlacedTiles,
      trayTiles: [...state.currentPuzzle.tiles],
      isComplete: false,
      moves: 0
    });
  }
}));

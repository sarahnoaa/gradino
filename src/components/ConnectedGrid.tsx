import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Slot } from './Slot';
import { useGameStore } from '../core/state/gameStore';

export const ConnectedGrid: React.FC = () => {
  const { currentPuzzle, grid, placeTileInGrid, removeTileFromGrid, isComplete } = useGameStore();

  if (!currentPuzzle || currentPuzzle.type !== 'connected-grid') {
    return (
      <View style={styles.container}>
        <Text>No connected grid puzzle loaded</Text>
      </View>
    );
  }

  const handleSlotPress = (columnIndex: number, rowIndex: number) => {
    const tile = grid[columnIndex][rowIndex];
    if (tile) {
      // Check if this is an anchor tile (corners and middle tiles) - can't remove these
      const isAnchor = (columnIndex === 0 && rowIndex === 0) || // top-left
                       (columnIndex === 0 && rowIndex === 3) || // bottom-left
                       (columnIndex === 2 && rowIndex === 0) || // top-right
                       (columnIndex === 2 && rowIndex === 3) || // bottom-right
                       (columnIndex === 1 && rowIndex === 0) || // top-middle
                       (columnIndex === 1 && rowIndex === 3);   // bottom-middle

      if (!isAnchor) {
        // Only remove if it's not an anchor
        removeTileFromGrid(columnIndex, rowIndex);
      }
    }
    // Note: We'll handle placing tiles from tray in the main screen
  };

  // Find the next empty slot that should be filled
  const getNextTargetSlot = () => {
    for (let col = 0; col < grid.length; col++) {
      for (let row = 0; row < grid[col].length; row++) {
        if (grid[col][row] === null) {
          return { column: col, row };
        }
      }
    }
    return null;
  };

  const nextTarget = getNextTargetSlot();

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        {grid.map((column, columnIndex) => (
          <View key={columnIndex} style={styles.column}>
            {column.map((tile, rowIndex) => {
              // Check if this is an anchor tile (corners and middle tiles)
              const isAnchor = (columnIndex === 0 && rowIndex === 0) || // top-left
                              (columnIndex === 0 && rowIndex === 3) || // bottom-left
                              (columnIndex === 2 && rowIndex === 0) || // top-right
                              (columnIndex === 2 && rowIndex === 3) || // bottom-right
                              (columnIndex === 1 && rowIndex === 0) || // top-middle
                              (columnIndex === 1 && rowIndex === 3);   // bottom-middle

              const isNextTarget = nextTarget && 
                                 nextTarget.column === columnIndex && 
                                 nextTarget.row === rowIndex;

              return (
                <Slot
                  key={`${columnIndex}-${rowIndex}`}
                  tile={tile}
                  index={rowIndex}
                  onPress={() => handleSlotPress(columnIndex, rowIndex)}
                  isAnchor={isAnchor}
                  isComplete={isComplete}
                  animationDelay={(columnIndex * 100) + (rowIndex * 100)}
                  isNextTarget={isNextTarget}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  column: {
    flexDirection: 'column',
    alignItems: 'center',
  },
});

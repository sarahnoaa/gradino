import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Slot } from './Slot';
import { ConnectedGrid } from './ConnectedGrid';
import { useGameStore } from '../core/state/gameStore';

export const Board: React.FC = () => {
  const { currentPuzzle, placedTiles, placeTile, removeTile, isComplete } = useGameStore();

  if (!currentPuzzle) {
    return (
      <View style={styles.container}>
        <Text>No puzzle loaded</Text>
      </View>
    );
  }

  const handleSlotPress = (columnIndex: number, slotIndex: number) => {
    const column = placedTiles[columnIndex];
    if (!column) return;
    
    const currentTile = column[slotIndex];
    if (currentTile) {
      // Remove tile if there's one in the slot
      removeTile(columnIndex, slotIndex);
    }
    // Note: We'll handle placing tiles from tray in the main screen
  };

  // Find the next empty slot that should be filled
  const getNextTargetSlot = (columnIndex: number) => {
    if (currentPuzzle.type === 'multi') {
      // Multi-column logic (prioritize Column 1, then Column 2)
      const column1 = placedTiles[0];
      if (column1) {
        for (let i = 1; i < column1.length - 1; i++) { // Skip start and end anchors
          if (column1[i] === null) {
            // Column 1 has empty slots, so only glow Column 1
            return columnIndex === 0 ? i : -1;
          }
        }
      }
      
      // Column 1 is complete, now check Column 2
      if (columnIndex === 1) {
        const column2 = placedTiles[1];
        if (column2) {
          for (let i = 1; i < column2.length - 1; i++) { // Skip start and end anchors
            if (column2[i] === null) {
              return i;
            }
          }
        }
      }
    } else {
      // Single column or three-anchor logic
      const column = placedTiles[columnIndex];
      if (!column) return -1;
      
      for (let i = 1; i < column.length - 1; i++) { // Skip start and end anchors
        if (column[i] === null) {
          return i;
        }
      }
    }
    
    return -1; // No empty slots
  };

  if (currentPuzzle.type === 'connected-grid') {
    // Connected grid layout
    return <ConnectedGrid />;
  } else if (currentPuzzle.type === 'single' || currentPuzzle.type === 'three-anchor') {
    // Single column or three-anchor layout
    const column = placedTiles[0];
    if (!column) return null;
    
    const nextTargetSlot = getNextTargetSlot(0);

    return (
      <View style={styles.container}>
        <View style={styles.slotsContainer}>
          {column.map((tile, index) => {
            let isAnchor = false;
            if (currentPuzzle.type === 'single') {
              isAnchor = index === 0 || index === column.length - 1;
            } else if (currentPuzzle.type === 'three-anchor') {
              isAnchor = index === 0 || index === 3 || index === column.length - 1; // top, middle, bottom
            }
            
            return (
              <Slot
                key={index}
                tile={tile}
                index={index}
                onPress={() => handleSlotPress(0, index)}
                isAnchor={isAnchor}
                isComplete={isComplete}
                animationDelay={index * 100} // Stagger the animations
                isNextTarget={index === nextTargetSlot}
              />
            );
          })}
        </View>
      </View>
    );
  } else {
    // Multi-column layout
    return (
      <View style={styles.container}>
        <View style={styles.multiColumnContainer}>
          {currentPuzzle.columns.map((columnDef, columnIndex) => {
            const column = placedTiles[columnIndex];
            if (!column) return null;
            
            const nextTargetSlot = getNextTargetSlot(columnIndex);

            return (
              <View key={columnIndex} style={styles.column}>
                {column.map((tile, slotIndex) => (
                  <Slot
                    key={`${columnIndex}-${slotIndex}`}
                    tile={tile}
                    index={slotIndex}
                    onPress={() => handleSlotPress(columnIndex, slotIndex)}
                    isAnchor={slotIndex === 0 || slotIndex === column.length - 1}
                    isComplete={isComplete}
                    animationDelay={(columnIndex * 100) + (slotIndex * 100)} // Stagger the animations
                    isNextTarget={slotIndex === nextTargetSlot}
                  />
                ))}
              </View>
            );
          })}
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  slotsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  multiColumnContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  column: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: 20, // Add spacing between columns
  },
});

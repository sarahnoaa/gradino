import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Slot } from './Slot';
import { useGameStore } from '../core/state/gameStore';

export const Board: React.FC = () => {
  const { currentPuzzle, placedTiles, placeTile, removeTile } = useGameStore();


  if (!currentPuzzle) {
    return (
      <View style={styles.container}>
        <Text>No puzzle loaded</Text>
      </View>
    );
  }

  const handleSlotPress = (index: number) => {
    const currentTile = placedTiles[index];
    if (currentTile) {
      // Remove tile if there's one in the slot
      removeTile(index);
    }
    // Note: We'll handle placing tiles from tray in the main screen
  };

  return (
    <View style={styles.container}>
      <View style={styles.slotsContainer}>
        {placedTiles.map((tile, index) => (
          <Slot
            key={index}
            tile={tile}
            index={index}
            onPress={() => handleSlotPress(index)}
            isAnchor={index === 0 || index === currentPuzzle.slots - 1}
          />
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
  slotsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
});

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Tile } from './Tile';
import { useGameStore } from '../core/state/gameStore';

export const Tray: React.FC = () => {
  const { trayTiles, placeTile, placedTiles } = useGameStore();

  const handleTilePress = (tile: any) => {
    // Find the first empty slot (not anchor slots)
    const emptySlotIndex = placedTiles.findIndex((t, index) => 
      t === null && index !== 0 && index !== placedTiles.length - 1
    );
    
    if (emptySlotIndex !== -1) {
      placeTile(tile, emptySlotIndex);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tilesContainer}>
        {trayTiles.map((tile) => (
          <Tile
            key={tile.id}
            tile={tile}
            onPress={() => handleTilePress(tile)}
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
  tilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Tile } from './Tile';
import { useGameStore } from '../core/state/gameStore';

export const Tray: React.FC = () => {
  const { trayTiles, placeTile, placeTileInGrid, placedTiles, grid, currentPuzzle } = useGameStore();

  const handleTilePress = (tile: any) => {
    if (!currentPuzzle) return;
    
    if (currentPuzzle.type === 'connected-grid') {
      // Find the first empty slot in the grid
      for (let columnIndex = 0; columnIndex < grid.length; columnIndex++) {
        for (let rowIndex = 0; rowIndex < grid[columnIndex].length; rowIndex++) {
          if (grid[columnIndex][rowIndex] === null) {
            placeTileInGrid(tile, columnIndex, rowIndex);
            return;
          }
        }
      }
    } else {
      // Find the first empty slot across all columns (not anchor slots)
      for (let columnIndex = 0; columnIndex < placedTiles.length; columnIndex++) {
        const column = placedTiles[columnIndex];
        if (!column) continue;
        
        for (let slotIndex = 1; slotIndex < column.length - 1; slotIndex++) { // Skip anchors
          if (column[slotIndex] === null) {
            placeTile(tile, columnIndex, slotIndex);
            return;
          }
        }
      }
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

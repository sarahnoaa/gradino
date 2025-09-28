import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Tile as TileType } from '../core/puzzle/generator';
import { Tile } from './Tile';

interface SlotProps {
  tile: TileType | null;
  index: number;
  onPress: () => void;
  isAnchor: boolean;
  isComplete?: boolean;
  animationDelay?: number;
  isNextTarget?: boolean;
}

export const Slot: React.FC<SlotProps> = ({ tile, index, onPress, isAnchor, isComplete = false, animationDelay = 0, isNextTarget = false }) => {
  return (
    <TouchableOpacity
      style={[
        styles.slot,
        isAnchor && styles.anchorSlot,
        !tile && !isAnchor && styles.emptySlot,
        isNextTarget && styles.nextTargetSlot
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {tile ? (
        <Tile 
          tile={tile} 
          interactive={false} 
          isComplete={isComplete}
          animationDelay={animationDelay}
        />
      ) : (
        <View style={styles.emptySlotContent}>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  slot: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  anchorSlot: {
    borderWidth: 0, // No border for anchor slots
  },
  emptySlot: {
    backgroundColor: '#f5f5f5',
  },
  emptySlotContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextTargetSlot: {
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});

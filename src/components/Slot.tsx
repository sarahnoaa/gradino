import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Tile as TileType } from '../core/puzzle/generator';
import { Tile } from './Tile';

interface SlotProps {
  tile: TileType | null;
  index: number;
  onPress: () => void;
  isAnchor: boolean;
}

export const Slot: React.FC<SlotProps> = ({ tile, index, onPress, isAnchor }) => {
  return (
    <TouchableOpacity
      style={[
        styles.slot,
        isAnchor && styles.anchorSlot,
        !tile && !isAnchor && styles.emptySlot
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {tile ? (
        <Tile tile={tile} interactive={false} />
      ) : (
        <View style={styles.emptySlotContent}>
          {!isAnchor && <Text style={styles.slotNumber}>{index + 1}</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  slot: {
    width: 80,
    height: 80,
    borderRadius: 12,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  anchorSlot: {
    borderColor: '#333',
    borderWidth: 3,
  },
  emptySlot: {
    backgroundColor: '#f5f5f5',
    borderStyle: 'dashed',
  },
  emptySlotContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotNumber: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Tile as TileType } from '../core/puzzle/generator';

interface TileProps {
  tile: TileType;
  onPress?: () => void;
  style?: any;
  interactive?: boolean;
}

export const Tile: React.FC<TileProps> = ({ tile, onPress, style, interactive = true }) => {
  const tileContent = (
    <View style={[
      styles.tile,
      { backgroundColor: tile.hex },
      style
    ]}>
      {tile.isAnchor && (
        <View style={styles.anchorIndicator}>
          <Text style={styles.anchorText}>★</Text>
        </View>
      )}
    </View>
  );

  if (interactive && onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {tileContent}
      </TouchableOpacity>
    );
  }

  return tileContent;
};

const styles = StyleSheet.create({
  tile: {
    width: 60,
    height: 60,
    borderRadius: 8,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  anchorIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  anchorText: {
    fontSize: 12,
    color: '#333',
  },
});

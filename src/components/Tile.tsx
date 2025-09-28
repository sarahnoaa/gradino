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
});

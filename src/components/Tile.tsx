import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Tile as TileType } from '../core/puzzle/generator';

interface TileProps {
  tile: TileType;
  onPress?: () => void;
  style?: any;
  interactive?: boolean;
  isComplete?: boolean;
  animationDelay?: number;
}

export const Tile: React.FC<TileProps> = ({ tile, onPress, style, interactive = true, isComplete = false, animationDelay = 0 }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isComplete) {
      console.log(`Tile ${tile.id}: Starting pulse animation with delay ${animationDelay}ms`);
      // Start pulse animation after delay
      const timer = setTimeout(() => {
        console.log(`Tile ${tile.id}: Starting pulse animation now`);
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, animationDelay);

      return () => clearTimeout(timer);
    } else {
      scaleAnim.setValue(1);
    }
  }, [isComplete, animationDelay]);

  const tileContent = (
    <Animated.View style={[
      styles.tile,
      { backgroundColor: tile.hex },
      style,
      { 
        transform: [{ scale: scaleAnim }],
      }
    ]}>
    </Animated.View>
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

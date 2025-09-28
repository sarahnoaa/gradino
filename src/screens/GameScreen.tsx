import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { Board } from '../components/Board';
import { Tray } from '../components/Tray';
import { useGameStore } from '../core/state/gameStore';
import { generateFirstPuzzle } from '../core/puzzle/generator';

export const GameScreen: React.FC = () => {
  const { currentPuzzle, setPuzzle, isComplete, moves } = useGameStore();

  useEffect(() => {
    // Generate the first puzzle when the screen loads
    if (!currentPuzzle) {
      try {
        const puzzle = generateFirstPuzzle();
        setPuzzle(puzzle);
      } catch (error) {
        console.error('Error generating puzzle:', error);
      }
    }
  }, [currentPuzzle, setPuzzle]);

  useEffect(() => {
    if (isComplete) {
      Alert.alert(
        'Congratulations!',
        `You completed the puzzle in ${moves} moves!`,
        [{ text: 'OK', onPress: () => {} }]
      );
    }
  }, [isComplete, moves]);

  if (!currentPuzzle) {
    return (
      <View style={styles.container}>
        <Text>Loading puzzle...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.gameTitle}>Gradino</Text>
      </View>
      
      <Board />
      
      <View style={styles.separator} />
      
      <Tray />
      
      {isComplete && (
        <View style={styles.completionOverlay}>
          <Text style={styles.completionText}>🎉 Puzzle Complete! 🎉</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  movesText: {
    fontSize: 16,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 20,
  },
  completionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});

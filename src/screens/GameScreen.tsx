import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Board } from '../components/Board';
import { Tray } from '../components/Tray';
import { useGameStore } from '../core/state/gameStore';
import { generateFirstPuzzle } from '../core/puzzle/generator';

export const GameScreen: React.FC = () => {
  const { currentPuzzle, setPuzzle, isComplete, moves } = useGameStore();
  const [showNextButton, setShowNextButton] = useState(false);
  const nextButtonOpacity = new Animated.Value(0);

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
    console.log('GameScreen: isComplete changed to:', isComplete);
    if (isComplete) {
      console.log('GameScreen: Puzzle completed! Triggering haptic and animations');
      // Trigger haptic feedback immediately
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Show next button after 2 seconds
      setTimeout(() => {
        setShowNextButton(true);
        Animated.timing(nextButtonOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 2000);
    } else {
      setShowNextButton(false);
      nextButtonOpacity.setValue(0);
    }
  }, [isComplete]);

  if (!currentPuzzle) {
    return (
      <View style={styles.container}>
        <Text>Loading puzzle...</Text>
      </View>
    );
  }

  const handleNextPuzzle = () => {
    // For now, just reset the current puzzle
    // Later we can implement actual next puzzle logic
    if (currentPuzzle) {
      setPuzzle(currentPuzzle);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.gameTitle}>Gradino</Text>
      </View>
      
      <Board />
      
      <View style={styles.separator} />
      
      <Tray />
      
      {showNextButton && (
        <Animated.View style={[styles.nextButtonContainer, { opacity: nextButtonOpacity }]}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNextPuzzle}>
            <Text style={styles.nextButtonText}>Next Puzzle</Text>
          </TouchableOpacity>
        </Animated.View>
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
  nextButtonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

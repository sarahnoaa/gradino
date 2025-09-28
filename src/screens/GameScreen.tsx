import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Board } from '../components/Board';
import { Tray } from '../components/Tray';
import { useGameStore } from '../core/state/gameStore';
import { generateFirstPuzzle } from '../core/puzzle/generator';

export const GameScreen: React.FC = () => {
  const { currentPuzzle, setLevel, isComplete, moves, currentLevel, nextLevel } = useGameStore();
  const [showNextButton, setShowNextButton] = useState(false);
  const nextButtonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load the current level when the screen loads
    if (!currentPuzzle) {
      setLevel(currentLevel);
    }
  }, [currentPuzzle, setLevel, currentLevel]);

  // For testing Level 7, uncomment the line below:
  useEffect(() => { setLevel(7); }, [setLevel]);

  useEffect(() => {
    console.log('GameScreen: isComplete changed to:', isComplete);
    if (isComplete) {
      console.log('GameScreen: Puzzle completed! Triggering haptic and animations');
      // Trigger haptic feedback immediately
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Show next button after 500ms
      setTimeout(() => {
        console.log('GameScreen: Setting showNextButton to true');
        setShowNextButton(true);
        Animated.timing(nextButtonOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          console.log('GameScreen: Button animation completed');
        });
      }, 500);
    } else {
      console.log('GameScreen: Puzzle not complete, hiding button');
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

  const handleNextLevel = () => {
    nextLevel();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.gameTitle}>Gradino</Text>
        <Text style={styles.levelText}>Level {currentLevel}</Text>
      </View>
      
      <Board />
      
      <View style={styles.separator} />
      
      <Tray />
      
      {showNextButton && (
        <Animated.View style={[styles.nextButtonContainer, { opacity: nextButtonOpacity }]}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNextLevel}>
            <Text style={styles.nextButtonText}>Next Level</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      {console.log('GameScreen: showNextButton =', showNextButton, 'isComplete =', isComplete)}
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
  levelText: {
    fontSize: 16,
    color: '#666',
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

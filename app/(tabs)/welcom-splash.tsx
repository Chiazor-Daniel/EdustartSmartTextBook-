import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { router } from 'expo-router';

export default function SplashScreen() {
  const scale = useSharedValue(3);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Initial animation
    scale.value = withTiming(1, { duration: 5000 });
    opacity.value = withTiming(1, { duration: 5000 }, () => {
      // Navigation after animation completes
      runOnJS(router.replace)('/welcome');
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value
  }));

  return (
    <View style={styles.container}>
      <Animated.Image 
        source={require('../../assets/robotw.png')} 
        style={[styles.robot, animatedStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  robot: {
    width: 150,
    height: 150
  }
});
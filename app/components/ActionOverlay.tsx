import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions
} from 'react-native';
import { router } from 'expo-router';

interface ActionOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

const options = [
    {
      label: 'STUDY',
      route: '/subjects-list/',
      image: 'https://images.pexels.com/photos/5428264/pexels-photo-5428264.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      label: 'TAKE A TEST',
      route: '/assessment-notification',
      image: 'https://images.pexels.com/photos/4145191/pexels-photo-4145191.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      label: 'PERFORMANCE METRICS',
      route: '/performance',
      image: 'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      label: 'JOIN A CLASS',
      route: '/join-class',
      image: 'https://images.pexels.com/photos/256401/pexels-photo-256401.jpeg?auto=compress&cs=tinysrgb&w=600',
    }
  ];
  

const ActionOverlay = ({ isVisible, onClose }: ActionOverlayProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isVisible]);

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
      <Animated.View style={[styles.gridContainer, { transform: [{ scale }] }]}>
      {options.map((item, index) => (
  <TouchableOpacity
    key={index}
    style={styles.optionButton}
    onPress={() => navigateTo(item.route)}
  >
    <View style={styles.circle}>
      <Image source={{ uri: item.image }} style={styles.image} />
    </View>
    <Text style={styles.label}>{item.label}</Text>
  </TouchableOpacity>
))}

      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  gridContainer: {
    width: width * 0.85,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
  },
  circle: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  label: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ActionOverlay;

import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import LinearBg from './components/LinearBg';

export default function HomeScreen() {
  const handleProceed = () => {
    router.replace('/(auth)/login');
  };

  return (
    <LinearBg>
      <TouchableOpacity 
        style={styles.button}
        onPress={handleProceed}
      >
        <Text style={styles.buttonText}>Proceed</Text>
      </TouchableOpacity>
    </LinearBg>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 8,
  
    width: 200,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

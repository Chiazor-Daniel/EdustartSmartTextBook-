import { View, Text, StyleSheet } from 'react-native';
import LinearBg from '../components/LinearBg';
import Header from '../components/Header';

export default function SubjectsScreen() {
  return (
      <View style={styles.container}>
        <Text style={styles.title}>Subjects</Text>
      </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

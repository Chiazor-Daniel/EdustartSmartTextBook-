import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import LinearBg from './components/LinearBg';

export default function HomeScreen() {
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (token && user) {
      router.replace('/performance');
    } else {
      router.replace('/(auth)/login');
    }
  }, [token, user]);

  return (
    <LinearBg>
      <View style={styles.container}>
        <Image
          source={require('../assets/logon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </LinearBg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 250,
  },
});

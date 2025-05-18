import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
});

export default function AuthLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" options={{
        headerShown: false,
      }} />
      <Stack.Screen name="signup" options={{
        headerShown: false,
      }} />
    </Stack>
  );
}

import { Stack } from 'expo-router';
import LinearBg from '../components/LinearBg';
import Sidebar from '../components/Sidebar';
import ActionOverlay from '../components/ActionOverlay';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNav';
import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { SafeAreaView, Platform, StatusBar, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});

export default function RootLayout() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [actionOverlayVisible, setActionOverlayVisible] = useState(false);
  const isBottomNavVisible = useUIStore((state) => state.isBottomNavVisible);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <LinearBg>
      <Sidebar
        isVisible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />
      <ActionOverlay
        isVisible={actionOverlayVisible}
        onClose={() => setActionOverlayVisible(false)}
      />
      <Header
        toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        toggleActionOverlay={() =>
          setActionOverlayVisible(!actionOverlayVisible)
        }
      />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          gestureEnabled: true,
          contentStyle: { backgroundColor: 'transparent' },
          animationDuration: 100,
        }}
      >
        <Stack.Screen name="welcome" />
        <Stack.Screen name="home" />
        <Stack.Screen name="performance" />
        <Stack.Screen name="assessment-notification" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="join-class" />
        <Stack.Screen name="subjects-list/[subject]" />
        <Stack.Screen name="subjects-list/[subject]/slug/[slug]" />
        <Stack.Screen name="examwise" />
        <Stack.Screen name="examwise/[exam]/slug/[slug]" />
      </Stack>

      {isBottomNavVisible && <BottomNavigation />}
    </LinearBg>
    </SafeAreaView>
  );
}

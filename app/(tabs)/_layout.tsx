import { Stack } from 'expo-router';
import LinearBg from '../components/LinearBg';
import Sidebar from '../components/Sidebar';
import ActionOverlay from '../components/ActionOverlay';
import Header from '../components/Header';
import { useState } from 'react';
import BottomNavigation from '../components/BottomNav';

export default function RootLayout() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [actionOverlayVisible, setActionOverlayVisible] = useState(false);

  return (
    <LinearBg>
      <Sidebar isVisible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      <ActionOverlay 
        isVisible={actionOverlayVisible} 
        onClose={() => setActionOverlayVisible(false)} 
      />
      <Header 
        toggleSidebar={() => setSidebarVisible(!sidebarVisible)} 
        toggleActionOverlay={() => setActionOverlayVisible(!actionOverlayVisible)} 
      />
      
      <Stack
        screenOptions={{
          headerShown: false,
          // Use a more fluid slide animation for transitions
          animation: 'slide_from_right',
          gestureEnabled: true, // Enable swipe gestures for native feel
          contentStyle: { backgroundColor: 'transparent' },
          animationDuration: 200, // Consistent timing
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
      <BottomNavigation />
    </LinearBg>
  );

}
import { Stack } from 'expo-router';
import LinearBg from '../components/LinearBg';
import Sidebar from '../components/Sidebar';
import ActionOverlay from '../components/ActionOverlay';
import Header from '../components/Header';
import { useState } from 'react';

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
          animation: 'fade', // Smooth fade transition between screens
          contentStyle: { backgroundColor: 'transparent' }
        }}
      >
        <Stack.Screen name="splash" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="subjects" />
        <Stack.Screen name="subjects-list/[topics]" />
        <Stack.Screen name="assessment-notification" />
        <Stack.Screen name="join-class" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="profile" />
        {/* Keep your other screens */}
      </Stack>
    </LinearBg>
  );
}
import { useColorScheme } from "@/hooks/useColorScheme";
import { StoreProvider } from "@/providers/StoreProvider";
import { useAuthStore } from "@/store/authStore";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";

SplashScreen.preventAutoHideAsync();

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const { token, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
        // Add any async initialization here
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Auth protection logic
  useEffect(() => {
    if (!appIsReady) return;

    const inAuthGroup = segments[0] === "(auth)";
    const isStudentDiagnosisRoute =
      inAuthGroup && segments[1] === "student-diagnosis";
    const isLoginRoute = inAuthGroup && segments[1] === "login";
    const isSignupRoute = inAuthGroup && segments[1] === "signup";

    // If user is authenticated
    if (token && user) {
      // If user is on login or signup page, redirect to home
      if (isLoginRoute || isSignupRoute) {
        router.replace("/(tabs)/home");
      }
      // Allow authenticated users to access student-diagnosis if they're already there
      // Don't force redirect - let the login flow handle navigation
    } else {
      // User is not authenticated: ensure they are inside the auth group (login/signup).
      if (!inAuthGroup && String(segments[0]) !== "index") {
        router.replace("/(auth)/login");
      }
    }
  }, [token, user, segments, appIsReady, router]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} onLayout={onLayoutRootView}>
      <StoreProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <Toast />
        </ThemeProvider>
      </StoreProvider>
    </SafeAreaView>
  );
}

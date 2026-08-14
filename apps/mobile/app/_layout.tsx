import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, LuckiestGuy_400Regular } from '@expo-google-fonts/luckiest-guy';
import { Colors } from '../constants/colors';
import { useGameSocket } from '../hooks/useGameSocket';
import { soundService } from '../services/soundService';

SplashScreen.preventAutoHideAsync();

function SocketProvider({ children }: { children: React.ReactNode }) {
  useGameSocket();
  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ LuckiestGuy_400Regular });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      soundService.init();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar style="light" />
      <SocketProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            // Web prefers a quick cross-fade; native gets the classic slide
            animation: Platform.OS === 'web' ? 'fade' : 'slide_from_right',
            animationDuration: 220,
          }}
        />
      </SocketProvider>
    </GestureHandlerRootView>
  );
}

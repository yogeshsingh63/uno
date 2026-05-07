import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '../constants/colors';
import { useGameSocket } from '../hooks/useGameSocket';

SplashScreen.preventAutoHideAsync();

function SocketProvider({ children }: { children: React.ReactNode }) {
  useGameSocket();
  return <>{children}</>;
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar style="light" />
      <SocketProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'slide_from_right',
          }}
        />
      </SocketProvider>
    </GestureHandlerRootView>
  );
}

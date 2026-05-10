import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Auto-detect the server URL for mobile:
 * - On web: localhost works fine
 * - On mobile (Expo Go): extract the dev machine's IP from Expo's hostUri
 *   which looks like "192.168.x.x:8081", then use port 8082 on that IP
 */
function getServerUrl(): string {
  // 1. Explicit env var always wins
  const envUrl = process.env.EXPO_PUBLIC_SERVER_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  // 2. On web, localhost is fine
  if (Platform.OS === 'web') {
    return envUrl || 'http://localhost:8082';
  }

  // 3. On mobile, extract IP from Expo's hostUri (modern SDK 54+ API)
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as any).expoGoConfig?.debuggerHost ||
      (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
      (Constants as any).manifest?.debuggerHost;

    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        console.log(`[Socket] Auto-detected server IP: ${ip}`);
        return `http://${ip}:8082`;
      }
    }
  } catch (e) {
    console.warn('[Socket] Could not auto-detect IP:', e);
  }

  // 4. Fallback: try the env url or Android emulator special IP
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8082'; // Android emulator → host machine
  }

  return envUrl || 'http://localhost:8082';
}

const SERVER_URL = getServerUrl();

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(): Socket {
    if (this.socket?.connected) return this.socket;

    this.socket = io(SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['polling', 'websocket'],
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.log('[Socket] Connection error:', err.message);
    });

    return this.socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }
}

export const socketService = SocketService.getInstance();
export default socketService;

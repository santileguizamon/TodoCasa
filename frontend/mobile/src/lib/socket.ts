import { io } from 'socket.io-client';
import Constants from 'expo-constants'

const SOCKET_URL =
  process.env.EXPO_PUBLIC_WS_URL ||
  (Constants.expoConfig?.extra?.EXPO_PUBLIC_WS_URL as string | undefined) ||
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL as string | undefined) ||
  '';

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: true,
});

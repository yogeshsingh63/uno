import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../stores/settingsStore';

const isWeb = Platform.OS === 'web';

function hapticsAllowed() {
  return !isWeb && useSettingsStore.getState().hapticsEnabled;
}

export function useHaptics() {
  const lightTap = () => hapticsAllowed() && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  const mediumImpact = () => hapticsAllowed() && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  const heavyImpact = () => hapticsAllowed() && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  const errorBuzz = () => hapticsAllowed() && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  const successBuzz = () => hapticsAllowed() && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

  return { lightTap, mediumImpact, heavyImpact, errorBuzz, successBuzz };
}

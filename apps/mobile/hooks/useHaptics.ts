import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export function useHaptics() {
  const isWeb = Platform.OS === 'web';

  const lightTap = () => !isWeb && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  const mediumImpact = () => !isWeb && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  const heavyImpact = () => !isWeb && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  const errorBuzz = () => !isWeb && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  const successBuzz = () => !isWeb && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

  return { lightTap, mediumImpact, heavyImpact, errorBuzz, successBuzz };
}

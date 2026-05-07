import * as Haptics from 'expo-haptics';

export function useHaptics() {
  const lightTap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const mediumImpact = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  const heavyImpact = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  const errorBuzz = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  const successBuzz = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

  return { lightTap, mediumImpact, heavyImpact, errorBuzz, successBuzz };
}

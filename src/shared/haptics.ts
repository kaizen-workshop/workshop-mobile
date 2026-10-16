import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

type HapticKind = 'selection' | 'light' | 'success' | 'warning' | 'error';

/** Fire-and-forget tactile feedback. Does nothing on web and never throws. */
export function haptic(kind: HapticKind = 'light') {
  if (Platform.OS === 'web') return;
  let result: Promise<void>;
  switch (kind) {
    case 'selection':
      result = Haptics.selectionAsync();
      break;
    case 'light':
      result = Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'success':
      result = Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      );
      break;
    case 'warning':
      result = Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Warning,
      );
      break;
    case 'error':
      result = Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error,
      );
      break;
  }
  result.catch(() => undefined);
}

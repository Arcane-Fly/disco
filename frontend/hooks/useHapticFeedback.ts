import { useCallback } from 'react';

interface HapticFeedbackOptions {
  vibrationPattern?: number | number[];
  intensity?: 'light' | 'medium' | 'heavy';
}

export function useHapticFeedback() {
  const triggerHaptic = useCallback((type: 'impact' | 'selection' | 'notification', options?: HapticFeedbackOptions) => {
    // Check if device supports haptic feedback
    if (typeof window === 'undefined') return;

    // For browsers that support the Vibration API
    if ('vibrate' in navigator) {
      let pattern: number | number[] = 50; // Default vibration duration

      switch (type) {
        case 'impact':
          pattern = options?.intensity === 'heavy' ? 100 : options?.intensity === 'medium' ? 50 : 25;
          break;
        case 'selection':
          pattern = 10; // Very light vibration for selections
          break;
        case 'notification':
          pattern = [100, 50, 100]; // Double vibration for notifications
          break;
      }

      if (options?.vibrationPattern) {
        pattern = options.vibrationPattern;
      }

      try {
        navigator.vibrate(pattern);
      } catch (error) {
        // Silently ignore vibration errors
        console.debug('Haptic feedback not available:', error);
      }
    }

    // For iOS devices that support the Web Haptics API (experimental)
    // @ts-ignore - Experimental API
    if (window.DeviceMotionEvent && typeof window.DeviceMotionEvent.requestPermission === 'function') {
      // iOS haptic feedback would be implemented here when the API becomes available
    }
  }, []);

  const impactLight = useCallback(() => triggerHaptic('impact', { intensity: 'light' }), [triggerHaptic]);
  const impactMedium = useCallback(() => triggerHaptic('impact', { intensity: 'medium' }), [triggerHaptic]);
  const impactHeavy = useCallback(() => triggerHaptic('impact', { intensity: 'heavy' }), [triggerHaptic]);
  const selectionChanged = useCallback(() => triggerHaptic('selection'), [triggerHaptic]);
  const notificationSuccess = useCallback(() => triggerHaptic('notification', { vibrationPattern: [50, 25, 50] }), [triggerHaptic]);
  const notificationWarning = useCallback(() => triggerHaptic('notification', { vibrationPattern: [100, 50, 100, 50, 100] }), [triggerHaptic]);
  const notificationError = useCallback(() => triggerHaptic('notification', { vibrationPattern: [200] }), [triggerHaptic]);

  return {
    triggerHaptic,
    impactLight,
    impactMedium,
    impactHeavy,
    selectionChanged,
    notificationSuccess,
    notificationWarning,
    notificationError
  };
}
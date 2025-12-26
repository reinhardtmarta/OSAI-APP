
export const Haptics = {
  light: () => {
    if (window.navigator.vibrate) window.navigator.vibrate(20);
  },
  medium: () => {
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  },
  heavy: () => {
    if (window.navigator.vibrate) window.navigator.vibrate([50, 30, 50]);
  },
  error: () => {
    if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
  },
  success: () => {
    if (window.navigator.vibrate) window.navigator.vibrate([20, 10, 20]);
  }
};

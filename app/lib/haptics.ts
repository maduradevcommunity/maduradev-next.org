/**
 * Apple Design - Multimodal Feedback (Web Vibration API Helper)
 *
 * Provides subtle, meaningful haptic feedback for key interaction moments.
 * Fully fail-safe: gracefully degrades when unsupported (e.g. iOS Safari or desktop).
 */

export type HapticFeedbackType =
  | "light"      // Tap, toggle, selection
  | "medium"     // Shutter, commit, button press
  | "heavy"      // Snap, modal dismiss
  | "success"    // QR scan success, form submission
  | "warning"    // Cautionary threshold reached
  | "error";     // Invalid action, ticket rejected

export function triggerHaptic(type: HapticFeedbackType = "light"): void {
  if (typeof window === "undefined" || !("vibrate" in navigator)) {
    return;
  }

  try {
    switch (type) {
      case "light":
        navigator.vibrate(10);
        break;
      case "medium":
        navigator.vibrate(20);
        break;
      case "heavy":
        navigator.vibrate(35);
        break;
      case "success":
        // Crisp double tap pattern
        navigator.vibrate([15, 30, 25]);
        break;
      case "warning":
        navigator.vibrate([30, 40, 30]);
        break;
      case "error":
        // Warning buzz pattern
        navigator.vibrate([40, 40, 40]);
        break;
    }
  } catch {
    // Ignore any browser security or permission warnings silently
  }
}

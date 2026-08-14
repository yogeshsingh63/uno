// ============================================================
// Motion tokens — every animation in the app pulls from here
// so the whole game shares one physical "feel".
// ============================================================
import { useReducedMotion as useRnrReducedMotion } from 'react-native-reanimated';

// ---- Durations (ms) ----
export const DUR = {
  micro: 90,      // press feedback, tiny toggles
  fast: 160,      // card flick, badge pops
  quick: 240,     // crossfades, small panels
  med: 380,       // card arcs, modal entrances
  slow: 560,      // flying cards, dealing
  dealStagger: 45, // per-card delay during deal-in
} as const;

// ---- Spring configs ----
export const SPRING = {
  snappy: { damping: 16, stiffness: 220, mass: 0.6 },
  bounce: { damping: 9, stiffness: 190, mass: 0.6 },
  soft: { damping: 18, stiffness: 120, mass: 0.8 },
} as const;

// ---- Easing presets (import Easing separately where used) ----

/**
 * Honor the user's reduced-motion preference.
 * Returns true when physics-based motion should be replaced by
 * fast crossfades (or skipped entirely).
 */
export function usePrefersReducedMotion(): boolean {
  try {
    return useRnrReducedMotion();
  } catch {
    return false;
  }
}

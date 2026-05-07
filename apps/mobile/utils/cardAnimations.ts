// ============================================================
// Card Animations — Shared Reanimated 3 sequences
// Section 11, 15 animations
// ============================================================
import {
  withSpring, withTiming, withSequence, withDelay, withRepeat,
  WithSpringConfig, WithTimingConfig,
} from 'react-native-reanimated';

// Spring configs
export const SPRING_PLAY: WithSpringConfig = {
  damping: 15,
  stiffness: 150,
  mass: 0.8,
};

export const SPRING_DRAW: WithSpringConfig = {
  damping: 12,
  stiffness: 180,
  mass: 0.5,
};

export const SPRING_BOUNCE: WithSpringConfig = {
  damping: 8,
  stiffness: 200,
  mass: 0.6,
};

export const SPRING_DEAL: WithSpringConfig = {
  damping: 16,
  stiffness: 110,
};

export const SPRING_SELECTED: WithSpringConfig = {
  damping: 12,
  stiffness: 140,
};

export const SPRING_SKIP: WithSpringConfig = {
  damping: 10,
  stiffness: 120,
};

// Timing configs
export const TIMING_FLIP: WithTimingConfig = { duration: 400 };
export const TIMING_GLOW: WithTimingConfig = { duration: 1000 };
export const TIMING_SHAKE: WithTimingConfig = { duration: 80 };
export const TIMING_FADE: WithTimingConfig = { duration: 300 };

// Stagger / duration constants
export const DEAL_STAGGER_DELAY = 55;
export const CARD_PLAY_DURATION = 350;
export const TURN_GLOW_DURATION = 1200;
export const SHUFFLE_DURATION = 600;
export const FLIP_HALF_DURATION = 200;

/**
 * Create a shake animation sequence (for unplayable cards).
 */
export function createShakeSequence() {
  return withSequence(
    withTiming(-3, { duration: 50 }),
    withTiming(3, { duration: 50 }),
    withTiming(-3, { duration: 50 }),
    withTiming(0, { duration: 50 }),
  );
}

/**
 * Create a playable float animation (idle bob up/down).
 */
export function createFloatAnimation() {
  return withRepeat(
    withSequence(
      withTiming(-4, { duration: 700 }),
      withTiming(0, { duration: 700 }),
    ),
    -1, true
  );
}

/**
 * Create a pulse animation for glows/UNO button.
 */
export function createPulseAnimation(from: number = 0.4, to: number = 1.0, duration: number = 450) {
  return withRepeat(
    withSequence(
      withTiming(to, { duration }),
      withTiming(from, { duration }),
    ),
    -1, true
  );
}

/**
 * Create skip symbol pop animation.
 * scale: 0 → 1.5 → 1.0, hold 500ms, fade out.
 */
export function createSkipAnimation(scaleValue: { value: number }, opacityValue: { value: number }) {
  scaleValue.value = withSequence(
    withTiming(0, { duration: 0 }),
    withSpring(1.5, SPRING_SKIP),
    withSpring(1.0, SPRING_SKIP),
    withDelay(500, withTiming(1.0, { duration: 0 })),
  );
  opacityValue.value = withSequence(
    withTiming(1, { duration: 0 }),
    withDelay(850, withTiming(0, TIMING_FADE)),
  );
}

/**
 * Create card deal animation with stagger.
 */
export function createDealAnimation(
  xValue: { value: number },
  yValue: { value: number },
  targetX: number,
  targetY: number,
  delay: number,
) {
  xValue.value = withDelay(delay, withSpring(targetX, SPRING_DEAL));
  yValue.value = withDelay(delay, withSpring(targetY, SPRING_DEAL));
}

import { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

export const SPRING_CARD_PLAY: WithSpringConfig = {
  damping: 15,
  stiffness: 150,
  mass: 0.8,
};

export const SPRING_CARD_DRAW: WithSpringConfig = {
  damping: 12,
  stiffness: 180,
  mass: 0.5,
};

export const SPRING_BOUNCE: WithSpringConfig = {
  damping: 8,
  stiffness: 200,
  mass: 0.6,
};

export const SPRING_MODAL: WithSpringConfig = {
  damping: 20,
  stiffness: 120,
  mass: 1,
};

export const TIMING_FLIP: WithTimingConfig = {
  duration: 400,
};

export const TIMING_GLOW: WithTimingConfig = {
  duration: 1000,
};

export const TIMING_SHAKE: WithTimingConfig = {
  duration: 80,
};

export const DEAL_STAGGER_DELAY = 100;
export const CARD_ANIMATION_DURATION = 350;
export const TURN_GLOW_DURATION = 1200;

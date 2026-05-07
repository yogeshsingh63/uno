// ============================================================
// Animation constants — re-exports + legacy compatibility
// ============================================================
export {
  SPRING_PLAY as SPRING_CARD_PLAY,
  SPRING_DRAW as SPRING_CARD_DRAW,
  SPRING_BOUNCE,
  TIMING_FLIP,
  TIMING_GLOW,
  TIMING_SHAKE,
  DEAL_STAGGER_DELAY,
  CARD_PLAY_DURATION as CARD_ANIMATION_DURATION,
  TURN_GLOW_DURATION,
} from '../utils/cardAnimations';

import { WithSpringConfig } from 'react-native-reanimated';

export const SPRING_MODAL: WithSpringConfig = {
  damping: 20,
  stiffness: 120,
  mass: 1,
};

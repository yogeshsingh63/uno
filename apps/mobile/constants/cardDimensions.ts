// ============================================================
// Card Dimensions — All sizes per Section 1
// ============================================================

export const SIZE_SCALE = 1; // Adjust globally if needed

// In-hand card (local player)
export const CARD_WIDTH = 70 * SIZE_SCALE;
export const CARD_HEIGHT = 100 * SIZE_SCALE;

// Discard pile featured card
export const DISCARD_WIDTH = 90 * SIZE_SCALE;
export const DISCARD_HEIGHT = 128 * SIZE_SCALE;

// Opponent mini-card (2–6 players)
export const MINI_WIDTH = 46 * SIZE_SCALE;
export const MINI_HEIGHT = 65 * SIZE_SCALE;

// Opponent mini-card (7–10 players)
export const MINI_SM_WIDTH = 36 * SIZE_SCALE;
export const MINI_SM_HEIGHT = 51 * SIZE_SCALE;

// Color picker preview
export const PREVIEW_WIDTH = 64 * SIZE_SCALE;
export const PREVIEW_HEIGHT = 90 * SIZE_SCALE;

// Shared
export const CARD_BORDER_RADIUS = 10 * SIZE_SCALE;
export const CARD_HAND_OVERLAP = 24;

// Aspect ratio: 7:10
export function scaleCard(w: number): { width: number; height: number } {
  return { width: w, height: w * (10 / 7) };
}

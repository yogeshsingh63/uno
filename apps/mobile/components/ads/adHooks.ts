// ============================================================
// Ad monetization hooks — STUBS ONLY.
//
// These are the integration seams for future ad SDKs (AdMob /
// AdSense / Meta Audience Network). Nothing here loads a real ad
// or makes a network request. When wiring a real SDK:
//   1. call maybeShowInterstitial() at the round-end break,
//   2. call claimRewardedPerk() from the perk button,
//   3. render <AdBannerSlot /> in the reserved spot.
// All three are intentionally trivial right now so the game is
// never blocked or slowed by ad code.
// ============================================================

export type InterstitialResult = 'shown' | 'skipped' | 'unavailable';

/** Called at natural break points (e.g. after the round-end modal closes). */
export function maybeShowInterstitial(): InterstitialResult {
  // TODO(ads): if (AdMobInterstitial.isLoaded()) { await show(); return 'shown'; }
  return 'unavailable';
}

export type RewardResult = 'granted' | 'unavailable';

/** Called when the player taps a "watch ad" perk button. */
export function claimRewardedPerk(perk: string): RewardResult {
  // TODO(ads): load + show a rewarded ad; grant `perk` on completion.
  return 'unavailable';
}

/** Reserved slot id for the persistent banner (for future config). */
export const BANNER_SLOT_ID = 'banner-bottom-game';

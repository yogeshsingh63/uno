# 🃏 UNO Multiplayer — Task Checklist

> Track progress across all implementation phases.
> Mark: `[ ]` todo, `[/]` in progress, `[x]` done

---

## Phase 1: Project Scaffolding & Shared Types
- [x] Root `package.json` with npm scripts (no workspaces — per-app install)
- [x] `packages/shared/package.json` + `tsconfig.json` (builds to `dist`, consumed via `file:` dep)
- [x] `packages/shared/src/types.ts` — all shared TypeScript types
- [x] `packages/shared/src/events.ts` — socket event constants
- [x] `packages/shared/src/index.ts` — barrel export

## Phase 2: Backend — Game Engine & Socket.io Server
- [x] `apps/server/package.json` + `tsconfig.json` (builds to `dist/index.js`)
- [x] `apps/server/src/game/Card.ts` — card interfaces & 110-card deck factory (incl. Swap/Shuffle Hands)
- [x] `apps/server/src/game/Deck.ts` — shuffle, deal, first-card rules, reshuffle
- [x] `apps/server/src/game/Player.ts` — player state
- [x] `apps/server/src/game/GameEngine.ts` — full rules engine
  - [x] Card matching (color OR number/symbol)
  - [x] Wild card color selection
  - [x] Wild Draw Four legality & challenge (guilty → 4, wrong → 6)
  - [x] Draw Two stacking (house rule, off by default)
  - [x] Skip logic (2-player = play again)
  - [x] Reverse logic (+ 2-player edge case)
  - [x] UNO declaration & catch penalty (+2, window closes on next action)
  - [x] Draw card + optional immediate play
  - [x] Win condition detection (incl. D2/WD4 last-card penalty scoring)
  - [x] Turn advancement with direction
  - [x] 7-0 house rule (7 = swap hands, 0 = rotate)
  - [x] Jump-In house rule (3s exact-match window)
  - [x] Modern wilds: Swap Hands + Shuffle Hands (40 pts)
- [x] `apps/server/src/game/Scoring.ts` — score calc, 500pt end
- [x] `apps/server/src/rooms/Room.ts` — room state & lifecycle
- [x] `apps/server/src/rooms/RoomManager.ts` — CRUD rooms, 6-char codes, cleanup
- [x] `apps/server/src/socket/handlers.ts` — all event handlers
- [x] `apps/server/src/index.ts` — Express + Socket.io entry (`.env` wins over stray env)
- [x] `apps/server/src/ai/BotPlayer.ts` — AI bot opponent (stall-proof turn loop)
- [x] `apps/server/tests/rules.test.ts` — 101 direct engine assertions (`npm test`)

## Phase 3: Expo Mobile App Setup
- [x] Initialize Expo project in `apps/mobile`
- [x] `app.json` configuration
- [x] `app/_layout.tsx` — root layout with providers
- [x] `constants/colors.ts` — design tokens
- [x] `constants/animations.ts` — animation spring/timing configs
- [x] `constants/cardData.ts` — card symbols & display mappings
- [x] `babel.config.js` — Expo preset (worklets plugin via reanimated shim)
- [x] `metro.config.js` — monorepo workspace resolution
- [x] `tsconfig.json` — path aliases

## Phase 4: UI Components
- [x] `components/cards/Card.tsx` — glossy gradient card with 3D tilt
- [x] `components/cards/CardHand.tsx` — horizontal scrollable hand
- [x] `components/cards/DiscardPile.tsx` — top card + color ring
- [x] `components/cards/DrawPile.tsx` — stacked backs + tap to draw
- [x] `components/cards/CardFace.tsx` + per-type faces (incl. Swap/Shuffle Hands)
- [x] `components/game/PlayerSlot.tsx` — avatar, name, card count, turn glow
- [x] `components/game/UnoButton.tsx` — floating pulse button
- [x] `components/game/DirectionArrow.tsx` — CW/CCW arrow
- [x] `components/ui/Button.tsx` — reusable neon button
- [x] `components/ui/ElementalBackground.tsx` — lightweight animated elemental bg

## Phase 5: Screens & Navigation
- [x] `app/index.tsx` — Splash screen (animated logo + elemental embers)
- [x] `app/home.tsx` — Home screen (name, avatar, create/join)
- [x] `app/lobby/[roomCode].tsx` — Lobby (players, ready, start, house rules)
- [x] `app/game/[roomCode].tsx` — Game screen (full layout, decluttered)
- [x] `components/modals/ColorPickerModal.tsx` — 4-color bottom sheet
- [x] `components/modals/ChallengeModal.tsx` — W+4 challenge
- [x] `components/modals/SwapTargetModal.tsx` — swap-hand target picker
- [x] `components/modals/EndRoundModal.tsx` — round results + Next Round
- [x] `components/modals/FinalWinnerModal.tsx` — confetti + trophy + Play Again

## Phase 6: State Management & Real-Time
- [x] `stores/gameStore.ts` — Zustand game state + actions
- [x] `stores/playerStore.ts` — Zustand player info (persisted)
- [x] `services/socketService.ts` — singleton socket client with auto host detection
- [x] `hooks/useGameSocket.ts` — connect events ↔ store (incl. swap/jump-in/next-round)
- [x] End-to-end socket wiring verified (web preview + E2E socket test)

## Phase 7: Animations, Sound & Haptics
- [x] Card play animation (spring + press feedback in Card.tsx)
- [x] UNO button pulse/shake animation
- [x] Turn indicator glow animation (PlayerSlot)
- [x] Direction arrow flip animation
- [x] Color picker slide-up animation
- [x] Discard pile glow pulse
- [x] Draw pile glow pulse
- [x] Invalid move shake (Card.tsx)
- [x] `hooks/useHaptics.ts` — haptic feedback
- [ ] `services/soundService.ts` — expo-audio sound manager (deferred — optional)
- [ ] Sound asset files

## Phase 8: AI Bot & Deployment
- [x] `apps/server/src/ai/BotPlayer.ts` — AI opponent
- [x] `apps/server/Dockerfile` (builds shared + server)
- [x] `README.md` — full setup & deployment guide
- [x] `.gitignore`
- [x] npm install & verify builds (server `dist/index.js`, shared `dist`)
- [x] End-to-end testing (101 engine assertions + socket E2E + web preview)

---

## Status Summary

| Phase | Status | Completion |
|-------|--------|------------|
| 1. Scaffolding | ✅ Complete | 100% |
| 2. Backend | ✅ Complete | 100% |
| 3. Expo Setup | ✅ Complete | 100% |
| 4. UI Components | ✅ Complete | 100% |
| 5. Screens | ✅ Complete | 100% |
| 6. State & Comms | ✅ Complete | 100% |
| 7. Animations | ✅ Complete (sound optional) | 95% |
| 8. AI & Deploy | ✅ Complete | 100% |

### Verified
- `apps/server` `npm test` → **101 passed / 0 failed** (all official UNO rules + house rules)
- Server build → `dist/index.js`, production `npm start` works
- Socket E2E: room → bots → game → full round → scoring → next round
- Web preview: splash, home, lobby, full game loop (play, draw, play-drawn, color pick, WD4 challenge)
- `.env` `PORT` now overrides stray shell env (fixes EADDRINUSE)

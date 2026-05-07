# 🃏 UNO Multiplayer — Task Checklist

> Track progress across all implementation phases.
> Mark: `[ ]` todo, `[/]` in progress, `[x]` done

---

## Phase 1: Project Scaffolding & Shared Types
- [x] Root `package.json` with npm workspaces
- [x] `packages/shared/package.json` + `tsconfig.json`
- [x] `packages/shared/src/types.ts` — all shared TypeScript types
- [x] `packages/shared/src/events.ts` — socket event constants
- [x] `packages/shared/src/index.ts` — barrel export

## Phase 2: Backend — Game Engine & Socket.io Server
- [x] `apps/server/package.json` + `tsconfig.json`
- [x] `apps/server/src/game/Card.ts` — card interfaces & deck factory
- [x] `apps/server/src/game/Deck.ts` — shuffle, deal, reshuffle
- [x] `apps/server/src/game/Player.ts` — player state
- [x] `apps/server/src/game/GameEngine.ts` — full rules engine
  - [x] Card matching (color OR number/symbol)
  - [x] Wild card color selection
  - [x] Wild Draw Four legality & challenge
  - [x] Draw Two stacking
  - [x] Skip logic
  - [x] Reverse logic (+ 2-player edge case)
  - [x] UNO declaration & challenge penalty
  - [x] Draw card + optional immediate play
  - [x] Win condition detection
  - [x] Turn advancement with direction
- [x] `apps/server/src/game/Scoring.ts` — score calc, 500pt end
- [x] `apps/server/src/rooms/Room.ts` — room state & lifecycle
- [x] `apps/server/src/rooms/RoomManager.ts` — CRUD rooms, 6-char codes
- [x] `apps/server/src/socket/handlers.ts` — all event handlers
- [x] `apps/server/src/index.ts` — Express + Socket.io entry
- [x] `apps/server/src/ai/BotPlayer.ts` — AI bot opponent
- [ ] Server starts & accepts socket connections (needs npm install)

## Phase 3: Expo Mobile App Setup
- [x] Initialize Expo project in `apps/mobile`
- [ ] Install dependencies (needs npm install)
- [x] `app.json` configuration
- [x] `app/_layout.tsx` — root layout with providers
- [x] `constants/colors.ts` — design tokens
- [x] `constants/animations.ts` — animation spring/timing configs
- [x] `constants/cardData.ts` — card symbols & display mappings
- [x] `babel.config.js` — Expo preset
- [x] `metro.config.js` — monorepo workspace resolution
- [x] `tsconfig.json` — path aliases

## Phase 4: UI Components
- [x] `components/cards/Card.tsx` — glossy gradient card with 3D tilt
- [x] `components/cards/CardHand.tsx` — horizontal scrollable hand
- [x] `components/cards/DiscardPile.tsx` — top card + color ring
- [x] `components/cards/DrawPile.tsx` — stacked backs + tap to draw
- [x] `components/game/PlayerSlot.tsx` — avatar, name, card count, turn glow
- [x] `components/game/UnoButton.tsx` — floating pulse button
- [x] `components/game/DirectionArrow.tsx` — CW/CCW arrow
- [x] `components/ui/Button.tsx` — reusable neon button

## Phase 5: Screens & Navigation
- [x] `app/index.tsx` — Splash screen (animated logo)
- [x] `app/home.tsx` — Home screen (name, avatar, create/join)
- [x] `app/lobby/[roomCode].tsx` — Lobby (players, ready, start)
- [x] `app/game/[roomCode].tsx` — Game screen (full layout)
- [x] `components/modals/ColorPickerModal.tsx` — 4-color bottom sheet
- [x] `components/modals/ChallengeModal.tsx` — W+4 challenge
- [x] `components/modals/EndRoundModal.tsx` — round results
- [x] `components/modals/FinalWinnerModal.tsx` — confetti + trophy

## Phase 6: State Management & Real-Time
- [x] `stores/gameStore.ts` — Zustand game state + actions
- [x] `stores/playerStore.ts` — Zustand player info (persisted)
- [x] `services/socketService.ts` — singleton socket client
- [x] `hooks/useGameSocket.ts` — connect events ↔ store
- [ ] End-to-end socket wiring verified (needs running)

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
- [ ] `services/soundService.ts` — expo-audio sound manager
- [ ] Sound asset files

## Phase 8: AI Bot & Deployment
- [x] `apps/server/src/ai/BotPlayer.ts` — AI opponent
- [x] `apps/server/Dockerfile`
- [x] `README.md` — full setup & deployment guide
- [x] `.gitignore`
- [ ] npm install & verify builds
- [ ] End-to-end testing

---

## Status Summary

| Phase | Status | Completion |
|-------|--------|------------|
| 1. Scaffolding | ✅ Complete | 100% |
| 2. Backend | ✅ Complete | 95% |
| 3. Expo Setup | ✅ Complete | 90% |
| 4. UI Components | ✅ Complete | 100% |
| 5. Screens | ✅ Complete | 100% |
| 6. State & Comms | ✅ Complete | 90% |
| 7. Animations | 🟡 Mostly Done | 80% |
| 8. AI & Deploy | ✅ Complete | 90% |

### Remaining Work
- [ ] Run `npm install` in workspace root to install all deps
- [ ] Verify server starts and accepts connections
- [ ] Verify Expo app starts and renders
- [ ] Add sound service with expo-audio (optional for MVP)
- [ ] End-to-end 2-player game test

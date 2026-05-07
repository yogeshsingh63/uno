# 🃏 UNO Multiplayer Card Game — Implementation Guide

> **Project**: Real-time multiplayer UNO card game
> **Stack**: React Native (Expo SDK 52+) + Node.js/Express/Socket.io
> **Workspace**: `/Ubuntu/home/yogesh/uno`

---

## Architecture Overview

```
uno/
├── apps/
│   ├── mobile/                 # Expo React Native app
│   │   ├── app/                # Expo Router file-based routes
│   │   │   ├── _layout.tsx     # Root layout (providers, fonts)
│   │   │   ├── index.tsx       # Splash screen
│   │   │   ├── home.tsx        # Home (create/join room)
│   │   │   ├── lobby/
│   │   │   │   └── [roomCode].tsx
│   │   │   └── game/
│   │   │       └── [roomCode].tsx
│   │   ├── components/
│   │   │   ├── cards/          # Card, CardHand, DiscardPile, DrawPile
│   │   │   ├── game/           # PlayerSlot, TurnIndicator, UnoButton
│   │   │   ├── modals/         # ColorPicker, Challenge, EndRound, Winner
│   │   │   └── ui/             # Button, Avatar, Input, AnimatedText
│   │   ├── hooks/              # useGameSocket, useCardAnimations, useHaptics
│   │   ├── stores/             # Zustand (gameStore, playerStore)
│   │   ├── services/           # socketService, soundService
│   │   ├── constants/          # colors, animations, cardData
│   │   └── assets/             # fonts, sounds
│   └── server/                 # Node.js + Express + Socket.io
│       └── src/
│           ├── index.ts        # Server entry point
│           ├── game/           # GameEngine, Deck, Card, Player, Scoring
│           ├── rooms/          # Room, RoomManager
│           ├── socket/         # Event handlers
│           └── ai/             # BotPlayer
├── packages/
│   └── shared/                 # Shared types & event constants
│       └── src/
│           ├── types.ts
│           └── events.ts
├── package.json                # Monorepo root
└── README.md
```

---

## Tech Stack Details

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Mobile Framework | React Native + Expo SDK 52+ | Cross-platform iOS/Android |
| Navigation | Expo Router (file-based) | Screen navigation |
| Animations | React Native Reanimated 3 | UI-thread animations |
| Gestures | React Native Gesture Handler | Touch interactions |
| State | Zustand | Client-side state management |
| Real-time | Socket.io (client + server) | Multiplayer communication |
| Backend | Node.js + Express + TypeScript | Game server |
| Audio | expo-audio | Sound effects |
| Haptics | expo-haptics | Tactile feedback |
| Gradients | expo-linear-gradient | Card visuals |

---

## Design System

### Color Palette
```
Background:     #0d0d1a (deep dark navy)
Surface:        #1a1a2e (card/modal backgrounds)
Surface Light:  #252540 (elevated surfaces)

UNO Red:        #ff2d55
UNO Yellow:     #ffd60a
UNO Green:      #30d158
UNO Blue:       #0a84ff

Text Primary:   #ffffff
Text Secondary: #8e8ea0
Neon Glow:      rgba(255, 45, 85, 0.3)
```

### Card Design
- Glossy face with LinearGradient per color
- Rainbow gradient for Wild cards
- Bold number/symbol with drop shadow
- Slight 3D perspective tilt via Reanimated transforms
- Card dimensions: ~70×100 (responsive)

---

## UNO Rules (Server-Enforced)

### Card Composition (108 cards)
- **Number Cards**: 0–9 in each of 4 colors (one 0, two of 1–9 per color) = 76
- **Skip**: 2 per color = 8
- **Reverse**: 2 per color = 8
- **Draw Two**: 2 per color = 8
- **Wild**: 4
- **Wild Draw Four**: 4

### Core Rules
1. **Matching**: Play a card matching top discard by color OR number/symbol
2. **Wild**: Playable anytime; player picks new color
3. **Wild Draw Four**: Only legal if player has NO cards matching current color; bluffable
4. **Challenge W+4**: Challenger wins → card player draws 4; loses → challenger draws 6
5. **Draw Two Stacking**: Next player may stack another +2 or take total penalty
6. **Skip**: Skips next player's turn entirely
7. **Reverse**: Flips play direction; acts as Skip in 2-player
8. **UNO Call**: Must tap UNO when down to 1 card; caught = draw 2 penalty
9. **Draw**: If no playable card, draw 1; if drawn card is playable, may play immediately
10. **Win**: First to empty hand wins the round
11. **Scoring**: Number = face value, Action = 20pts, Wild = 50pts
12. **Game End**: First to 500 cumulative points wins the game

---

## Socket.io Event Protocol

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `create-room` | `{ playerName, avatar }` | Host creates new room |
| `join-room` | `{ roomCode, playerName, avatar }` | Player joins existing room |
| `player-ready` | `{ roomCode }` | Toggle ready status |
| `start-game` | `{ roomCode }` | Host starts game (all must be ready) |
| `play-card` | `{ roomCode, cardId, chosenColor? }` | Play a card |
| `draw-card` | `{ roomCode }` | Draw from deck |
| `call-uno` | `{ roomCode }` | Declare UNO |
| `challenge-uno` | `{ roomCode, targetPlayerId }` | Challenge a player who didn't call UNO |
| `challenge-draw-four` | `{ roomCode }` | Challenge Wild Draw Four |
| `leave-room` | `{ roomCode }` | Leave current room |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `room-created` | `{ roomCode, room }` | Room successfully created |
| `room-joined` | `{ room }` | Player joined room |
| `room-updated` | `{ room }` | Room state changed |
| `game-started` | `{ gameState }` | Game begins |
| `game-state-update` | `{ gameState }` | Game state changed |
| `card-drawn` | `{ card, canPlayDrawn }` | Card drawn (private to player) |
| `round-ended` | `{ winnerId, scores }` | Round finished |
| `game-ended` | `{ winnerId, finalScores }` | Game finished (500 pts) |
| `uno-called` | `{ playerId }` | Player called UNO |
| `uno-penalty` | `{ playerId, cards }` | UNO penalty applied |
| `challenge-result` | `{ success, penaltyPlayerId, cards }` | W+4 challenge result |
| `player-disconnected` | `{ playerId }` | Player lost connection |
| `player-reconnected` | `{ playerId }` | Player reconnected |
| `error` | `{ message }` | Error message |

---

## Animation Spec (Reanimated 3)

| Animation | Trigger | Implementation |
|-----------|---------|---------------|
| Deal cards | Game start | `withDelay(i * 100, withSpring(pos))` staggered fly-out |
| Play card | Tap card | `withSpring` slide + `withTiming` flip to discard |
| Draw card | Tap deck | `withSpring` pop from deck into hand |
| Invalid move | Bad card tap | `withSequence` shake (-10, 10, 0) + snap back |
| Skip/Reverse | Action card played | Rotating arrow `withTiming(rotate, 600ms)` |
| Color picker | Wild card | Bottom sheet `withSpring` slide up, buttons scale in |
| UNO button | 1 card left | `withRepeat(withSequence(scale 1→1.3→1))` pulse |
| UNO declare | Tap UNO | Confetti burst + "UNO!" text scale animation |
| Turn glow | Turn change | `withRepeat(opacity 0.5→1→0.5)` on active player |
| Win screen | Round/game end | Trophy scale + rotate + confetti shower |

---

## Phases of Implementation

### Phase 1 — Scaffolding & Shared Types
Monorepo setup, shared TypeScript types and Socket.io event constants.

### Phase 2 — Backend Game Engine
Full UNO game logic, room management, Socket.io handlers. All rules server-side.

### Phase 3 — Expo Mobile App Setup
Expo project init, dependencies, design tokens, Expo Router structure.

### Phase 4 — UI Components
Card components (glossy 3D), hand, piles, player slots, UNO button.

### Phase 5 — Screens & Navigation
Splash, Home, Lobby, Game screens + all modals.

### Phase 6 — State & Real-Time Communication
Zustand stores, Socket.io client service, event wiring.

### Phase 7 — Animations, Sound & Haptics
All Reanimated 3 animations, expo-audio sound effects, expo-haptics feedback.

### Phase 8 — AI Bot & Deployment
Bot player, Dockerfile, README, EAS build config.

---

## How to Run (for other agents)

```bash
# 1. Install all dependencies
cd /Ubuntu/home/yogesh/uno && npm install

# 2. Start the backend server
cd apps/server && npm run dev

# 3. Start the Expo mobile app
cd apps/mobile && npx expo start

# 4. Test on device/simulator
# - iOS: press 'i' in Expo CLI
# - Android: press 'a' in Expo CLI
# - Physical device: scan QR code with Expo Go
```

## Environment Variables

### Server (`apps/server/.env`)
```
PORT=3001
CORS_ORIGIN=*
NODE_ENV=development
```

### Mobile (`apps/mobile/.env`)
```
EXPO_PUBLIC_SERVER_URL=http://localhost:3001
```

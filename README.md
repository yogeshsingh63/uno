# 🃏 UNO Multiplayer

A real-time multiplayer UNO card game built with **React Native (Expo)** and **Node.js/Socket.io**. Features stunning neon-carnival arcade aesthetics, full UNO rule enforcement, and smooth Reanimated 3 animations.

![Platforms](https://img.shields.io/badge/Platforms-iOS%20%7C%20Android-blue)
![Expo SDK](https://img.shields.io/badge/Expo%20SDK-52+-green)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7-yellow)

## ✨ Features

- **Full UNO Rules** — All rules enforced server-side (Wild Draw Four challenges, Draw Two stacking, UNO declaration, scoring to 500)
- **2–10 Players** — Create or join rooms with shareable 6-character codes
- **AI Bots** — Fill empty seats with configurable AI opponents
- **Stunning Visuals** — Glossy gradient cards, neon glow effects, dark arcade theme
- **Smooth Animations** — Reanimated 3 UI-thread animations for dealing, playing, drawing
- **Haptic Feedback** — Tactile responses for card interactions
- **Cross-Platform** — iOS and Android from a single codebase

## 🏗️ Architecture

```
uno/
├── apps/
│   ├── mobile/     # Expo React Native app
│   └── server/     # Node.js + Express + Socket.io
├── packages/
│   └── shared/     # Shared TypeScript types & events
└── package.json    # Monorepo root
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (for development)

### 1. Install Dependencies

```bash
cd uno
npm install
```

### 2. Start the Backend Server

```bash
cd apps/server
npm run dev
```

Server starts at `http://localhost:3001`.

### 3. Start the Mobile App

```bash
cd apps/mobile
npx expo start
```

- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go on your phone

### 4. Configure Server URL

For physical devices, update the server URL:

```bash
# In apps/mobile, create .env:
EXPO_PUBLIC_SERVER_URL=http://YOUR_LOCAL_IP:3001
```

## 🎮 How to Play

1. **Create a Room** — Enter your name, choose an avatar, tap "Create Room"
2. **Share the Code** — Send the 6-character room code to friends
3. **Ready Up** — All players tap "Ready", host starts the game
4. **Play Cards** — Match by color or number/symbol, tap to play
5. **Call UNO!** — Tap the UNO button when you have 1 card left
6. **Win!** — First to empty their hand wins the round

## 🃏 UNO Rules

| Rule | Details |
|------|---------|
| **Card Matching** | Match by color OR number/symbol |
| **Wild** | Playable anytime, pick new color |
| **Wild +4** | Only legal if no matching color; can be challenged |
| **Challenge W+4** | Win → they draw 4; Lose → you draw 6 |
| **Draw Two** | Stackable — next player can stack or take penalty |
| **Skip** | Next player loses their turn |
| **Reverse** | Flips direction; acts as Skip in 2-player |
| **UNO Call** | Must call when down to 1 card; penalty if caught |
| **Scoring** | Numbers = face value, Actions = 20pts, Wilds = 50pts |
| **Game End** | First to 500 cumulative points wins |

## 🚢 Deployment

### Backend (Railway)

1. Push to GitHub
2. Connect repo to [Railway](https://railway.app)
3. Set root directory to `apps/server`
4. Set environment variables: `PORT=3001`, `CORS_ORIGIN=*`
5. Deploy!

### Backend (Docker)

```bash
cd apps/server
docker build -t uno-server .
docker run -p 3001:3001 uno-server
```

### Mobile (EAS Build)

```bash
cd apps/mobile
npx eas build --platform all --profile preview
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo SDK 52 |
| Navigation | Expo Router |
| Animations | React Native Reanimated 3 |
| State | Zustand |
| Real-time | Socket.io |
| Backend | Node.js + Express + TypeScript |
| Haptics | expo-haptics |
| Gradients | expo-linear-gradient |

## 📁 Key Files

- `apps/server/src/game/GameEngine.ts` — Core UNO rules engine
- `apps/mobile/components/cards/Card.tsx` — Card component with gradients
- `apps/mobile/hooks/useGameSocket.ts` — Socket.io ↔ Zustand bridge
- `apps/mobile/stores/gameStore.ts` — Client-side game state
- `packages/shared/src/types.ts` — Shared TypeScript types

## 📝 License

MIT

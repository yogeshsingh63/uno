# 🃏 UNO Multiplayer

A real-time multiplayer UNO card game built with **React Native (Expo)** and **Node.js/Socket.io**. Features stunning neon-carnival arcade aesthetics, full UNO rule enforcement, and smooth Reanimated 3 animations.

![Platforms](https://img.shields.io/badge/Platforms-iOS%20%7C%20Android%20%7C%20Web-blue)
![Expo SDK](https://img.shields.io/badge/Expo%20SDK-54+-green)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7-yellow)

## ✨ Features

- **Full Official UNO Rules** — all enforced server-side (Wild Draw Four challenges with guilty→4 / wrong→6, UNO call & catch, first-card rules, scoring to 500)
- **Modern 112-card deck** — Wild Swap Hands + Wild Shuffle Hands (40 pts) alongside the classic 108
- **House Rules** — Draw Two stacking, 7-0 (7=swap, 0=rotate), Jump-In, Force Play, alternate scoring
- **2–10 Players** — Create or join rooms with shareable 6-character codes
- **AI Bots** — Fill empty seats with stall-proof AI opponents
- **Elemental Visuals** — Lightweight animated ember/cosmic background, glossy gradient cards, neon glow effects, dark arcade theme
- **Smooth Animations** — Reanimated 4 UI-thread animations tuned to stay light (reduced-motion aware)
- **Haptic Feedback** — Tactile responses for card interactions
- **Cross-Platform** — iOS, Android, and Web from a single codebase

## 🏗️ Architecture

```
uno/
├── apps/
│   ├── mobile/     # Expo React Native app (Frontend)
│   └── server/     # Node.js + Express + Socket.io (Backend)
├── packages/
│   └── shared/     # Shared TypeScript types & events
└── package.json    # Monorepo root
```

## 🚀 Quick Start & Setup

### Prerequisites

- Node.js 20+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (for Android/iOS development)

### 1. Install Dependencies

Install all dependencies across the monorepo from the root directory:

```bash
npm install
cd apps/server && npm install
cd ../mobile && npm install
```

### 2. Environment Setup

You need to set up environment variables for both the server and the mobile app.

**Server Environment** (`apps/server/.env`):
```bash
cd apps/server
cp .env.example .env
```
Ensure your `apps/server/.env` file contains:
```env
PORT=3001
CORS_ORIGIN=*
```

**Mobile Environment** (`apps/mobile/.env`):
```bash
cd apps/mobile
cp .env.example .env
```
The mobile app tries to auto-detect your machine's local IP address. However, on some physical devices (especially Android), auto-detection fails. **For best results, find your LAN IP (e.g., 192.168.1.5) and set it explicitly** in `apps/mobile/.env`:
```env
EXPO_PUBLIC_SERVER_URL=http://<YOUR_LAN_IP>:3001
```

### 3. Start the Backend Server

Open a terminal and run:

```bash
cd apps/server
npm run dev
```

The server will start at `http://0.0.0.0:3001`.

### 4. Start the Mobile/Web App

Open a **new** terminal and run:

```bash
cd apps/mobile
npx expo start -c
```
*(The `-c` flag clears the cache to ensure your `.env` variables are picked up)*

- **Web**: Press `w` to open in the browser (`http://localhost:8081`).
- **Android**: Scan the QR code with the Expo Go app.
- **iOS**: Scan the QR code with your iPhone's Camera app to open Expo Go.

### 5. Troubleshooting Network Connections

If your mobile device gets stuck loading or cannot find the server:
1. Ensure your phone and development machine are connected to the **same Wi-Fi network**.
2. Verify you put the correct LAN IP in `apps/mobile/.env`. You can find your IP by running `hostname -I` (Linux) or `ipconfig` (Windows).
3. Ensure your firewall allows inbound connections on port `3001` and `8081`.
4. **WSL Users**: If you are running this inside Windows Subsystem for Linux (WSL), the local IP won't bridge to your phone easily. You may need to use a tunnel (e.g., `ssh -R 80:localhost:3001 nokey@localhost.run` and update your `.env` with the generated public URL). However, running on **native Linux or macOS** avoids this entirely.

## 🎮 How to Play

1. **Create a Room** — Enter your name, choose an avatar, tap "Create Room"
2. **Share the Code** — Send the 6-character room code to friends
3. **Ready Up** — All players tap "Ready", host starts the game
4. **Play Cards** — Match by color or number/symbol, tap to play
5. **Call UNO!** — Tap the UNO button when you have 1 card left
6. **Win!** — First to empty their hand wins the round

## 🃏 UNO Rules (per official Mattel rulebook)

| Rule | Details |
|------|---------|
| **Card Matching** | Match by color OR number/symbol |
| **First Card** | Action applies to first player; Wild → choose color; WD4 → reshuffle |
| **Wild** | Playable anytime, pick new color |
| **Wild +4** | Only legal if you have no matching color; bluffing allowed |
| **Challenge W+4** | Guilty → +4 player draws 4; Wrong → challenger draws 6 |
| **Draw Two** | Next player draws 2 and loses turn (stacking is a house rule, off by default) |
| **Skip** | Next player loses their turn (2-player: you play again) |
| **Reverse** | Flips direction; acts as Skip in 2-player |
| **UNO Call** | Must call every time you drop to 1 card; caught → +2 penalty |
| **Win card penalties** | Winning with D2/WD4 still makes the next player draw (counted in score) |
| **Swap Hands** | Wild; choose color + swap hands with any player (40 pts) |
| **Shuffle Hands** | Wild; collect, shuffle, redeal all hands (40 pts) |
| **7-0 (house)** | Play 7 → swap hands; play 0 → hands rotate |
| **Jump-In (house)** | Play an exact-match card out of turn within 3s |
| **Scoring** | Numbers = face value, Actions = 20pts, Wilds = 50pts, Swap/Shuffle = 40pts |
| **Game End** | First to 500 cumulative points wins (or chosen target) |

## ✅ Testing

```bash
cd apps/server
npm test   # 101 direct GameEngine rule assertions
```

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
| Mobile/Web | React Native + Expo SDK 54 |
| Navigation | Expo Router |
| Animations | React Native Reanimated 4 |
| State | Zustand |
| Real-time | Socket.io |
| Backend | Node.js + Express + TypeScript |
| Haptics | expo-haptics |
| Gradients | expo-linear-gradient |

## 📝 License

MIT

## ✍️ Credits

Made by Yogesh.

UNO is a trademark of Mattel. This is a fan-made project and is not affiliated with or endorsed by Mattel.

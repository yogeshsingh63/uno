# UNO Card Visual System — Walkthrough

## Summary

Built **18 files** implementing every UNO card's visual appearance as reusable, animated React Native components using Reanimated 3. All card types render with correct anatomy per the spec, using View primitives (no SVG dependency required).

Additionally, successfully configured the physical mobile deployment pipeline by downgrading the Expo SDK to match Expo Go (SDK 54), implementing automatic network tunneling, and rewriting socket connection logic to dynamically detect the server URL.

---

## Mobile Connectivity & WSL Deployment

Running Expo on WSL (Windows Subsystem for Linux) introduces unique networking challenges because the WSL IP differs from the Windows Host IP. We implemented a robust setup to handle this:

1. **Expo SDK 54 Alignment:**
   - Downgraded `expo`, `react-native`, and `react-native-reanimated` to precisely match the versions bundled with the physical Android **Expo Go** application from the Play Store.
   - Pinned exact versions (`expo@54.0.34`, `react-native@0.76.9`) via legacy peer resolution and relinked the `@uno/shared` monorepo package.

2. **Dynamic Socket URL Resolution:**
   - Modified `socketService.ts` to automatically detect the LAN IP from `Constants.expoGoConfig.debuggerHost` as a fallback.
   - Server index was updated to listen on `0.0.0.0` instead of `localhost`, exposing it to the local network.

3. **Public Tunneling (`localhost.run`):**
   - Because the WSL game server port (3001) is inaccessible from external WiFi devices without strict Windows firewall forwarding, we bypassed the LAN entirely.
   - The game server is tunneled to a public `lhr.life` domain using SSH reverse tunneling (`ssh -R 80:localhost:3001 nokey@localhost.run`).
   - The `.env` file explicitly points `EXPO_PUBLIC_SERVER_URL` to the active tunnel, ensuring perfect cross-device syncing with zero local network setup required.

---

## File Structure (Section 17)

```
components/cards/
├── Card.tsx              ← Master component, 4 interactive states
├── CardBack.tsx          ← Face-down design (Section 3)
├── CardFace.tsx          ← Dispatcher to card type components
├── NumberCard.tsx         ← Digits 0–9 (Section 5)
├── SkipCard.tsx           ← Circle + slash symbol (Section 6)
├── ReverseCard.tsx        ← Two mirrored arrows (Section 7)
├── DrawTwoCard.tsx        ← Two-card fan with +2 (Section 8)
├── WildCard.tsx           ← 4-color pie on black (Section 9)
├── WildDrawFourCard.tsx   ← Four-card fan + pie (Section 10)
├── CardHand.tsx           ← Player hand with arc + frosted glass (Section 16)
├── CardMini.tsx           ← Opponent face-down cards (Section 12)
├── DiscardPile.tsx        ← 3-layer stack + color glow (Section 13)
└── DrawPile.tsx           ← Stacked card-backs + draw interaction

constants/
├── cardColors.ts          ← Official UNO palette (Section 2)
├── cardDimensions.ts      ← All 5 size tiers (Section 1)
├── cardData.ts            ← Re-export shim
├── colors.ts              ← Updated UNO_CARD_COLORS
└── animations.ts          ← Re-export shim

utils/
├── cardLayout.ts          ← Arc math, fan positions (Section 16)
└── cardAnimations.ts      ← Shake, float, pulse, deal sequences
```

---

## Key Implementations

### Section 1 — Card Dimensions
Five size tiers defined in `cardDimensions.ts`:
- Hand: 70×100px • Discard: 90×128px • Mini: 46×65px • MiniSm: 36×51px • Preview: 64×90px
- All sizes multiplied by `SIZE_SCALE` constant for global scaling

### Section 2 — Color Palette
Official Mattel UNO hex values in `cardColors.ts`:
- Red `#E53935` • Yellow `#FFD600` • Green `#43A047` • Blue `#1E88E5`
- Highlight variants, Wild BG `#1C1C1E`, Card Back `#1a1a2e`

### Section 3 — Card Back
`CardBack.tsx`:
- Deep navy bg, double red border (outer solid + inner faded 0.4 opacity)
- Tilted red rectangle (-20°) with yellow italic "UNO" text + black outline
- Four white corner dots

### Section 4+5 — Number Cards
`NumberCard.tsx`:
- Colored bg + radial highlight overlay + white oval (25° rotation, 140%×68%)
- Suit-colored digit on white oval with white text shadow
- Corner labels with color initial (R/Y/G/B) at 0.7 opacity
- 6/9 disambiguation white dot below digit

### Section 6 — Skip Card
`SkipCard.tsx`:
- Circle outline + 45° diagonal slash, both in suit color

### Section 7 — Reverse Card
`ReverseCard.tsx`:
- Two arrows with triangular arrowheads, mirrored vertically

### Section 8 — Draw Two Card
`DrawTwoCard.tsx`:
- Two mini playing-cards fanned ±12°, each showing "+2" in white

### Section 9 — Wild Card
`WildCard.tsx`:
- Matte black bg, 4-quadrant color pie (R/B/Y/G), "WILD" label
- Mini-pie in corners, declared color glow ring post-play

### Section 10 — Wild Draw Four
`WildDrawFourCard.tsx`:
- Four colored mini-cards fanned (-20° to +20°) on black bg
- Background pie at 0.5 opacity, "+4" label, corner "+4"
- Challenge pending = pulsing red glow ring
- Declared color ring after resolution

### Section 11 — Interactive States
`Card.tsx`:
1. **IDLE**: Playable cards float (translateY ±4px, 700ms loop)
2. **UNPLAYABLE**: Opacity 0.52, shake on tap
3. **SELECTED**: translateY -20px, scale 1.06 with spring
4. **BEING PLAYED**: Press feedback + callback

### Section 12 — Opponent Mini-Cards
`CardMini.tsx`:
- Up to 12 visible (46×65px) or 8 at 36×51px for 7+ players
- Alternating ±3° rotation, 12px offset
- Overflow "+N" badge when cards exceed max visible
- UNO state: red glow pulse on single remaining card

### Section 13 — Discard Pile
`DiscardPile.tsx`:
- 3-layer depth: prev-prev (0.4 opacity, +5°), prev (0.7, +2°), current (1.0)
- Pulsing color glow ring matching active color
- Wild cards show declared color ring

### Section 14 — UNO Button
`UnoButton.tsx`:
- 58px red circle, 3px white border
- Active: scale+shadow pulse (1.0↔1.1, 450ms loop)
- Tap: scale 0.88→1.0, floating yellow "UNO!" text launches upward (-80px)

### Section 16 — Hand Layout
`CardHand.tsx`:
- Frosted glass panel (rgba 0,0,0,0.42), 132px height, rounded 20px
- Arc formation: rotation `(i-mid)*2.8°`, yOffset `|i-mid|*3.5px`
- Left/right gradient fade masks (24px wide)
- Horizontal FlatList with 24px overlap and fast deceleration

---

## Changes to Existing Files

| File | Change |
|------|--------|
| `colors.ts` | Updated `UNO_CARD_COLORS` to official Mattel hex values |
| `cardData.ts` | Now re-exports from `cardColors.ts` + `cardDimensions.ts` |
| `animations.ts` | Now re-exports from `utils/cardAnimations.ts` |
| `PlayerSlot.tsx` | Now uses `CardMini` for opponent hands |

---

## Testing
Start the app with `npx expo start --clear` and press `w` for web preview.
Create a room, add a bot, and start a game to see all card types rendered.

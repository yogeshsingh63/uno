// ============================================================
// OfficialUnoCardSvg — Pixel-Perfect Vector UNO Card
// Precise 1:1 Creazilla vector specification:
// - Exact 100 x 148 viewBox with 3.5px white outer border
// - Diagonal white oval ellipse (rx 33.7, ry 55.1, +46.4°) touching side borders
// - Identical center ellipse size on every card (numbers, actions, wilds)
// - Crisp, upright bold geometric typography
// - Exact mini cards for +2 and +4
// - Exact geometric Skip and Reverse glyphs
// - Exact 4-color oval for Wilds
// ============================================================
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Rect, Ellipse, Path, G, Text as SvgText, Defs, ClipPath,
} from 'react-native-svg';

export type UnoCardType =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | 'SKIP' | 'REVERSE' | 'DRAW_TWO'
  | 'WILD' | 'WILD_DRAW_FOUR' | 'SWAP_HANDS' | 'SHUFFLE_HANDS';

interface OfficialUnoCardProps {
  type: UnoCardType;
  color: string; // RED, YELLOW, GREEN, BLUE, WILD
  width: number;
  height: number;
  borderRadius?: number;
  declaredColor?: string | null;
  challengePending?: boolean;
}

// ============================================================
// Wild 4-color oval sectors — explicit ellipse wedge paths.
// Drawn as real ellipse-bounded wedges (NOT clipped quadrants) because
// react-native-svg on web drops clipPath when the clip shape carries a
// transform AND the card is itself rotated (hand arc) — colors would
// bleed outside the oval. Each wedge = center + arc along the ellipse.
// Geometry: ellipse rotated 46.4°, dividers at 31.2° (reference-verified).
// ============================================================
// Center oval (50,74 / rx 33.7 / ry 55.1 @ 46.4°)
const GREEN_OVAL =
  'M 50 74 L 79.61 91.68 L 77.79 93.74 L 75.95 95.71 L 74.06 97.61 L 72.13 99.45 L 70.13 101.23 L 68.06 102.97 L 65.9 104.67 L 63.64 106.34 L 61.26 107.99 L 58.74 109.59 L 56.06 111.17 L 53.2 112.69 L 50.14 114.15 L 46.85 115.52 L 43.32 116.76 L 39.55 117.82 L 35.55 118.62 L 31.34 119.09 L 27 119.11 L 22.63 118.57 Z';
const YELLOW_OVAL =
  'M 50 74 L 23.3 118.69 L 19.03 117.61 L 15.01 115.82 L 11.45 113.29 L 8.49 110.09 L 6.25 106.34 L 4.76 102.2 L 3.99 97.86 L 3.84 93.47 L 4.21 89.17 L 4.99 85.06 L 6.07 81.17 L 7.37 77.53 L 8.82 74.14 L 10.37 70.99 L 12 68.07 L 13.68 65.34 L 15.39 62.79 L 17.12 60.4 L 18.89 58.14 L 20.67 55.99 Z';
const RED_OVAL =
  'M 50 74 L 20.39 56.32 L 22.21 54.26 L 24.05 52.29 L 25.94 50.39 L 27.87 48.55 L 29.87 46.77 L 31.94 45.03 L 34.1 43.33 L 36.36 41.66 L 38.74 40.01 L 41.26 38.41 L 43.94 36.83 L 46.8 35.31 L 49.86 33.85 L 53.15 32.48 L 56.68 31.24 L 60.45 30.18 L 64.45 29.38 L 68.66 28.91 L 73 28.89 L 77.37 29.43 Z';
const BLUE_OVAL =
  'M 50 74 L 76.7 29.31 L 80.97 30.39 L 84.99 32.18 L 88.55 34.71 L 91.51 37.91 L 93.75 41.66 L 95.24 45.8 L 96.01 50.14 L 96.16 54.53 L 95.79 58.83 L 95.01 62.94 L 93.93 66.83 L 92.63 70.47 L 91.18 73.86 L 89.63 77.01 L 88 79.93 L 86.32 82.66 L 84.61 85.21 L 82.88 87.6 L 81.11 89.86 L 79.33 92.01 Z';

// Corner TL mini-oval (17,25 / rx 6.8 / ry 10.8 @ 46.4°)
const GREEN_TL =
  'M 17 25 L 22.97 28.57 L 22.61 28.98 L 22.24 29.38 L 21.86 29.76 L 21.46 30.13 L 21.06 30.49 L 20.64 30.84 L 20.21 31.18 L 19.75 31.52 L 19.27 31.84 L 18.76 32.16 L 18.22 32.47 L 17.64 32.76 L 17.03 33.04 L 16.37 33.3 L 15.67 33.53 L 14.92 33.72 L 14.13 33.86 L 13.31 33.92 L 12.46 33.9 L 11.61 33.78 Z';
const YELLOW_TL =
  'M 17 25 L 11.74 33.8 L 10.91 33.57 L 10.14 33.2 L 9.44 32.7 L 8.86 32.08 L 8.42 31.35 L 8.11 30.54 L 7.93 29.7 L 7.88 28.85 L 7.93 28.01 L 8.06 27.2 L 8.25 26.43 L 8.49 25.7 L 8.76 25.03 L 9.06 24.4 L 9.37 23.81 L 9.7 23.26 L 10.04 22.74 L 10.38 22.26 L 10.73 21.8 L 11.09 21.37 Z';
const RED_TL =
  'M 17 25 L 11.03 21.43 L 11.39 21.02 L 11.76 20.62 L 12.14 20.24 L 12.54 19.87 L 12.94 19.51 L 13.36 19.16 L 13.79 18.82 L 14.25 18.48 L 14.73 18.16 L 15.24 17.84 L 15.78 17.53 L 16.36 17.24 L 16.97 16.96 L 17.63 16.7 L 18.33 16.47 L 19.08 16.28 L 19.87 16.14 L 20.69 16.08 L 21.54 16.1 L 22.39 16.22 Z';
const BLUE_TL =
  'M 17 25 L 22.26 16.2 L 23.09 16.43 L 23.86 16.8 L 24.56 17.3 L 25.14 17.92 L 25.58 18.65 L 25.89 19.46 L 26.07 20.3 L 26.12 21.15 L 26.07 21.99 L 25.94 22.8 L 25.75 23.57 L 25.51 24.3 L 25.24 24.97 L 24.94 25.6 L 24.63 26.19 L 24.3 26.74 L 23.96 27.26 L 23.62 27.74 L 23.27 28.2 L 22.91 28.63 Z';

// Corner BR mini-oval (83,123 / rx 6.8 / ry 10.8 @ 226.4°)
const GREEN_BR =
  'M 83 123 L 88.97 126.57 L 88.61 126.98 L 88.24 127.38 L 87.86 127.76 L 87.46 128.13 L 87.06 128.49 L 86.64 128.84 L 86.21 129.18 L 85.75 129.52 L 85.27 129.84 L 84.76 130.16 L 84.22 130.47 L 83.64 130.76 L 83.03 131.04 L 82.37 131.3 L 81.67 131.53 L 80.92 131.72 L 80.13 131.86 L 79.31 131.92 L 78.46 131.9 L 77.61 131.78 Z';
const YELLOW_BR =
  'M 83 123 L 77.74 131.8 L 76.91 131.57 L 76.14 131.2 L 75.44 130.7 L 74.86 130.08 L 74.42 129.35 L 74.11 128.54 L 73.93 127.7 L 73.88 126.85 L 73.93 126.01 L 74.06 125.2 L 74.25 124.43 L 74.49 123.7 L 74.76 123.03 L 75.06 122.4 L 75.37 121.81 L 75.7 121.26 L 76.04 120.74 L 76.38 120.26 L 76.73 119.8 L 77.09 119.37 Z';
const RED_BR =
  'M 83 123 L 77.03 119.43 L 77.39 119.02 L 77.76 118.62 L 78.14 118.24 L 78.54 117.87 L 78.94 117.51 L 79.36 117.16 L 79.79 116.82 L 80.25 116.48 L 80.73 116.16 L 81.24 115.84 L 81.78 115.53 L 82.36 115.24 L 82.97 114.96 L 83.63 114.7 L 84.33 114.47 L 85.08 114.28 L 85.87 114.14 L 86.69 114.08 L 87.54 114.1 L 88.39 114.22 Z';
const BLUE_BR =
  'M 83 123 L 88.26 114.2 L 89.09 114.43 L 89.86 114.8 L 90.56 115.3 L 91.14 115.92 L 91.58 116.65 L 91.89 117.46 L 92.07 118.3 L 92.12 119.15 L 92.07 119.99 L 91.94 120.8 L 91.75 121.57 L 91.51 122.3 L 91.24 122.97 L 90.94 123.6 L 90.63 124.19 L 90.3 124.74 L 89.96 125.26 L 89.62 125.74 L 89.27 126.2 L 88.91 126.63 Z';

// Reverse arrow path — measured pixel-by-pixel from the Creazilla reference:
// head at top-right (flat top edge + vertical front edge + hooked bottom corner),
// shaft curving down-left with an S-bend (cubic bezier) tapering to the tail point at (37.6, 84).
// The lower arrow is this path rotated 180° about the card center (50, 74).
const REVERSE_ARROW_PATH =
  'M 50.5 47.5 L 66.8 47.5 L 66.8 59.5 L 66.8 63.5 L 66.5 63.5 L 62.5 59.8 L 58.5 63.5 L 37.6 84 C 33.5 80 32 71.5 42 63.5 L 54.3 51.5 Z';

function getSuitColor(colorKey: string): string {
  switch (colorKey?.toUpperCase()) {
    case 'RED': return '#EB212E';
    case 'YELLOW': return '#FFBA00';
    case 'GREEN': return '#00B32C';
    case 'BLUE': return '#3E4EF7';
    default: return '#111116';
  }
}

function OfficialUnoCardSvg({
  type,
  color,
  width,
  height,
  borderRadius = 10,
  declaredColor,
  challengePending,
}: OfficialUnoCardProps) {
  const isWild = type === 'WILD' || type === 'WILD_DRAW_FOUR' || type === 'SWAP_HANDS' || type === 'SHUFFLE_HANDS';
  const baseColor = isWild ? '#111116' : getSuitColor(color);
  const declaredGlow = declaredColor ? getSuitColor(declaredColor) : null;

  return (
    <View style={[styles.wrapper, { width, height, borderRadius }]}>
      {/* Declared Color Halo (when played on table) */}
      {declaredGlow && (
        <View
          style={[styles.glowRing, {
            width: width + 8,
            height: height + 8,
            borderRadius: borderRadius + 4,
            borderColor: declaredGlow,
            shadowColor: declaredGlow,
          }]}
        />
      )}

      {/* Challenge Pending Red Pulse */}
      {challengePending && (
        <View
          style={[styles.challengeRing, {
            width: width + 8,
            height: height + 8,
            borderRadius: borderRadius + 4,
          }]}
        />
      )}

      <Svg width={width} height={height} viewBox="0 0 100 148">
        <Defs>
          {/* Card inner body clip path (untransformed rect — safe to clip) */}
          <ClipPath id="cardBodyClip">
            <Rect x="4.5" y="4.5" width="91" height="139" rx="6" />
          </ClipPath>
        </Defs>

        {/* 1. Outer White Card Frame */}
        <Rect x="1" y="1" width="98" height="146" rx="8.5" fill="#FFFFFF" />

        {/* 2. Inner Solid Color Field */}
        <Rect x="4.5" y="4.5" width="91" height="139" rx="6" fill={baseColor} />

        {/* ============================================================ */}
        {/* THE ICONIC DIAGONAL WHITE OVAL FILL (CREAZILLA SPEC)          */}
        {/* Tilted +46.4° (top tip up-right), bbox extremes clipped flush  */}
        {/* to the left/right walls — identical ellipse on every card.     */}
        {/* ============================================================ */}
        <G clipPath="url(#cardBodyClip)">
          {type !== 'WILD' && (
            <Ellipse
              cx="50"
              cy="74"
              rx="33.7"
              ry="55.1"
              fill="#FFFFFF"
              transform="rotate(46.4, 50, 74)"
            />
          )}
        </G>

        {/* ============================================================ */}
        {/* CENTER CONTENT AND CORNERS                                   */}
        {/* ============================================================ */}

        {/* --- NUMBER CARDS (0–9) --- */}
        {['0','1','2','3','4','5','6','7','8','9'].includes(type) && (
          <G>
            {/* Center Digit in Card's Solid Suit Color */}
            <SvgText
              x="50"
              y="99"
              fontSize="78"
              fontWeight="900"
              textAnchor="middle"
              fill={baseColor}
              fontFamily="Arial Black, Impact, 'Arial-BoldMT', sans-serif"
            >
              {type}
            </SvgText>

            {/* 6 and 9 Disambiguation Underline in Suit Color */}
            {(type === '6' || type === '9') && (
              <Rect x="36" y="105" width="28" height="5" rx="2.5" fill={baseColor} />
            )}

            {/* Top-Left Corner Index in Solid White */}
            <SvgText
              x="17"
              y="36"
              fontSize="33"
              fontWeight="900"
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="Arial Black, Impact, 'Arial-BoldMT', sans-serif"
            >
              {type}
            </SvgText>

            {/* Bottom-Right Corner Index in Solid White (Rotated 180°) */}
            <G transform="rotate(180, 83, 112)">
              <SvgText
                x="83"
                y="112"
                fontSize="33"
                fontWeight="900"
                textAnchor="middle"
                fill="#FFFFFF"
                fontFamily="Arial Black, Impact, 'Arial-BoldMT', sans-serif"
              >
                {type}
              </SvgText>
            </G>
          </G>
        )}

        {/* --- DRAW TWO (+2) --- */}
        {type === 'DRAW_TWO' && (
          <G>
            {/* Center Two Overlapping Tilted Mini Cards in Suit Color - Centered at (50, 74) */}
            {/* Both tilted 46.4° to run parallel with the center ellipse */}
            {/* 1. Back Mini Card (Lower-Left, centered at 43, 81) */}
            <G transform="rotate(46.4, 43, 81)">
              <Rect x="32" y="63" width="22" height="36" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="0.9" />
              <Rect x="34.5" y="65.5" width="17" height="31" rx="2.5" fill={baseColor} />
            </G>

            {/* 2. Front Mini Card (Upper-Right, centered at 57, 67) */}
            <G transform="rotate(46.4, 57, 67)">
              <Rect x="46" y="49" width="22" height="36" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="0.9" />
              <Rect x="48.5" y="51.5" width="17" height="31" rx="2.5" fill={baseColor} />
            </G>

            {/* Top-Left Corner "+2" in Solid White (same size as number corners) */}
            <SvgText
              x="26"
              y="36"
              fontSize="33"
              fontWeight="900"
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="Arial Black, Impact, sans-serif"
            >
              +2
            </SvgText>

            {/* Bottom-Right Corner "+2" in Solid White (Rotated 180°) */}
            <G transform="rotate(180, 74, 112)">
              <SvgText
                x="74"
                y="112"
                fontSize="33"
                fontWeight="900"
                textAnchor="middle"
                fill="#FFFFFF"
                fontFamily="Arial Black, Impact, sans-serif"
              >
                +2
              </SvgText>
            </G>
          </G>
        )}

        {/* --- SKIP / BLOCK (⊘) --- */}
        {type === 'SKIP' && (
          <G>
            {/* Center Skip Circle with Diagonal Bar in Suit Color */}
            <Ellipse cx="50" cy="74" rx="23" ry="23" fill="none" stroke={baseColor} strokeWidth="8" />
            <Path d="M 34 58 L 66 90" stroke={baseColor} strokeWidth="8" strokeLinecap="square" />

            {/* Top-Left Corner Skip in Solid White */}
            <Ellipse cx="17" cy="26" rx="9" ry="9" fill="none" stroke="#FFFFFF" strokeWidth="3.4" />
            <Path d="M 11 20 L 23 32" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="square" />

            {/* Bottom-Right Corner Skip in Solid White (Rotated 180°) */}
            <G transform="rotate(180, 83, 122)">
              <Ellipse cx="83" cy="122" rx="9" ry="9" fill="none" stroke="#FFFFFF" strokeWidth="3.4" />
              <Path d="M 77 116 L 89 128" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="square" />
            </G>
          </G>
        )}

        {/* --- REVERSE (⇄) --- */}
        {type === 'REVERSE' && (
          <G>
            {/* Center Interlocking Curved Reverse Arrows in Suit Color */}
            {/* Upper Arrow — head at top-right (pointing up-right), curved shaft tapering to tail at bottom-left */}
            {/* Geometry measured pixel-by-pixel from the Creazilla reference: bbox [33.5, 47.5]-[66.5, 100.5] */}
            <Path d={REVERSE_ARROW_PATH} fill={baseColor} />
            {/* Lower Arrow (Rotated 180° around center 50, 74) */}
            <G transform="rotate(180, 50, 74)">
              <Path d={REVERSE_ARROW_PATH} fill={baseColor} />
            </G>

            {/* Corner Top-Left in Solid White — same 0.47 scale, centered at (21, 25) as measured on the reference */}
            <G transform="translate(21, 25) scale(0.47) translate(-50, -74)">
              <Path d={REVERSE_ARROW_PATH} fill="#FFFFFF" />
              <G transform="rotate(180, 50, 74)">
                <Path d={REVERSE_ARROW_PATH} fill="#FFFFFF" />
              </G>
            </G>

            {/* Corner Bottom-Right in Solid White (Rotated 180° around card center 50, 74) */}
            <G transform="translate(79, 123) rotate(180) scale(0.47) translate(-50, -74)">
              <Path d={REVERSE_ARROW_PATH} fill="#FFFFFF" />
              <G transform="rotate(180, 50, 74)">
                <Path d={REVERSE_ARROW_PATH} fill="#FFFFFF" />
              </G>
            </G>
          </G>
        )}

        {/* --- WILD (4-COLOR OVAL) --- */}
        {type === 'WILD' && (
          <G>
            {/* Center 4-Color Oval — explicit ellipse wedges (no clipPath) */}
            <Path d={RED_OVAL} fill="#EB212E" />
            <Path d={BLUE_OVAL} fill="#3E4EF7" />
            <Path d={YELLOW_OVAL} fill="#FFBA00" />
            <Path d={GREEN_OVAL} fill="#00B32C" />
            {/* White Outline Border around 4-Color Oval */}
            <Ellipse
              cx="50"
              cy="74"
              rx="33.7"
              ry="55.1"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.6"
              transform="rotate(46.4, 50, 74)"
            />

            {/* Corner Top-Left Mini 4-Color Oval (tilted with the center oval) */}
            <Path d={RED_TL} fill="#EB212E" />
            <Path d={BLUE_TL} fill="#3E4EF7" />
            <Path d={YELLOW_TL} fill="#FFBA00" />
            <Path d={GREEN_TL} fill="#00B32C" />
            <Ellipse cx="17" cy="25" rx="6.8" ry="10.8" fill="none" stroke="#FFFFFF" strokeWidth="1.8" transform="rotate(46.4, 17, 25)" />

            {/* Corner Bottom-Right Mini 4-Color Oval (180°-flipped color layout, + tilt) */}
            <Path d={RED_BR} fill="#EB212E" />
            <Path d={BLUE_BR} fill="#3E4EF7" />
            <Path d={YELLOW_BR} fill="#FFBA00" />
            <Path d={GREEN_BR} fill="#00B32C" />
            <Ellipse cx="83" cy="123" rx="6.8" ry="10.8" fill="none" stroke="#FFFFFF" strokeWidth="1.8" transform="rotate(226.4, 83, 123)" />
          </G>
        )}

        {/* --- WILD DRAW FOUR (+4) --- */}
        {type === 'WILD_DRAW_FOUR' && (
          <G>
            {/* All four mini cards tilted 46.4° to run parallel with the center ellipse */}
            {/* 1. Red Mini Card (Down-Left, centered at 36, 80) */}
            <G transform="rotate(46.4, 36, 80)">
              <Rect x="26" y="63" width="20" height="34" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
              <Rect x="28.5" y="65.5" width="15" height="29" rx="2.5" fill="#EB212E" />
            </G>

            {/* 2. Blue Mini Card (Up-Right, centered at 60, 50) */}
            <G transform="rotate(46.4, 60, 50)">
              <Rect x="50" y="33" width="20" height="34" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
              <Rect x="52.5" y="35.5" width="15" height="29" rx="2.5" fill="#3E4EF7" />
            </G>

            {/* 3. Yellow Mini Card (Bottom, centered at 44, 98) */}
            <G transform="rotate(46.4, 44, 98)">
              <Rect x="34" y="81" width="20" height="34" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
              <Rect x="36.5" y="83.5" width="15" height="29" rx="2.5" fill="#FFBA00" />
            </G>

            {/* 4. Green Mini Card (Right, centered at 70, 66) */}
            <G transform="rotate(46.4, 70, 66)">
              <Rect x="60" y="49" width="20" height="34" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
              <Rect x="62.5" y="51.5" width="15" height="29" rx="2.5" fill="#00B32C" />
            </G>

            {/* Top-Left Corner "+4" (same size as number corners) */}
            <SvgText
              x="26"
              y="36"
              fontSize="33"
              fontWeight="900"
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="Arial Black, Impact, sans-serif"
            >
              +4
            </SvgText>

            {/* Bottom-Right Corner "+4" (Rotated 180°) */}
            <G transform="rotate(180, 74, 112)">
              <SvgText
                x="74"
                y="112"
                fontSize="33"
                fontWeight="900"
                textAnchor="middle"
                fill="#FFFFFF"
                fontFamily="Arial Black, Impact, sans-serif"
              >
                +4
              </SvgText>
            </G>
          </G>
        )}

        {/* --- SWAP HANDS (⇄) & SHUFFLE HANDS (⟳) --- */}
        {(type === 'SWAP_HANDS' || type === 'SHUFFLE_HANDS') && (
          <G>
            {/* Center 4-Color Oval — explicit ellipse wedges (no clipPath) */}
            <Path d={RED_OVAL} fill="#EB212E" />
            <Path d={BLUE_OVAL} fill="#3E4EF7" />
            <Path d={YELLOW_OVAL} fill="#FFBA00" />
            <Path d={GREEN_OVAL} fill="#00B32C" />
            <Ellipse
              cx="50"
              cy="74"
              rx="33.7"
              ry="55.1"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.6"
              transform="rotate(46.4, 50, 74)"
            />

            {/* Center Symbol with Solid Black Shadow */}
            <SvgText x="52.5" y="85.5" fontSize="38" fontWeight="900" textAnchor="middle" fill="#000000" fontFamily="Arial, sans-serif">
              {type === 'SWAP_HANDS' ? '⇄' : '⟳'}
            </SvgText>
            <SvgText x="50" y="83" fontSize="38" fontWeight="900" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial, sans-serif">
              {type === 'SWAP_HANDS' ? '⇄' : '⟳'}
            </SvgText>

            {/* Top-Left Corner */}
            <SvgText x="17" y="30" fontSize="20" fontWeight="900" textAnchor="middle" fill="#FFFFFF" stroke="#000000" strokeWidth="1" fontFamily="Arial, sans-serif">
              {type === 'SWAP_HANDS' ? '⇄' : '⟳'}
            </SvgText>

            {/* Bottom-Right Corner */}
            <G transform="rotate(180, 83, 118)">
              <SvgText x="83" y="118" fontSize="20" fontWeight="900" textAnchor="middle" fill="#FFFFFF" stroke="#000000" strokeWidth="1" fontFamily="Arial, sans-serif">
                {type === 'SWAP_HANDS' ? '⇄' : '⟳'}
              </SvgText>
            </G>
          </G>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 14,
  },
  challengeRing: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#E53935',
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 22,
    elevation: 14,
  },
});

export default memo(OfficialUnoCardSvg);

// ============================================================
// OfficialUnoCardSvg — Pixel-Perfect Vector UNO Card
// Precise 1:1 Creazilla vector specification:
// - Exact 100 x 148 viewBox with 3.5px white outer border
// - Diagonal white oval ellipse (rx 36.5, ry 56, -33°) touching side borders
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
          {/* Card inner body clip path */}
          <ClipPath id="cardBodyClip">
            <Rect x="4.5" y="4.5" width="91" height="139" rx="6" />
          </ClipPath>

          {/* Wild center 4-color oval clip */}
          <ClipPath id="wildCenterOval">
            <Ellipse cx="50" cy="74" rx="27" ry="42" transform="rotate(-33, 50, 74)" />
          </ClipPath>

          {/* Corner Top-Left Mini 4-color oval clip */}
          <ClipPath id="cornerTLOval">
            <Ellipse cx="17" cy="25" rx="6.8" ry="10.8" transform="rotate(-33, 17, 25)" />
          </ClipPath>

          {/* Corner Bottom-Right Mini 4-color oval clip */}
          <ClipPath id="cornerBROval">
            <Ellipse cx="83" cy="123" rx="6.8" ry="10.8" transform="rotate(147, 83, 123)" />
          </ClipPath>
        </Defs>

        {/* 1. Outer White Card Frame */}
        <Rect x="1" y="1" width="98" height="146" rx="8.5" fill="#FFFFFF" />

        {/* 2. Inner Solid Color Field */}
        <Rect x="4.5" y="4.5" width="91" height="139" rx="6" fill={baseColor} />

        {/* ============================================================ */}
        {/* THE ICONIC DIAGONAL WHITE OVAL FILL (CREAZILLA SPEC)          */}
        {/* ============================================================ */}
        <G clipPath="url(#cardBodyClip)">
          {type !== 'WILD' && (
            <Ellipse
              cx="50"
              cy="74"
              rx="36.5"
              ry="56"
              fill="#FFFFFF"
              transform="rotate(-33, 50, 74)"
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
            {/* 1. Back Mini Card (Lower-Left, centered at 43, 81, rotated 18°) */}
            <G transform="rotate(18, 43, 81)">
              <Rect x="32" y="63" width="22" height="36" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="0.9" />
              <Rect x="34.5" y="65.5" width="17" height="31" rx="2.5" fill={baseColor} />
            </G>

            {/* 2. Front Mini Card (Upper-Right, centered at 57, 67, rotated 18°) */}
            <G transform="rotate(18, 57, 67)">
              <Rect x="46" y="49" width="22" height="36" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="0.9" />
              <Rect x="48.5" y="51.5" width="17" height="31" rx="2.5" fill={baseColor} />
            </G>

            {/* Top-Left Corner "+2" in Solid White */}
            <SvgText
              x="17"
              y="32"
              fontSize="25"
              fontWeight="900"
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="Arial Black, Impact, sans-serif"
            >
              +2
            </SvgText>

            {/* Bottom-Right Corner "+2" in Solid White (Rotated 180°) */}
            <G transform="rotate(180, 83, 116)">
              <SvgText
                x="83"
                y="116"
                fontSize="25"
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
            {/* Top-Right Arrow */}
            <Path
              d="M 67 32 L 67 50 L 58 50 L 58 56 C 58 66 52 74 37 74 C 47 70 50 63 50 54 L 50 42 L 50 32 Z"
              fill={baseColor}
            />
            {/* Bottom-Left Arrow (Rotated 180° around center 50, 74) */}
            <G transform="rotate(180, 50, 74)">
              <Path
                d="M 67 32 L 67 50 L 58 50 L 58 56 C 58 66 52 74 37 74 C 47 70 50 63 50 54 L 50 42 L 50 32 Z"
                fill={baseColor}
              />
            </G>

            {/* Corner Top-Left in Solid White */}
            <G transform="translate(17, 26) scale(0.46) translate(-50, -74)">
              <Path
                d="M 67 32 L 67 50 L 58 50 L 58 56 C 58 66 52 74 37 74 C 47 70 50 63 50 54 L 50 42 L 50 32 Z"
                fill="#FFFFFF"
              />
              <G transform="rotate(180, 50, 74)">
                <Path
                  d="M 67 32 L 67 50 L 58 50 L 58 56 C 58 66 52 74 37 74 C 47 70 50 63 50 54 L 50 42 L 50 32 Z"
                  fill="#FFFFFF"
                />
              </G>
            </G>

            {/* Corner Bottom-Right in Solid White (Rotated 180°) */}
            <G transform="translate(83, 122) rotate(180) scale(0.46) translate(-50, -74)">
              <Path
                d="M 67 32 L 67 50 L 58 50 L 58 56 C 58 66 52 74 37 74 C 47 70 50 63 50 54 L 50 42 L 50 32 Z"
                fill="#FFFFFF"
              />
              <G transform="rotate(180, 50, 74)">
                <Path
                  d="M 67 32 L 67 50 L 58 50 L 58 56 C 58 66 52 74 37 74 C 47 70 50 63 50 54 L 50 42 L 50 32 Z"
                  fill="#FFFFFF"
                />
              </G>
            </G>
          </G>
        )}

        {/* --- WILD (4-COLOR OVAL) --- */}
        {type === 'WILD' && (
          <G>
            {/* Center 4-Color Oval */}
            <G clipPath="url(#wildCenterOval)">
              {/* Top-Left Sector: RED */}
              <Path d="M 50 74 L 50 0 L 0 0 L 0 74 Z" fill="#EB212E" />
              {/* Top-Right Sector: BLUE */}
              <Path d="M 50 74 L 50 0 L 100 0 L 100 74 Z" fill="#3E4EF7" />
              {/* Middle-Left Sector: YELLOW */}
              <Path d="M 50 74 L 0 74 L 0 148 L 26 148 Z" fill="#FFBA00" />
              {/* Bottom & Bottom-Right Sector: GREEN */}
              <Path d="M 50 74 L 100 74 L 100 148 L 26 148 Z" fill="#00B32C" />
            </G>
            {/* White Outline Border around 4-Color Oval */}
            <Ellipse
              cx="50"
              cy="74"
              rx="27"
              ry="42"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.6"
              transform="rotate(-33, 50, 74)"
            />

            {/* Corner Top-Left Mini 4-Color Oval */}
            <G clipPath="url(#cornerTLOval)">
              <Path d="M 17 25 L 17 0 L 0 0 L 0 25 Z" fill="#EB212E" />
              <Path d="M 17 25 L 17 0 L 34 0 L 34 25 Z" fill="#3E4EF7" />
              <Path d="M 17 25 L 0 25 L 0 50 L 9 50 Z" fill="#FFBA00" />
              <Path d="M 17 25 L 34 25 L 34 50 L 9 50 Z" fill="#00B32C" />
            </G>
            <Ellipse cx="17" cy="25" rx="6.8" ry="10.8" fill="none" stroke="#FFFFFF" strokeWidth="1.8" transform="rotate(-33, 17, 25)" />

            {/* Corner Bottom-Right Mini 4-Color Oval (Rotated 180°) */}
            <G clipPath="url(#cornerBROval)">
              <Path d="M 83 123 L 83 148 L 100 148 L 100 123 Z" fill="#EB212E" />
              <Path d="M 83 123 L 83 148 L 66 148 L 66 123 Z" fill="#3E4EF7" />
              <Path d="M 83 123 L 100 123 L 100 98 L 91 98 Z" fill="#FFBA00" />
              <Path d="M 83 123 L 66 123 L 66 98 L 91 98 Z" fill="#00B32C" />
            </G>
            <Ellipse cx="83" cy="123" rx="6.8" ry="10.8" fill="none" stroke="#FFFFFF" strokeWidth="1.8" transform="rotate(147, 83, 123)" />
          </G>
        )}

        {/* --- WILD DRAW FOUR (+4) --- */}
        {type === 'WILD_DRAW_FOUR' && (
          <G>
            {/* 1. Red Mini Card (Left, rotated -14°) */}
            <G transform="rotate(-14, 31, 70)">
              <Rect x="21" y="53" width="20" height="34" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
              <Rect x="23.5" y="55.5" width="15" height="29" rx="2.5" fill="#EB212E" />
            </G>

            {/* 2. Blue Mini Card (Top-Center, rotated 12°) */}
            <G transform="rotate(12, 48, 53)">
              <Rect x="38" y="36" width="20" height="34" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
              <Rect x="40.5" y="38.5" width="15" height="29" rx="2.5" fill="#3E4EF7" />
            </G>

            {/* 3. Yellow Mini Card (Bottom-Center, rotated 10°) */}
            <G transform="rotate(10, 44, 77)">
              <Rect x="34" y="60" width="20" height="34" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
              <Rect x="36.5" y="62.5" width="15" height="29" rx="2.5" fill="#FFBA00" />
            </G>

            {/* 4. Green Mini Card (Right, rotated 18°) */}
            <G transform="rotate(18, 60, 64)">
              <Rect x="50" y="47" width="20" height="34" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
              <Rect x="52.5" y="49.5" width="15" height="29" rx="2.5" fill="#00B32C" />
            </G>

            {/* Top-Left Corner "+4" */}
            <SvgText
              x="17"
              y="32"
              fontSize="25"
              fontWeight="900"
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="Arial Black, Impact, sans-serif"
            >
              +4
            </SvgText>

            {/* Bottom-Right Corner "+4" (Rotated 180°) */}
            <G transform="rotate(180, 83, 116)">
              <SvgText
                x="83"
                y="116"
                fontSize="25"
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
            {/* Center 4-Color Oval */}
            <G clipPath="url(#wildCenterOval)">
              <Path d="M 50 74 L 50 0 L 0 0 L 0 74 Z" fill="#EB212E" />
              <Path d="M 50 74 L 50 0 L 100 0 L 100 74 Z" fill="#3E4EF7" />
              <Path d="M 50 74 L 0 74 L 0 148 L 26 148 Z" fill="#FFBA00" />
              <Path d="M 50 74 L 100 74 L 100 148 L 26 148 Z" fill="#00B32C" />
            </G>
            <Ellipse
              cx="50"
              cy="74"
              rx="27"
              ry="42"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.6"
              transform="rotate(-33, 50, 74)"
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

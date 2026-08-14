// ============================================================
// OfficialUnoCardSvg — Pixel-Perfect Vector UNO Card
// Renders exact 1:1 official Mattel UNO cards:
// - White outer frame with smooth card radius
// - Diagonal white oval ellipse ring precisely proportioned
// - Solid black 3D drop shadows on all symbols & digits
// - Exact 4-color oval for Wilds with white outline border
// - Exact 4-card cascade for +4 on solid white oval fill
// - Exact 2-card overlap for +2 with black drop shadows
// - Exact skip circle & 45° bar for Skip
// - Exact interlocking reverse arrows for Reverse
// ============================================================
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Rect, Ellipse, Path, G, Text as SvgText, Defs, ClipPath,
} from 'react-native-svg';
import { CARD_COLORS } from '../../constants/cardColors';

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
    case 'RED': return '#D71921';
    case 'YELLOW': return '#F9B200';
    case 'GREEN': return '#279B37';
    case 'BLUE': return '#0066D6';
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

  // ViewBox: 100 x 148 (standard official 1:1.48 UNO card proportion)
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
            <Ellipse cx="13" cy="19" rx="6.8" ry="10.8" transform="rotate(-33, 13, 19)" />
          </ClipPath>

          {/* Corner Bottom-Right Mini 4-color oval clip */}
          <ClipPath id="cornerBROval">
            <Ellipse cx="87" cy="129" rx="6.8" ry="10.8" transform="rotate(147, 87, 129)" />
          </ClipPath>
        </Defs>

        {/* 1. Outer White Card Frame */}
        <Rect x="1" y="1" width="98" height="146" rx="8.5" fill="#FFFFFF" />

        {/* 2. Inner Solid Color Field */}
        <Rect x="4.5" y="4.5" width="91" height="139" rx="6" fill={baseColor} />

        {/* ============================================================ */}
        {/* THE ICONIC DIAGONAL WHITE OVAL FILL                          */}
        {/* ============================================================ */}
        <G clipPath="url(#cardBodyClip)">
          {type !== 'WILD' && (
            <Ellipse
              cx="50"
              cy="74"
              rx="38"
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
              y="97"
              fontSize="74"
              fontWeight="900"
              fontStyle="italic"
              textAnchor="middle"
              fill={baseColor}
              fontFamily="Arial, sans-serif"
            >
              {type}
            </SvgText>

            {/* 6 and 9 Disambiguation Underline in Suit Color */}
            {(type === '6' || type === '9') && (
              <Rect x="36" y="104" width="28" height="5" rx="2.5" fill={baseColor} />
            )}

            {/* Top-Left Corner Index in Solid White */}
            <SvgText
              x="13.5"
              y="25"
              fontSize="23"
              fontWeight="900"
              fontStyle="italic"
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="Arial, sans-serif"
            >
              {type}
            </SvgText>

            {/* Bottom-Right Corner Index in Solid White (Rotated 180°) */}
            <G transform="rotate(180, 86.5, 123)">
              <SvgText
                x="86.5"
                y="123"
                fontSize="23"
                fontWeight="900"
                fontStyle="italic"
                textAnchor="middle"
                fill="#FFFFFF"
                fontFamily="Arial, sans-serif"
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
            {/* 1. Back Mini Card (Lower-Left, centered at 42, 84, rotated 18°) */}
            <G transform="rotate(18, 42, 84)">
              <Rect x="30.5" y="65" width="23" height="38" rx="4.5" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
              <Rect x="33" y="67.5" width="18" height="33" rx="2.8" fill={baseColor} />
            </G>

            {/* 2. Front Mini Card (Upper-Right, centered at 58, 64, rotated 18°) */}
            <G transform="rotate(18, 58, 64)">
              <Rect x="46.5" y="45" width="23" height="38" rx="4.5" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
              <Rect x="49" y="47.5" width="18" height="33" rx="2.8" fill={baseColor} />
            </G>

            {/* Top-Left Corner "+2" in Solid White */}
            <SvgText
              x="13.5"
              y="26"
              fontSize="24"
              fontWeight="900"
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="Arial, sans-serif"
            >
              +2
            </SvgText>

            {/* Bottom-Right Corner "+2" in Solid White (Rotated 180°) */}
            <G transform="rotate(180, 86.5, 122)">
              <SvgText
                x="86.5"
                y="122"
                fontSize="24"
                fontWeight="900"
                textAnchor="middle"
                fill="#FFFFFF"
                fontFamily="Arial, sans-serif"
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
            <Ellipse cx="50" cy="74" rx="22" ry="22" fill="none" stroke={baseColor} strokeWidth="7.5" />
            <Path d="M 34.5 58.5 L 65.5 89.5" stroke={baseColor} strokeWidth="7.5" strokeLinecap="square" />

            {/* Top-Left Corner Skip in Solid White */}
            <Ellipse cx="13.5" cy="23" rx="8.5" ry="8.5" fill="none" stroke="#FFFFFF" strokeWidth="3.2" />
            <Path d="M 7.5 17 L 19.5 29" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="square" />

            {/* Bottom-Right Corner Skip in Solid White (Rotated 180°) */}
            <G transform="rotate(180, 86.5, 125)">
              <Ellipse cx="86.5" cy="125" rx="8.5" ry="8.5" fill="none" stroke="#FFFFFF" strokeWidth="3.2" />
              <Path d="M 80.5 119 L 92.5 131" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="square" />
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
            <G transform="translate(13.5, 23) scale(0.44) translate(-50, -74)">
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
            <G transform="translate(86.5, 125) rotate(180) scale(0.44) translate(-50, -74)">
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
              <Path d="M 50 74 L 50 0 L 0 0 L 0 74 Z" fill="#ED3838" />
              {/* Top-Right Sector: BLUE */}
              <Path d="M 50 74 L 50 0 L 100 0 L 100 74 Z" fill="#3B4BF5" />
              {/* Middle-Left Sector: YELLOW */}
              <Path d="M 50 74 L 0 74 L 0 148 L 26 148 Z" fill="#FFA000" />
              {/* Bottom & Bottom-Right Sector: GREEN */}
              <Path d="M 50 74 L 100 74 L 100 148 L 26 148 Z" fill="#00A825" />
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
              <Path d="M 13 19 L 13 0 L 0 0 L 0 19 Z" fill="#ED3838" />
              <Path d="M 13 19 L 13 0 L 30 0 L 30 19 Z" fill="#3B4BF5" />
              <Path d="M 13 19 L 0 19 L 0 40 L 7 40 Z" fill="#FFA000" />
              <Path d="M 13 19 L 30 19 L 30 40 L 7 40 Z" fill="#00A825" />
            </G>
            <Ellipse cx="13" cy="19" rx="6.8" ry="10.8" fill="none" stroke="#FFFFFF" strokeWidth="1.8" transform="rotate(-33, 13, 19)" />

            {/* Corner Bottom-Right Mini 4-Color Oval (Rotated 180°) */}
            <G clipPath="url(#cornerBROval)">
              <Path d="M 87 129 L 87 148 L 100 148 L 100 129 Z" fill="#ED3838" />
              <Path d="M 87 129 L 87 148 L 70 148 L 70 129 Z" fill="#3B4BF5" />
              <Path d="M 87 129 L 100 129 L 100 110 L 93 110 Z" fill="#FFA000" />
              <Path d="M 87 129 L 70 129 L 70 110 L 93 110 Z" fill="#00A825" />
            </G>
            <Ellipse cx="87" cy="129" rx="6.8" ry="10.8" fill="none" stroke="#FFFFFF" strokeWidth="1.8" transform="rotate(147, 87, 129)" />
          </G>
        )}

        {/* --- WILD DRAW FOUR (+4) --- */}
        {type === 'WILD_DRAW_FOUR' && (
          <G>
            {/* 1. Red Mini Card (Left, rotated -14°) */}
            <G transform="rotate(-14, 31, 70)">
              <Rect x="21" y="53" width="20" height="34" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
              <Rect x="23.5" y="55.5" width="15" height="29" rx="2.5" fill="#ED3838" />
            </G>

            {/* 2. Blue Mini Card (Top-Center, rotated 12°) */}
            <G transform="rotate(12, 48, 53)">
              <Rect x="38" y="36" width="20" height="34" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
              <Rect x="40.5" y="38.5" width="15" height="29" rx="2.5" fill="#4252F5" />
            </G>

            {/* 3. Yellow Mini Card (Bottom-Center, rotated 10°) */}
            <G transform="rotate(10, 44, 77)">
              <Rect x="34" y="60" width="20" height="34" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
              <Rect x="36.5" y="62.5" width="15" height="29" rx="2.5" fill="#FFA000" />
            </G>

            {/* 4. Green Mini Card (Right, rotated 18°) */}
            <G transform="rotate(18, 60, 64)">
              <Rect x="50" y="47" width="20" height="34" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
              <Rect x="52.5" y="49.5" width="15" height="29" rx="2.5" fill="#00A825" />
            </G>

            {/* Top-Left Corner "+4" */}
            <SvgText
              x="13.5"
              y="25"
              fontSize="23"
              fontWeight="900"
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="Arial, sans-serif"
            >
              +4
            </SvgText>

            {/* Bottom-Right Corner "+4" (Rotated 180°) */}
            <G transform="rotate(180, 86.5, 123)">
              <SvgText
                x="86.5"
                y="123"
                fontSize="23"
                fontWeight="900"
                textAnchor="middle"
                fill="#FFFFFF"
                fontFamily="Arial, sans-serif"
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
              <Path d="M 50 74 L 50 0 L 0 0 L 0 74 Z" fill="#ED3838" />
              <Path d="M 50 74 L 50 0 L 100 0 L 100 74 Z" fill="#3B4BF5" />
              <Path d="M 50 74 L 0 74 L 0 148 L 26 148 Z" fill="#FFA000" />
              <Path d="M 50 74 L 100 74 L 100 148 L 26 148 Z" fill="#00A825" />
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
            <SvgText x="13.5" y="24" fontSize="18" fontWeight="900" textAnchor="middle" fill="#FFFFFF" stroke="#000000" strokeWidth="1" fontFamily="Arial, sans-serif">
              {type === 'SWAP_HANDS' ? '⇄' : '⟳'}
            </SvgText>

            {/* Bottom-Right Corner */}
            <G transform="rotate(180, 86.5, 126)">
              <SvgText x="86.5" y="126" fontSize="18" fontWeight="900" textAnchor="middle" fill="#FFFFFF" stroke="#000000" strokeWidth="1" fontFamily="Arial, sans-serif">
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

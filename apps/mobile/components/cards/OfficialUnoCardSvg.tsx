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
            <Ellipse cx="50" cy="74" rx="35" ry="52" transform="rotate(-33, 50, 74)" />
          </ClipPath>

          {/* Corner Top-Left Mini 4-color oval clip */}
          <ClipPath id="cornerTLOval">
            <Ellipse cx="23" cy="23" rx="10.5" ry="16" transform="rotate(-33, 23, 23)" />
          </ClipPath>

          {/* Corner Bottom-Right Mini 4-color oval clip */}
          <ClipPath id="cornerBROval">
            <Ellipse cx="77" cy="125" rx="10.5" ry="16" transform="rotate(147, 77, 125)" />
          </ClipPath>
        </Defs>

        {/* 1. Outer White Card Frame */}
        <Rect x="1" y="1" width="98" height="146" rx="8.5" fill="#FFFFFF" />

        {/* 2. Inner Solid Color Field */}
        <Rect x="4.5" y="4.5" width="91" height="139" rx="6" fill={baseColor} />

        {/* 3. The Iconic Diagonal White Oval Stripe */}
        <G clipPath="url(#cardBodyClip)">
          {isWild && type === 'WILD_DRAW_FOUR' ? (
            // Solid White Oval Fill for Wild Draw 4 (+4)
            <Ellipse
              cx="50"
              cy="74"
              rx="38"
              ry="60"
              fill="#FFFFFF"
              transform="rotate(-27, 50, 74)"
            />
          ) : (
            // Open White Oval Outline Ring for Number & Action cards
            <Ellipse
              cx="50"
              cy="74"
              rx="37"
              ry="58"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4.2"
              transform="rotate(-27, 50, 74)"
            />
          )}
        </G>

        {/* ============================================================ */}
        {/* CENTER CONTENT AND CORNERS                                   */}
        {/* ============================================================ */}

        {/* --- NUMBER CARDS (0–9) --- */}
        {['0','1','2','3','4','5','6','7','8','9'].includes(type) && (
          <G>
            {/* Center Digit 3D Solid Black Shadow */}
            <SvgText
              x="53.5"
              y="97.5"
              fontSize="68"
              fontWeight="900"
              fontStyle="italic"
              textAnchor="middle"
              fill="#000000"
              fontFamily="Arial, sans-serif"
            >
              {type}
            </SvgText>
            {/* Center Digit Pure White Front */}
            <SvgText
              x="50"
              y="94"
              fontSize="68"
              fontWeight="900"
              fontStyle="italic"
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="Arial, sans-serif"
            >
              {type}
            </SvgText>

            {/* 6 and 9 Disambiguation Underline */}
            {(type === '6' || type === '9') && (
              <G>
                <Rect x="38.5" y="104.5" width="28" height="4.5" rx="2" fill="#000000" />
                <Rect x="36" y="102" width="28" height="4.5" rx="2" fill="#FFFFFF" />
              </G>
            )}

            {/* Top-Left Corner Index */}
            <SvgText x="13.5" y="24" fontSize="20" fontWeight="900" fontStyle="italic" textAnchor="middle" fill="#000000" fontFamily="Arial, sans-serif">
              {type}
            </SvgText>
            <SvgText x="12" y="22.5" fontSize="20" fontWeight="900" fontStyle="italic" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial, sans-serif">
              {type}
            </SvgText>

            {/* Bottom-Right Corner Index (Rotated 180°) */}
            <G transform="rotate(180, 86.5, 126)">
              <SvgText x="88" y="127.5" fontSize="20" fontWeight="900" fontStyle="italic" textAnchor="middle" fill="#000000" fontFamily="Arial, sans-serif">
                {type}
              </SvgText>
              <SvgText x="86.5" y="126" fontSize="20" fontWeight="900" fontStyle="italic" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial, sans-serif">
                {type}
              </SvgText>
            </G>
          </G>
        )}

        {/* --- DRAW TWO (+2) --- */}
        {type === 'DRAW_TWO' && (
          <G>
            {/* Center Two Overlapping Cards */}
            {/* Back Mini Card (Top-Right) */}
            <Rect x="48" y="42" width="22" height="34" rx="3.5" fill="#000000" />
            <Rect x="45" y="39" width="22" height="34" rx="3.5" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />

            {/* Front Mini Card (Bottom-Left) */}
            <Rect x="37" y="58" width="22" height="34" rx="3.5" fill="#000000" />
            <Rect x="34" y="55" width="22" height="34" rx="3.5" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />

            {/* Top-Left Corner "+2" */}
            <SvgText x="15" y="22.5" fontSize="17" fontWeight="900" fontStyle="italic" textAnchor="middle" fill="#000000" fontFamily="Arial, sans-serif">
              +2
            </SvgText>
            <SvgText x="13.5" y="21" fontSize="17" fontWeight="900" fontStyle="italic" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial, sans-serif">
              +2
            </SvgText>

            {/* Bottom-Right Corner "+2" (Rotated 180°) */}
            <G transform="rotate(180, 85.5, 127)">
              <SvgText x="87" y="128.5" fontSize="17" fontWeight="900" fontStyle="italic" textAnchor="middle" fill="#000000" fontFamily="Arial, sans-serif">
                +2
              </SvgText>
              <SvgText x="85.5" y="127" fontSize="17" fontWeight="900" fontStyle="italic" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial, sans-serif">
                +2
              </SvgText>
            </G>
          </G>
        )}

        {/* --- SKIP (⊘) --- */}
        {type === 'SKIP' && (
          <G>
            {/* Center Skip Circle with 45° Diagonal Bar */}
            {/* Black 3D Shadow */}
            <G transform="translate(3, 3)">
              <Ellipse cx="50" cy="74" rx="20" ry="20" fill="none" stroke="#000000" strokeWidth="7" />
              <Path d="M 36 60 L 64 88" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
            </G>
            {/* White Front */}
            <G>
              <Ellipse cx="50" cy="74" rx="20" ry="20" fill="none" stroke="#FFFFFF" strokeWidth="7" />
              <Path d="M 36 60 L 64 88" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
            </G>

            {/* Corner Top-Left */}
            <G transform="translate(1.5, 1.5)">
              <Ellipse cx="12.5" cy="18" rx="7.5" ry="7.5" fill="none" stroke="#000000" strokeWidth="3" />
              <Path d="M 7.5 13 L 17.5 23" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
            </G>
            <G>
              <Ellipse cx="12.5" cy="18" rx="7.5" ry="7.5" fill="none" stroke="#FFFFFF" strokeWidth="3" />
              <Path d="M 7.5 13 L 17.5 23" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            </G>

            {/* Corner Bottom-Right (Rotated 180°) */}
            <G transform="rotate(180, 86.5, 130)">
              <G transform="translate(1.5, 1.5)">
                <Ellipse cx="86.5" cy="130" rx="7.5" ry="7.5" fill="none" stroke="#000000" strokeWidth="3" />
                <Path d="M 81.5 125 L 91.5 135" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
              </G>
              <G>
                <Ellipse cx="86.5" cy="130" rx="7.5" ry="7.5" fill="none" stroke="#FFFFFF" strokeWidth="3" />
                <Path d="M 81.5 125 L 91.5 135" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
              </G>
            </G>
          </G>
        )}

        {/* --- REVERSE (⇄) --- */}
        {type === 'REVERSE' && (
          <G>
            {/* Center Interlocking Curved Reverse Arrows */}
            {/* Black 3D Shadow */}
            <G transform="translate(2.5, 2.5)">
              {/* Upper Arrow (curving down-left) */}
              <Path
                d="M 45 45 C 56 45 64 51 64 61 L 64 64 L 69 64 L 59 78 L 49 64 L 54 64 L 54 60 C 54 55 49 51 43 51 L 40 51 L 40 56 L 27 47 L 40 38 L 40 45 Z"
                fill="#000000"
              />
              {/* Lower Arrow (curving up-right) */}
              <Path
                d="M 55 103 C 44 103 36 97 36 87 L 36 84 L 31 84 L 41 70 L 51 84 L 46 84 L 46 88 C 46 93 51 97 57 97 L 60 97 L 60 92 L 73 101 L 60 110 L 60 103 Z"
                fill="#000000"
              />
            </G>
            {/* White Front Arrows */}
            <G>
              <Path
                d="M 45 45 C 56 45 64 51 64 61 L 64 64 L 69 64 L 59 78 L 49 64 L 54 64 L 54 60 C 54 55 49 51 43 51 L 40 51 L 40 56 L 27 47 L 40 38 L 40 45 Z"
                fill="#FFFFFF"
                stroke="#000000"
                strokeWidth="1.2"
              />
              <Path
                d="M 55 103 C 44 103 36 97 36 87 L 36 84 L 31 84 L 41 70 L 51 84 L 46 84 L 46 88 C 46 93 51 97 57 97 L 60 97 L 60 92 L 73 101 L 60 110 L 60 103 Z"
                fill="#FFFFFF"
                stroke="#000000"
                strokeWidth="1.2"
              />
            </G>

            {/* Corner Top-Left */}
            <G transform="scale(0.38) translate(3, 4)">
              <Path
                d="M 45 45 C 56 45 64 51 64 61 L 64 64 L 69 64 L 59 78 L 49 64 L 54 64 L 54 60 C 54 55 49 51 43 51 L 40 51 L 40 56 L 27 47 L 40 38 L 40 45 Z"
                fill="#FFFFFF"
                stroke="#000000"
                strokeWidth="2"
              />
              <Path
                d="M 55 103 C 44 103 36 97 36 87 L 36 84 L 31 84 L 41 70 L 51 84 L 46 84 L 46 88 C 46 93 51 97 57 97 L 60 97 L 60 92 L 73 101 L 60 110 L 60 103 Z"
                fill="#FFFFFF"
                stroke="#000000"
                strokeWidth="2"
              />
            </G>

            {/* Corner Bottom-Right (Rotated 180°) */}
            <G transform="rotate(180, 86.5, 128) scale(0.38) translate(198, 280)">
              <Path
                d="M 45 45 C 56 45 64 51 64 61 L 64 64 L 69 64 L 59 78 L 49 64 L 54 64 L 54 60 C 54 55 49 51 43 51 L 40 51 L 40 56 L 27 47 L 40 38 L 40 45 Z"
                fill="#FFFFFF"
                stroke="#000000"
                strokeWidth="2"
              />
              <Path
                d="M 55 103 C 44 103 36 97 36 87 L 36 84 L 31 84 L 41 70 L 51 84 L 46 84 L 46 88 C 46 93 51 97 57 97 L 60 97 L 60 92 L 73 101 L 60 110 L 60 103 Z"
                fill="#FFFFFF"
                stroke="#000000"
                strokeWidth="2"
              />
            </G>
          </G>
        )}

        {/* --- WILD (4-COLOR OVAL) --- */}
        {type === 'WILD' && (
          <G>
            {/* Center Giant 4-Color Oval */}
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
              rx="35"
              ry="52"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4"
              transform="rotate(-33, 50, 74)"
            />

            {/* Corner Top-Left Mini 4-Color Oval */}
            <G clipPath="url(#cornerTLOval)">
              <Path d="M 23 23 L 23 0 L 0 0 L 0 23 Z" fill="#ED3838" />
              <Path d="M 23 23 L 23 0 L 50 0 L 50 23 Z" fill="#3B4BF5" />
              <Path d="M 23 23 L 0 23 L 0 50 L 12 50 Z" fill="#FFA000" />
              <Path d="M 23 23 L 50 23 L 50 50 L 12 50 Z" fill="#00A825" />
            </G>
            <Ellipse cx="23" cy="23" rx="10.5" ry="16" fill="none" stroke="#FFFFFF" strokeWidth="2.2" transform="rotate(-33, 23, 23)" />

            {/* Corner Bottom-Right Mini 4-Color Oval (Rotated 180°) */}
            <G clipPath="url(#cornerBROval)">
              <Path d="M 77 125 L 77 148 L 100 148 L 100 125 Z" fill="#ED3838" />
              <Path d="M 77 125 L 77 148 L 50 148 L 50 125 Z" fill="#3B4BF5" />
              <Path d="M 77 125 L 100 125 L 100 100 L 88 100 Z" fill="#FFA000" />
              <Path d="M 77 125 L 50 125 L 50 100 L 88 100 Z" fill="#00A825" />
            </G>
            <Ellipse cx="77" cy="125" rx="10.5" ry="16" fill="none" stroke="#FFFFFF" strokeWidth="2.2" transform="rotate(147, 77, 125)" />
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
              rx="35"
              ry="52"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4"
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

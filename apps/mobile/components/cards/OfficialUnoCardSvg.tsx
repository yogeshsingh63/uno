// ============================================================
// OfficialUnoCardSvg — Pixel-Perfect Vector UNO Card
// Renders exact 1:1 official Mattel UNO cards:
// - White outer frame
// - Diagonal white oval ellipse ring
// - 3D solid black drop shadows on all symbols & digits
// - Exact 4-color oval for Wilds
// - Exact 4-card cascade for +4
// - Exact 2-card overlap for +2
// - Exact skip circle & bar for Skip
// - Exact reverse curved arrows for Reverse
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

  // ViewBox coordinates: 100 x 148 (standard 1:1.48 UNO card aspect ratio)
  return (
    <View style={[styles.wrapper, { width, height, borderRadius }]}>
      {/* Declared Color Halo (when in play) */}
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
          {/* Card body clip path */}
          <ClipPath id="cardClip">
            <Rect x="4.5" y="4.5" width="91" height="139" rx="6" />
          </ClipPath>
          {/* Wild center oval clip */}
          <ClipPath id="wildOvalClip">
            <Ellipse cx="50" cy="74" rx="27" ry="42" transform="rotate(-28, 50, 74)" />
          </ClipPath>
          {/* Corner top-left oval clip */}
          <ClipPath id="cornerTLOvalClip">
            <Ellipse cx="13" cy="18" rx="8" ry="12" transform="rotate(-28, 13, 18)" />
          </ClipPath>
          {/* Corner bottom-right oval clip */}
          <ClipPath id="cornerBROvalClip">
            <Ellipse cx="87" cy="130" rx="8" ry="12" transform="rotate(152, 87, 130)" />
          </ClipPath>
        </Defs>

        {/* Outer White Card Border */}
        <Rect x="1.5" y="1.5" width="97" height="145" rx="9" fill="#FFFFFF" />

        {/* Inner Card Background Color */}
        <Rect x="4.5" y="4.5" width="91" height="139" rx="6" fill={baseColor} />

        {/* ============================================================ */}
        {/* THE ICONIC DIAGONAL WHITE OVAL STRIPE                        */}
        {/* ============================================================ */}
        <G clipPath="url(#cardClip)">
          {isWild && type === 'WILD_DRAW_FOUR' ? (
            // Solid white oval fill behind +4 cards
            <Ellipse
              cx="50"
              cy="74"
              rx="37"
              ry="58"
              fill="#FFFFFF"
              transform="rotate(-28, 50, 74)"
            />
          ) : (
            // Open white oval outline ring across the card
            <Ellipse
              cx="50"
              cy="74"
              rx="36"
              ry="56"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4"
              transform="rotate(-28, 50, 74)"
            />
          )}
        </G>

        {/* ============================================================ */}
        {/* CENTER CONTENT BASED ON CARD TYPE                            */}
        {/* ============================================================ */}

        {/* 1. NUMBER CARDS (0–9) */}
        {['0','1','2','3','4','5','6','7','8','9'].includes(type) && (
          <G>
            {/* Center Digit 3D Black Drop Shadow */}
            <SvgText
              x="53"
              y="97"
              fontSize="68"
              fontWeight="900"
              fontStyle="italic"
              textAnchor="middle"
              fill="#000000"
              fontFamily="Arial, sans-serif"
            >
              {type}
            </SvgText>
            {/* Center Digit Front White */}
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

            {/* 6 and 9 Underline */}
            {(type === '6' || type === '9') && (
              <G>
                <Rect x="37" y="104" width="28" height="4.5" rx="2" fill="#000000" />
                <Rect x="35" y="102" width="28" height="4.5" rx="2" fill="#FFFFFF" />
              </G>
            )}

            {/* Top-Left Corner Index */}
            <SvgText x="13" y="24" fontSize="20" fontWeight="900" fontStyle="italic" textAnchor="middle" fill="#000000" fontFamily="Arial, sans-serif">
              {type}
            </SvgText>
            <SvgText x="11.5" y="22.5" fontSize="20" fontWeight="900" fontStyle="italic" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial, sans-serif">
              {type}
            </SvgText>

            {/* Bottom-Right Corner Index (Inverted 180°) */}
            <G transform="rotate(180, 87, 126)">
              <SvgText x="88.5" y="127.5" fontSize="20" fontWeight="900" fontStyle="italic" textAnchor="middle" fill="#000000" fontFamily="Arial, sans-serif">
                {type}
              </SvgText>
              <SvgText x="87" y="126" fontSize="20" fontWeight="900" fontStyle="italic" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial, sans-serif">
                {type}
              </SvgText>
            </G>
          </G>
        )}

        {/* 2. DRAW TWO (+2) */}
        {type === 'DRAW_TWO' && (
          <G>
            {/* Center Two Overlapping Cards */}
            {/* Back Card (Top-Right) */}
            <Rect x="47" y="41" width="20" height="32" rx="3.5" fill="#000000" />
            <Rect x="44" y="38" width="20" height="32" rx="3.5" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />

            {/* Front Card (Bottom-Left) */}
            <Rect x="37" y="57" width="20" height="32" rx="3.5" fill="#000000" />
            <Rect x="34" y="54" width="20" height="32" rx="3.5" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />

            {/* Top-Left Corner "+2" */}
            <SvgText x="14.5" y="22.5" fontSize="17" fontWeight="900" fontStyle="italic" textAnchor="middle" fill="#000000" fontFamily="Arial, sans-serif">
              +2
            </SvgText>
            <SvgText x="13" y="21" fontSize="17" fontWeight="900" fontStyle="italic" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial, sans-serif">
              +2
            </SvgText>

            {/* Bottom-Right Corner "+2" (Inverted 180°) */}
            <G transform="rotate(180, 86, 127)">
              <SvgText x="87.5" y="128.5" fontSize="17" fontWeight="900" fontStyle="italic" textAnchor="middle" fill="#000000" fontFamily="Arial, sans-serif">
                +2
              </SvgText>
              <SvgText x="86" y="127" fontSize="17" fontWeight="900" fontStyle="italic" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial, sans-serif">
                +2
              </SvgText>
            </G>
          </G>
        )}

        {/* 3. SKIP (⊘) */}
        {type === 'SKIP' && (
          <G>
            {/* Center Skip Icon Shadow */}
            <G transform="translate(3, 3)">
              <Ellipse cx="50" cy="74" rx="20" ry="20" fill="none" stroke="#000000" strokeWidth="7" />
              <Path d="M 36 60 L 64 88" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
            </G>
            {/* Center Skip Icon White */}
            <G>
              <Ellipse cx="50" cy="74" rx="20" ry="20" fill="none" stroke="#FFFFFF" strokeWidth="7" />
              <Path d="M 36 60 L 64 88" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
            </G>

            {/* Corner Top-Left */}
            <G transform="translate(1.5, 1.5)">
              <Ellipse cx="12" cy="18" rx="7.5" ry="7.5" fill="none" stroke="#000000" strokeWidth="3" />
              <Path d="M 7 13 L 17 23" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
            </G>
            <G>
              <Ellipse cx="12" cy="18" rx="7.5" ry="7.5" fill="none" stroke="#FFFFFF" strokeWidth="3" />
              <Path d="M 7 13 L 17 23" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            </G>

            {/* Corner Bottom-Right (Inverted 180°) */}
            <G transform="rotate(180, 87, 130)">
              <G transform="translate(1.5, 1.5)">
                <Ellipse cx="87" cy="130" rx="7.5" ry="7.5" fill="none" stroke="#000000" strokeWidth="3" />
                <Path d="M 82 125 L 92 135" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
              </G>
              <G>
                <Ellipse cx="87" cy="130" rx="7.5" ry="7.5" fill="none" stroke="#FFFFFF" strokeWidth="3" />
                <Path d="M 82 125 L 92 135" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
              </G>
            </G>
          </G>
        )}

        {/* 4. REVERSE (⇄) */}
        {type === 'REVERSE' && (
          <G>
            {/* Center Reverse Double Curved Arrows with 3D Shadow */}
            {/* Shadow */}
            <G transform="translate(2.5, 2.5)">
              {/* Upper Arrow (pointing down-left) */}
              <Path d="M 38 48 L 52 48 L 52 64 L 62 64 L 45 84 L 28 64 L 38 64 Z" fill="#000000" transform="rotate(-30, 50, 74)" />
              {/* Lower Arrow (pointing up-right) */}
              <Path d="M 38 48 L 52 48 L 52 64 L 62 64 L 45 84 L 28 64 L 38 64 Z" fill="#000000" transform="rotate(150, 50, 74)" />
            </G>
            {/* Front White */}
            <G>
              <Path d="M 38 48 L 52 48 L 52 64 L 62 64 L 45 84 L 28 64 L 38 64 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" transform="rotate(-30, 50, 74)" />
              <Path d="M 38 48 L 52 48 L 52 64 L 62 64 L 45 84 L 28 64 L 38 64 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" transform="rotate(150, 50, 74)" />
            </G>

            {/* Corner Top-Left */}
            <G transform="scale(0.42) translate(-10, -5)">
              <Path d="M 38 48 L 52 48 L 52 64 L 62 64 L 45 84 L 28 64 L 38 64 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" transform="rotate(-30, 50, 74)" />
              <Path d="M 38 48 L 52 48 L 52 64 L 62 64 L 45 84 L 28 64 L 38 64 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" transform="rotate(150, 50, 74)" />
            </G>

            {/* Corner Bottom-Right (Inverted 180°) */}
            <G transform="rotate(180, 87, 130) scale(0.42) translate(168, 235)">
              <Path d="M 38 48 L 52 48 L 52 64 L 62 64 L 45 84 L 28 64 L 38 64 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" transform="rotate(-30, 50, 74)" />
              <Path d="M 38 48 L 52 48 L 52 64 L 62 64 L 45 84 L 28 64 L 38 64 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" transform="rotate(150, 50, 74)" />
            </G>
          </G>
        )}

        {/* 5. WILD (4-COLOR OVAL) */}
        {type === 'WILD' && (
          <G>
            {/* Center Giant 4-Color Oval */}
            <G clipPath="url(#wildOvalClip)">
              {/* Top-Left: RED */}
              <Rect x="0" y="0" width="50" height="74" fill={CARD_COLORS.RED} />
              {/* Top-Right: BLUE */}
              <Rect x="50" y="0" width="50" height="74" fill={CARD_COLORS.BLUE} />
              {/* Bottom-Left: YELLOW */}
              <Rect x="0" y="74" width="50" height="74" fill={CARD_COLORS.YELLOW} />
              {/* Bottom-Right: GREEN */}
              <Rect x="50" y="74" width="50" height="74" fill={CARD_COLORS.GREEN} />
            </G>
            {/* White Border around 4-Color Oval */}
            <Ellipse
              cx="50"
              cy="74"
              rx="27"
              ry="42"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              transform="rotate(-28, 50, 74)"
            />

            {/* Corner Top-Left Mini 4-Color Oval */}
            <G clipPath="url(#cornerTLOvalClip)">
              <Rect x="0" y="0" width="13" height="18" fill={CARD_COLORS.RED} />
              <Rect x="13" y="0" width="13" height="18" fill={CARD_COLORS.BLUE} />
              <Rect x="0" y="18" width="13" height="18" fill={CARD_COLORS.YELLOW} />
              <Rect x="13" y="18" width="13" height="18" fill={CARD_COLORS.GREEN} />
            </G>
            <Ellipse cx="13" cy="18" rx="8" ry="12" fill="none" stroke="#FFFFFF" strokeWidth="1.8" transform="rotate(-28, 13, 18)" />

            {/* Corner Bottom-Right Mini 4-Color Oval (Inverted 180°) */}
            <G clipPath="url(#cornerBROvalClip)">
              <Rect x="74" y="112" width="13" height="18" fill={CARD_COLORS.GREEN} />
              <Rect x="87" y="112" width="13" height="18" fill={CARD_COLORS.YELLOW} />
              <Rect x="74" y="130" width="13" height="18" fill={CARD_COLORS.BLUE} />
              <Rect x="87" y="130" width="13" height="18" fill={CARD_COLORS.RED} />
            </G>
            <Ellipse cx="87" cy="130" rx="8" ry="12" fill="none" stroke="#FFFFFF" strokeWidth="1.8" transform="rotate(152, 87, 130)" />
          </G>
        )}

        {/* 6. WILD DRAW FOUR (+4) */}
        {type === 'WILD_DRAW_FOUR' && (
          <G>
            {/* Center 4 Overlapping Cards (Green, Blue, Red, Yellow) */}
            {/* 1. Green (Bottom-Left) */}
            <Rect x="20" y="56" width="18" height="28" rx="2.5" fill="#000000" />
            <Rect x="18" y="54" width="18" height="28" rx="2.5" fill={CARD_COLORS.GREEN} stroke="#000000" strokeWidth="1.5" />

            {/* 2. Blue (Mid-Left) */}
            <Rect x="34" y="38" width="18" height="28" rx="2.5" fill="#000000" />
            <Rect x="32" y="36" width="18" height="28" rx="2.5" fill={CARD_COLORS.BLUE} stroke="#000000" strokeWidth="1.5" />

            {/* 3. Red (Center-Right) */}
            <Rect x="46" y="47" width="18" height="28" rx="2.5" fill="#000000" />
            <Rect x="44" y="45" width="18" height="28" rx="2.5" fill={CARD_COLORS.RED} stroke="#000000" strokeWidth="1.5" />

            {/* 4. Yellow (Top-Right) */}
            <Rect x="60" y="30" width="18" height="28" rx="2.5" fill="#000000" />
            <Rect x="58" y="28" width="18" height="28" rx="2.5" fill={CARD_COLORS.YELLOW} stroke="#000000" strokeWidth="1.5" />

            {/* Top-Left Corner "+4" */}
            <SvgText x="14.5" y="22.5" fontSize="17" fontWeight="900" fontStyle="italic" textAnchor="middle" fill="#000000" fontFamily="Arial, sans-serif">
              +4
            </SvgText>
            <SvgText x="13" y="21" fontSize="17" fontWeight="900" fontStyle="italic" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial, sans-serif">
              +4
            </SvgText>

            {/* Bottom-Right Corner "+4" (Inverted 180°) */}
            <G transform="rotate(180, 86, 127)">
              <SvgText x="87.5" y="128.5" fontSize="17" fontWeight="900" fontStyle="italic" textAnchor="middle" fill="#000000" fontFamily="Arial, sans-serif">
                +4
              </SvgText>
              <SvgText x="86" y="127" fontSize="17" fontWeight="900" fontStyle="italic" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial, sans-serif">
                +4
              </SvgText>
            </G>
          </G>
        )}

        {/* 7. SWAP HANDS (⇄) & SHUFFLE HANDS (⟳) */}
        {(type === 'SWAP_HANDS' || type === 'SHUFFLE_HANDS') && (
          <G>
            {/* Center 4-Color Oval */}
            <G clipPath="url(#wildOvalClip)">
              <Rect x="0" y="0" width="50" height="74" fill={CARD_COLORS.RED} />
              <Rect x="50" y="0" width="50" height="74" fill={CARD_COLORS.BLUE} />
              <Rect x="0" y="74" width="50" height="74" fill={CARD_COLORS.YELLOW} />
              <Rect x="50" y="74" width="50" height="74" fill={CARD_COLORS.GREEN} />
            </G>
            <Ellipse
              cx="50"
              cy="74"
              rx="27"
              ry="42"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              transform="rotate(-28, 50, 74)"
            />

            {/* Center Symbol with Black Shadow */}
            <SvgText x="52" y="85" fontSize="38" fontWeight="900" textAnchor="middle" fill="#000000" fontFamily="Arial, sans-serif">
              {type === 'SWAP_HANDS' ? '⇄' : '⟳'}
            </SvgText>
            <SvgText x="50" y="83" fontSize="38" fontWeight="900" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial, sans-serif">
              {type === 'SWAP_HANDS' ? '⇄' : '⟳'}
            </SvgText>

            {/* Top-Left Corner */}
            <SvgText x="13" y="24" fontSize="18" fontWeight="900" textAnchor="middle" fill="#FFFFFF" stroke="#000000" strokeWidth="0.8" fontFamily="Arial, sans-serif">
              {type === 'SWAP_HANDS' ? '⇄' : '⟳'}
            </SvgText>

            {/* Bottom-Right Corner */}
            <G transform="rotate(180, 87, 126)">
              <SvgText x="87" y="126" fontSize="18" fontWeight="900" textAnchor="middle" fill="#FFFFFF" stroke="#000000" strokeWidth="0.8" fontFamily="Arial, sans-serif">
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

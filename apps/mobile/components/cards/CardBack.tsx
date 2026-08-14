// ============================================================
// CardBack — Official Authentic UNO Card Back
// Outer white border, solid black body, giant tilted red oval,
// and the iconic 3D golden-yellow "UNO" wordmark.
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Rect, Ellipse, G, Text as SvgText, Defs, ClipPath, LinearGradient, Stop,
} from 'react-native-svg';

interface CardBackProps {
  width: number;
  height: number;
  borderRadius?: number;
}

function CardBack({ width, height, borderRadius = 10 }: CardBackProps) {
  return (
    <View style={[styles.card, { width, height, borderRadius }]}>
      <Svg width={width} height={height} viewBox="0 0 100 148">
        <Defs>
          {/* Card inner body clip path */}
          <ClipPath id="cardBackClip">
            <Rect x="4.5" y="4.5" width="91" height="139" rx="6" />
          </ClipPath>

          {/* Gold Gradient for UNO Text */}
          <LinearGradient id="unoGold" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFF466" />
            <Stop offset="45%" stopColor="#FFD400" />
            <Stop offset="100%" stopColor="#FF9500" />
          </LinearGradient>
        </Defs>

        {/* 1. Outer White Card Frame */}
        <Rect x="1" y="1" width="98" height="146" rx="8.5" fill="#FFFFFF" />

        {/* 2. Inner Solid Black Field */}
        <Rect x="4.5" y="4.5" width="91" height="139" rx="6" fill="#0B0B0E" />

        {/* 3. The Iconic Giant Red Filled Oval */}
        <G clipPath="url(#cardBackClip)">
          <Ellipse
            cx="50"
            cy="74"
            rx="34"
            ry="50"
            fill="#ED1C24"
            transform="rotate(-33, 50, 74)"
          />
        </G>

        {/* 4. The 3D Golden "UNO" Wordmark */}
        <G transform="rotate(-12, 50, 74)">
          {/* 3D Drop Extrusion Layers (Dark Warm Gold/Brown) */}
          <SvgText
            x="53"
            y="87"
            fontSize="36"
            fontWeight="900"
            fontStyle="italic"
            textAnchor="middle"
            fill="#5A1E00"
            fontFamily="Arial, sans-serif"
          >
            UNO
          </SvgText>
          <SvgText
            x="52"
            y="86"
            fontSize="36"
            fontWeight="900"
            fontStyle="italic"
            textAnchor="middle"
            fill="#7A2D00"
            fontFamily="Arial, sans-serif"
          >
            UNO
          </SvgText>
          <SvgText
            x="51"
            y="85"
            fontSize="36"
            fontWeight="900"
            fontStyle="italic"
            textAnchor="middle"
            fill="#9C4400"
            fontFamily="Arial, sans-serif"
          >
            UNO
          </SvgText>

          {/* Front Golden Yellow UNO Text */}
          <SvgText
            x="50"
            y="84"
            fontSize="36"
            fontWeight="900"
            fontStyle="italic"
            textAnchor="middle"
            fill="url(#unoGold)"
            stroke="#D88000"
            strokeWidth="0.8"
            fontFamily="Arial, sans-serif"
          >
            UNO
          </SvgText>
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default memo(CardBack);

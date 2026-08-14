// ============================================================
// PressableScale — press = scale 0.94 + brightness bump,
// release = spring back. Shared micro-interaction for buttons.
// ============================================================
import React, { memo, useCallback } from 'react';
import { Pressable, PressableProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { soundService } from '../../services/soundService';
import { SPRING } from '../../constants/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends PressableProps {
  /** Play the near-silent click sound on press */
  click?: boolean;
}

function PressableScale({ click = true, onPressIn, onPressOut, onPress, style, children, ...rest }: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback((e: any) => {
    scale.value = withSpring(0.94, SPRING.snappy);
    onPressIn?.(e);
  }, [onPressIn, scale]);

  const handlePressOut = useCallback((e: any) => {
    scale.value = withSpring(1, SPRING.bounce);
    onPressOut?.(e);
  }, [onPressOut, scale]);

  const handlePress = useCallback((e: any) => {
    if (click) soundService.play('click');
    onPress?.(e);
  }, [click, onPress]);

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}

export default memo(PressableScale);

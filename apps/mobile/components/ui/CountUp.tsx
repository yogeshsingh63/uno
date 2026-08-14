// ============================================================
// CountUp — eases a number from 0 to `value` (used for score
// tallies so results "count up" instead of snapping).
// ============================================================
import React, { memo, useEffect, useState } from 'react';
import { Text, TextProps } from 'react-native';
import { usePrefersReducedMotion } from '../../constants/motion';

interface CountUpProps extends TextProps {
  value: number;
  duration?: number;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function CountUp({ value, duration = 800, style, ...rest }: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(easeOutCubic(t) * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduced]);

  return (
    <Text style={style} {...rest}>
      {display}
    </Text>
  );
}

export default memo(CountUp);

import { Heart } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion } from '@/shared/hooks';
import { durations, springs, useTheme } from '@/shared/theme';

/** Heart icon that is outlined when idle and filled red when liked, with a small pop. */
export function AnimatedHeart({
  liked,
  size = 20,
}: Readonly<{ liked: boolean; size?: number }>) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduceMotion) return;
    scale.value = liked
      ? withSequence(
          withTiming(0.8, { duration: durations.fast }),
          withSpring(1, springs.bouncy),
        )
      : withTiming(1, { duration: durations.fast });
  }, [liked, reduceMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Heart
        color={liked ? colors.likeActive : colors.textMuted}
        fill={liked ? colors.likeActive : 'transparent'}
        size={size}
      />
    </Animated.View>
  );
}

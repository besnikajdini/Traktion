// Thin Pressable wrapper that gives every tappable element the same pressed
// feedback (opacity dip). RN has no CSS-style :active, so without this each
// Pressable in the app renders identically whether or not a touch is
// registered — this is the one primitive that fixes that everywhere it's used.
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

type Props = PressableProps & {
  style?: StyleProp<ViewStyle>;
};

export function PressableOpacity({ style, ...props }: Props) {
  return (
    <Pressable
      {...props}
      style={(state) => [
        typeof style === 'function' ? style(state) : style,
        state.pressed && { opacity: 0.65 },
      ]}
    />
  );
}

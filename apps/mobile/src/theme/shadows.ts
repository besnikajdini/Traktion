// Elevation presets for surface cards. Subtle by design — an OLED dark app
// reads depth mostly through shadow-on-black rather than brightness, so keep
// opacity low and radius soft (per the ui-ux-pro-max "Dark Mode (OLED)"
// guidance: minimal glow, no bright halos).
import type { ViewStyle } from 'react-native';

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  } as ViewStyle,
  raised: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  } as ViewStyle,
} as const;

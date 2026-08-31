// Font pairing from the ui-ux-pro-max skill's "Sports/Fitness" recommendation:
// Barlow Condensed for headings/labels (athletic, condensed, high-impact),
// Barlow for anything the user reads at length or types into. Loaded via
// @expo-google-fonts/{barlow,barlow-condensed} — see App.tsx.
export const fontFamily = {
  headingBold: 'BarlowCondensed_700Bold',
  headingSemiBold: 'BarlowCondensed_600SemiBold',
  body: 'Barlow_400Regular',
  bodyMedium: 'Barlow_500Medium',
  bodySemiBold: 'Barlow_600SemiBold',
  bodyBold: 'Barlow_700Bold',
} as const;

/** Reusable text style presets. Headings use uppercase + tracking (the
 *  "exaggerated minimalism" impact-headline look) — only for short, fixed
 *  UI labels (screen titles, buttons), never for user-entered content like
 *  exercise or plan names, where uppercase would just hurt readability. */
export const typography = {
  screenTitle: {
    fontFamily: fontFamily.headingBold,
    fontSize: 26,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  sectionTitle: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: 15,
    letterSpacing: 0.4,
    textTransform: 'uppercase' as const,
  },
  cardTitle: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 16,
  },
  bigNumber: {
    fontFamily: fontFamily.headingBold,
    fontSize: 30,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 15,
  },
  bodyMedium: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 15,
  },
  caption: {
    fontFamily: fontFamily.body,
    fontSize: 12,
  },
  button: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: 15,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
  },
} as const;

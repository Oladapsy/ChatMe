export const Fonts = {
  family: {
    regular: 'SFProDisplay-Regular',
    medium: 'SFProDisplay-Medium',
    bold: 'SFProDisplay-Bold',
    blackItalic: 'SFProDisplay-BlackItalic',
    heavyItalic: 'SFProDisplay-HeavyItalic',
    lightItalic: 'SFProDisplay-LightItalic',
    semiboldItalic: 'SFProDisplay-SemiboldItalic',
    thinItalic: 'SFProDisplay-ThinItalic',
    ultralightItalic: 'SFProDisplay-UltralightItalic',
  },
  // Default font weights mapped to font family keys
  weights: {
    regular: 'SFProDisplay-Regular',
    medium: 'SFProDisplay-Medium',
    semibold: 'SFProDisplay-SemiboldItalic', // Mapped to loaded Semibold variant
    bold: 'SFProDisplay-Bold',
  },
} as const;

export type FontWeight = keyof typeof Fonts.weights;
export type FontFamily = keyof typeof Fonts.family;
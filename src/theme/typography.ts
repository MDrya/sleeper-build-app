// ============================================================================
// Typography — Clean, Modern, Readable
// ============================================================================

export const typography = {
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
  },

  fontSize: {
    xs: '0.6875rem',      // 11px — micro labels
    sm: '0.8125rem',      // 13px — secondary text
    base: '0.9375rem',    // 15px — body text
    md: '1.0625rem',      // 17px — slightly larger body
    lg: '1.25rem',        // 20px — section headers
    xl: '1.5rem',         // 24px — page titles
    '2xl': '2rem',        // 32px — hero numbers (level, score)
    '3xl': '2.5rem',      // 40px — big emphasis
    '4xl': '3.5rem',      // 56px — splash/onboarding
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },

  lineHeight: {
    tight: '1.1',
    snug: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },

  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.04em',
    wider: '0.08em',
    widest: '0.12em',
  },
} as const;

// ============================================================================
// Spacing & Layout Constants
// ============================================================================

export const spacing = {
  /** 4px base unit */
  unit: 4,

  /** Named spacing scale (in px) */
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
  '4xl': '64px',

  /** Tile gap in the dashboard grid */
  tileGap: '12px',

  /** Border radius */
  radius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    full: '9999px',
  },
} as const;

export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
} as const;

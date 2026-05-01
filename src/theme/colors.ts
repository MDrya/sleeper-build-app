// ============================================================================
// Color System — Sleeper Build Dark Theme
// ============================================================================
// A premium dark palette. Inspired by terminal aesthetics, RPG interfaces,
// and tiling window managers. Minimal, high-contrast, purposeful.
// ============================================================================

export const colors = {
  // --- Background Layers (darkest → lightest) ---
  bg: {
    primary: '#0A0A0F',        // Main background — near-black with blue undertone
    secondary: '#12121A',      // Card/tile background
    tertiary: '#1A1A2E',       // Elevated surfaces, modals
    hover: '#222238',          // Interactive hover state
    active: '#2A2A42',         // Active/pressed state
  },

  // --- Text ---
  text: {
    primary: '#E8E8F0',        // Main body text — warm white
    secondary: '#9898B0',      // Secondary/muted text
    tertiary: '#5A5A78',       // Disabled/placeholder text
    inverse: '#0A0A0F',        // Text on light backgrounds
  },

  // --- Accent (Primary Action) ---
  accent: {
    primary: '#7C5CFC',        // Main accent — rich purple
    hover: '#8E72FF',          // Accent hover
    muted: '#7C5CFC22',        // Accent with low opacity (backgrounds)
    glow: '#7C5CFC40',         // Glow/shadow effect
  },

  // --- Tier Colors (match tier definitions) ---
  tier: {
    0: '#6B7280',              // Civilian — slate
    1: '#22C55E',              // Initiate — green
    2: '#3B82F6',              // Adept — blue
    3: '#A855F7',              // Operator — purple
    4: '#F59E0B',              // Sleeper — gold
  } as Record<number, string>,

  // --- Semantic ---
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // --- EXP Bar Gradient ---
  exp: {
    start: '#7C5CFC',          // Left edge
    end: '#00D4AA',            // Right edge — purple to teal
    bg: '#1A1A2E',             // Track background
  },

  // --- Strength Score Gradient ---
  strength: {
    low: '#EF4444',            // 0-30 — red
    mid: '#F59E0B',            // 30-60 — amber
    high: '#22C55E',           // 60-80 — green
    elite: '#F59E0B',          // 80-100 — gold shimmer
  },

  // --- Borders ---
  border: {
    subtle: '#ffffff08',       // Nearly invisible dividers
    default: '#ffffff12',      // Standard borders
    strong: '#ffffff20',       // Emphasized borders
    accent: '#7C5CFC40',      // Accent-colored borders
  },

  // --- Streak Fire ---
  streak: {
    flame1: '#FF6B35',         // Outer flame
    flame2: '#F7931E',         // Mid flame
    flame3: '#FFD700',         // Inner flame — gold core
  },
} as const;

// CSS variable mapping (injected via App.css)
export const cssVars = Object.entries({
  '--color-bg-primary': colors.bg.primary,
  '--color-bg-secondary': colors.bg.secondary,
  '--color-bg-tertiary': colors.bg.tertiary,
  '--color-bg-hover': colors.bg.hover,
  '--color-text-primary': colors.text.primary,
  '--color-text-secondary': colors.text.secondary,
  '--color-text-tertiary': colors.text.tertiary,
  '--color-accent': colors.accent.primary,
  '--color-accent-hover': colors.accent.hover,
  '--color-accent-muted': colors.accent.muted,
  '--color-accent-glow': colors.accent.glow,
  '--color-success': colors.success,
  '--color-warning': colors.warning,
  '--color-error': colors.error,
  '--color-border-subtle': colors.border.subtle,
  '--color-border-default': colors.border.default,
  '--color-border-strong': colors.border.strong,
}).reduce((acc, [key, value]) => {
  acc[key] = value;
  return acc;
}, {} as Record<string, string>);

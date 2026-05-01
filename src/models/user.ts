// ============================================================================
// User Profile & Body Metrics
// ============================================================================
// Tracks the user's physical stats, RPG progression, and calibration data.
// The "Sleeper Build" philosophy: track relative improvements, not vanity metrics.
// ============================================================================

import type { Tier } from './boss-fight';

// ---------------------------------------------------------------------------
// Body Metric History
// ---------------------------------------------------------------------------

/** A single body measurement snapshot, recorded over time. */
export interface BodyMetricEntry {
  /** ISO date string of when the measurement was taken */
  date: string;

  /** Body weight in kilograms */
  weightKg: number;

  /**
   * Apparent height in centimeters.
   * This can *increase* with consistent posture work and spinal decompression.
   * Tracked separately from true skeletal height to show posture gains.
   */
  apparentHeightCm: number;
}

/** Aggregated body metrics derived from the user's history. */
export interface BodyMetrics {
  /** True skeletal height — set once during calibration (cm) */
  baseHeightCm: number;

  /** Current body weight (kg) — latest entry from history */
  currentWeightKg: number;

  /**
   * Current apparent height (cm) — latest entry from history.
   * Shows the real-world effect of decompression hangs, stretching, and posture work.
   */
  currentApparentHeightCm: number;

  /** Ideal target weight (kg) — calculated during baseline calibration */
  idealTargetWeightKg: number;

  /** Daily maintenance calories — recalculated when weight changes */
  dailyMaintenanceCalories: number;

  /** BMI — recalculated from currentWeightKg and baseHeightCm */
  bmi: number;

  /** Full history of body metric entries, ordered by date ascending */
  history: BodyMetricEntry[];
}

// ---------------------------------------------------------------------------
// RPG Progression
// ---------------------------------------------------------------------------

/** The user's RPG-style progression state. */
export interface UserProgression {
  /** Total accumulated experience points */
  totalExp: number;

  /** Current level (derived from totalExp via the EXP table) */
  level: number;

  /** EXP earned within the current level (for progress bar display) */
  currentLevelExp: number;

  /** EXP required to reach the next level */
  nextLevelExp: number;

  /** Current unlocked tier — gates which skill tree nodes are accessible */
  currentTier: Tier;

  /** Timestamp of the last tier promotion (ISO string) */
  lastTierPromotionDate: string | null;
}

// ---------------------------------------------------------------------------
// Activity & Engagement
// ---------------------------------------------------------------------------

/** Tracks daily engagement streaks and activity stats. */
export interface UserActivity {
  /** Current consecutive day streak of completing at least one quest */
  currentStreak: number;

  /** All-time longest streak */
  longestStreak: number;

  /** ISO date of last completed activity */
  lastActiveDate: string | null;

  /** Total number of workouts logged across all time */
  totalWorkoutsLogged: number;

  /** Total number of micro-workouts (Grease the Groove) completed */
  totalMicroWorkouts: number;

  /** Total number of boss fights attempted */
  bossFightsAttempted: number;

  /** Total number of boss fights passed */
  bossFightsPassed: number;
}

// ---------------------------------------------------------------------------
// User Profile (Root)
// ---------------------------------------------------------------------------

/** Gender options — used for calorie/BMI calculations, not gatekeeping content. */
export type Gender = 'male' | 'female' | 'other';

/** Activity level multipliers for TDEE calculation. */
export type ActivityLevel =
  | 'sedentary'       // Little to no exercise
  | 'light'           // 1-3 days/week
  | 'moderate'        // 3-5 days/week
  | 'active'          // 6-7 days/week
  | 'very_active';    // Athlete / physical job + training

/**
 * The root user profile model.
 * Single source of truth for everything about the player.
 */
export interface UserProfile {
  /** Unique user ID (UUID v4) */
  id: string;

  /** Display name — shown on dashboard and leaderboards */
  displayName: string;

  /** Account creation timestamp (ISO string) */
  createdAt: string;

  /** Gender — used for calorie formula selection */
  gender: Gender;

  /** Date of birth (ISO date string) — used for age in BMR calculation */
  dateOfBirth: string;

  /** Self-reported activity level — affects TDEE multiplier */
  activityLevel: ActivityLevel;

  /** Whether the user has completed the initial baseline calibration */
  isCalibrated: boolean;

  /** Physical body measurements and history */
  bodyMetrics: BodyMetrics;

  /** RPG progression (EXP, level, tier) */
  progression: UserProgression;

  /** Activity streaks and lifetime stats */
  activity: UserActivity;
}

// ---------------------------------------------------------------------------
// Factory / Defaults
// ---------------------------------------------------------------------------

/** Creates a new uncalibrated user profile with sensible defaults. */
export function createDefaultUserProfile(id: string, displayName: string): UserProfile {
  return {
    id,
    displayName,
    createdAt: new Date().toISOString(),
    gender: 'male',
    dateOfBirth: '2000-01-01',
    activityLevel: 'sedentary',
    isCalibrated: false,
    bodyMetrics: {
      baseHeightCm: 0,
      currentWeightKg: 0,
      currentApparentHeightCm: 0,
      idealTargetWeightKg: 0,
      dailyMaintenanceCalories: 0,
      bmi: 0,
      history: [],
    },
    progression: {
      totalExp: 0,
      level: 1,
      currentLevelExp: 0,
      nextLevelExp: 100,
      currentTier: 0,
      lastTierPromotionDate: null,
    },
    activity: {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      totalWorkoutsLogged: 0,
      totalMicroWorkouts: 0,
      bossFightsAttempted: 0,
      bossFightsPassed: 0,
    },
  };
}

// ============================================================================
// EXP Table — Soft Exponential Leveling Curve
// ============================================================================
// Level progression uses a soft exponential curve:
//   EXP_required(level) = base × level^exponent
//
// "Soft exponential" means:
//   - Early levels (1-10): Fast, rewarding, keeps you hooked
//   - Mid levels (10-30): Steady grind, feels earned
//   - Late levels (30-50+): Serious dedication required, but not impossible
//
// The curve is calibrated so that:
//   - Level 5 (~Tier 1 eligible): ~1-2 weeks of daily activity
//   - Level 15 (~Tier 2 eligible): ~1-2 months
//   - Level 30 (~Tier 3 eligible): ~4-6 months
//   - Level 50 (~Tier 4 eligible): ~12-18 months
//
// This rewards consistency over intensity, matching the Sleeper Build philosophy.
// ============================================================================

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Base EXP for level 2 (level 1 → 2 requires this much) */
const BASE_EXP = 100;

/** Exponent for the curve. 1.0 = linear, 2.0 = quadratic, 1.5 = soft exponential */
const EXPONENT = 1.5;

/** Maximum level — soft cap, not hard cap. Progression slows but never stops. */
export const MAX_LEVEL = 99;

// ---------------------------------------------------------------------------
// EXP Table Generation
// ---------------------------------------------------------------------------

/**
 * EXP required to go from (level - 1) to (level).
 * Uses: base × level^exponent
 *
 * Examples at default values (base=100, exp=1.5):
 *   Level 2:  100 × 2^1.5  =   283 EXP
 *   Level 5:  100 × 5^1.5  =  1,118 EXP
 *   Level 10: 100 × 10^1.5 =  3,162 EXP
 *   Level 20: 100 × 20^1.5 =  8,944 EXP
 *   Level 30: 100 × 30^1.5 = 16,432 EXP
 *   Level 50: 100 × 50^1.5 = 35,355 EXP
 */
export function expRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(BASE_EXP * Math.pow(level, EXPONENT));
}

/**
 * Total cumulative EXP required to reach a given level from level 1.
 * This is the sum of expRequiredForLevel(2) + ... + expRequiredForLevel(level).
 */
export function totalExpForLevel(level: number): number {
  let total = 0;
  for (let l = 2; l <= level; l++) {
    total += expRequiredForLevel(l);
  }
  return total;
}

/**
 * Pre-computed EXP table for quick lookups.
 * Index = level, value = cumulative EXP required to reach that level.
 *
 * EXP_TABLE[0] = 0 (unused)
 * EXP_TABLE[1] = 0 (starting level)
 * EXP_TABLE[2] = 283 (EXP needed to reach level 2)
 * EXP_TABLE[n] = total EXP needed to reach level n
 */
export const EXP_TABLE: number[] = Array.from(
  { length: MAX_LEVEL + 1 },
  (_, level) => totalExpForLevel(level)
);

// ---------------------------------------------------------------------------
// Level Calculation
// ---------------------------------------------------------------------------

/**
 * Given a total EXP value, returns the current level.
 * Binary search through the EXP table for O(log n) performance.
 */
export function getLevelFromExp(totalExp: number): number {
  if (totalExp <= 0) return 1;

  let low = 1;
  let high = MAX_LEVEL;

  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2);
    if (EXP_TABLE[mid] <= totalExp) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  return low;
}

/**
 * Returns the EXP progress within the current level.
 * Useful for rendering the EXP progress bar.
 *
 * Returns { currentLevelExp, nextLevelExp, progressPercent }
 */
export function getLevelProgress(totalExp: number): {
  level: number;
  currentLevelExp: number;
  nextLevelExp: number;
  progressPercent: number;
} {
  const level = getLevelFromExp(totalExp);

  if (level >= MAX_LEVEL) {
    return {
      level: MAX_LEVEL,
      currentLevelExp: 0,
      nextLevelExp: 0,
      progressPercent: 100,
    };
  }

  const expAtCurrentLevel = EXP_TABLE[level];
  const expAtNextLevel = EXP_TABLE[level + 1];

  const currentLevelExp = totalExp - expAtCurrentLevel;
  const nextLevelExp = expAtNextLevel - expAtCurrentLevel;
  const progressPercent =
    nextLevelExp > 0
      ? Math.min(100, Math.floor((currentLevelExp / nextLevelExp) * 100))
      : 100;

  return {
    level,
    currentLevelExp,
    nextLevelExp,
    progressPercent,
  };
}

// ---------------------------------------------------------------------------
// EXP Reward Constants
// ---------------------------------------------------------------------------

/** EXP rewards for common actions. Centralized for easy balancing. */
export const EXP_REWARDS = {
  /** Per-set EXP for standard skill training (base, modified by difficulty) */
  SKILL_SET_BASE: 15,

  /** Bonus EXP when a skill node reaches MASTERED status */
  SKILL_MASTERY_BONUS: 200,

  /** EXP for completing a micro-workout (Grease the Groove) */
  MICRO_WORKOUT: 10,

  /** EXP for completing a daily posture/decompression task */
  POSTURE_TASK: 20,

  /** Bonus EXP for maintaining a daily streak (per consecutive day) */
  STREAK_DAILY_BONUS: 5,

  /** Milestone streak bonuses */
  STREAK_7_DAY: 100,
  STREAK_30_DAY: 500,
  STREAK_100_DAY: 2000,

  /** EXP for logging a body metric update */
  BODY_METRIC_LOG: 10,

  /** First workout of the day bonus */
  FIRST_WORKOUT_BONUS: 25,
} as const;

// ---------------------------------------------------------------------------
// Difficulty Multipliers
// ---------------------------------------------------------------------------

/** EXP multiplier based on quest/exercise difficulty. */
export const DIFFICULTY_MULTIPLIERS = {
  easy: 0.75,
  medium: 1.0,
  hard: 1.5,
  boss: 3.0,
} as const;

// ============================================================================
// Relative Strength Score
// ============================================================================
// The "Sleeper Build" metric: strength relative to bodyweight.
//
// Philosophy: A 60kg person doing 15 pull-ups is STRONGER (relatively) than
// a 100kg person doing 8. We reward efficiency, not mass.
//
// The score is calculated per category and rolled up into a composite.
// Each category score is 0-100, where 100 = elite bodyweight mastery.
// ============================================================================

// ---------------------------------------------------------------------------
// Score Breakdown
// ---------------------------------------------------------------------------

/** Per-category strength scores (0-100 each). */
export interface StrengthBreakdown {
  push: number;
  pull: number;
  legs: number;
  core: number;
  flexibility: number;
}

/** Trend direction for the overall score. */
export type StrengthTrend = 'rising' | 'stable' | 'declining';

// ---------------------------------------------------------------------------
// Relative Strength Score (Root)
// ---------------------------------------------------------------------------

/**
 * The user's Relative Strength Score — a composite metric
 * that rewards bodyweight mastery over raw strength.
 */
export interface RelativeStrengthScore {
  /** Composite score (0-100) — weighted average of all categories */
  overall: number;

  /** Individual scores per movement category */
  breakdown: StrengthBreakdown;

  /**
   * Bodyweight performance ratio.
   * Calculated as: (sum of best performance metrics) / bodyweightKg
   *
   * Example: If you can do 20 pull-ups, 50 push-ups, 30 dips at 70kg:
   * ratio = (20 + 50 + 30) / 70 = 1.43
   *
   * Higher = more efficient strength-to-weight ratio.
   */
  bodyweightRatio: number;

  /** 7-day moving average trend direction */
  trend: StrengthTrend;

  /** ISO timestamp of the last recalculation */
  lastCalculated: string;

  /** History of composite scores over time (for chart display) */
  history: StrengthScoreEntry[];
}

/** A single point in the strength score history. */
export interface StrengthScoreEntry {
  /** ISO date string */
  date: string;

  /** Composite overall score at this point */
  overall: number;

  /** Bodyweight at time of recording (kg) */
  weightKg: number;

  /** Ratio at time of recording */
  bodyweightRatio: number;
}

// ---------------------------------------------------------------------------
// Category Weight Configuration
// ---------------------------------------------------------------------------

/**
 * Weights for calculating the composite score from category scores.
 * Pull and push are weighted higher — they're the most indicative
 * of real-world "sleeper" strength.
 */
export const CATEGORY_WEIGHTS: Record<keyof StrengthBreakdown, number> = {
  push: 0.25,
  pull: 0.25,
  legs: 0.20,
  core: 0.20,
  flexibility: 0.10,
} as const;

// ---------------------------------------------------------------------------
// Scoring Benchmarks
// ---------------------------------------------------------------------------

/**
 * Benchmark definitions for mapping raw performance to 0-100 scores.
 * Each benchmark represents the number of reps (or seconds for holds)
 * that earns a 100-point score for that category at a given bodyweight.
 *
 * These are adjusted by the user's bodyweight — heavier users need
 * fewer reps to achieve the same relative score.
 */
export interface CategoryBenchmark {
  /** The reference exercise used to score this category */
  exerciseId: string;

  /** Exercise name for display */
  exerciseName: string;

  /** Reps (or seconds) that equals a score of 100 at 70kg bodyweight */
  eliteThreshold: number;

  /** Reps (or seconds) that equals a score of 50 at 70kg bodyweight */
  intermediateThreshold: number;

  /**
   * Bodyweight adjustment factor.
   * For each kg above 70kg, the threshold is reduced by this percentage.
   * For each kg below 70kg, the threshold is increased.
   *
   * Example: factor 0.5 means at 80kg, elite threshold = eliteThreshold × (1 - 10×0.005) = 95%
   */
  bodyweightAdjustmentPercent: number;
}

/** Default benchmarks per category — calibrated for the Sleeper Build philosophy. */
export const DEFAULT_BENCHMARKS: Record<keyof StrengthBreakdown, CategoryBenchmark> = {
  push: {
    exerciseId: 'push_standard',
    exerciseName: 'Standard Push-up',
    eliteThreshold: 60,          // 60 consecutive push-ups at 70kg = score 100
    intermediateThreshold: 25,   // 25 = score 50
    bodyweightAdjustmentPercent: 0.5,
  },
  pull: {
    exerciseId: 'pull_pullup',
    exerciseName: 'Pull-up',
    eliteThreshold: 25,          // 25 consecutive pull-ups at 70kg = score 100
    intermediateThreshold: 8,    // 8 = score 50
    bodyweightAdjustmentPercent: 0.8,  // Pull-ups are MORE affected by bodyweight
  },
  legs: {
    exerciseId: 'legs_pistol',
    exerciseName: 'Pistol Squat',
    eliteThreshold: 20,          // 20 per leg at 70kg = score 100
    intermediateThreshold: 5,
    bodyweightAdjustmentPercent: 0.3,  // Legs are less affected by bodyweight
  },
  core: {
    exerciseId: 'core_lsit',
    exerciseName: 'L-Sit Hold',
    eliteThreshold: 60,          // 60 second hold at 70kg = score 100
    intermediateThreshold: 15,
    bodyweightAdjustmentPercent: 0.4,
  },
  flexibility: {
    exerciseId: 'flex_pike',
    exerciseName: 'Pike Stretch (Palms to Floor)',
    eliteThreshold: 60,          // 60 second palms-flat hold = score 100
    intermediateThreshold: 20,
    bodyweightAdjustmentPercent: 0.1,  // Flexibility barely affected by weight
  },
} as const;

// ---------------------------------------------------------------------------
// Score Calculation Helpers
// ---------------------------------------------------------------------------

/**
 * Calculates a 0-100 score for a category given raw performance and bodyweight.
 * Uses a logarithmic curve so early gains feel impactful and elite scores require dedication.
 */
export function calculateCategoryScore(
  rawPerformance: number,
  benchmark: CategoryBenchmark,
  bodyweightKg: number
): number {
  const referenceWeight = 70; // kg
  const weightDelta = bodyweightKg - referenceWeight;
  const adjustmentMultiplier =
    1 - (weightDelta * benchmark.bodyweightAdjustmentPercent) / 100;

  // Adjust the elite threshold based on bodyweight
  const adjustedElite = benchmark.eliteThreshold * adjustmentMultiplier;

  if (adjustedElite <= 0) return 100; // Edge case: very heavy user, any performance = elite

  // Logarithmic scoring: score = 100 × ln(1 + performance) / ln(1 + adjustedElite)
  const score =
    100 * (Math.log(1 + rawPerformance) / Math.log(1 + adjustedElite));

  return Math.min(100, Math.max(0, Math.round(score * 10) / 10));
}

/**
 * Calculates the composite overall score from individual category scores.
 */
export function calculateOverallScore(breakdown: StrengthBreakdown): number {
  const weighted =
    breakdown.push * CATEGORY_WEIGHTS.push +
    breakdown.pull * CATEGORY_WEIGHTS.pull +
    breakdown.legs * CATEGORY_WEIGHTS.legs +
    breakdown.core * CATEGORY_WEIGHTS.core +
    breakdown.flexibility * CATEGORY_WEIGHTS.flexibility;

  return Math.round(weighted * 10) / 10;
}

/**
 * Determines the trend direction based on recent score history.
 * Compares the average of the last 3 entries against the average of the 3 before that.
 */
export function calculateTrend(history: StrengthScoreEntry[]): StrengthTrend {
  if (history.length < 6) return 'stable';

  const recent = history.slice(-3);
  const prior = history.slice(-6, -3);

  const recentAvg = recent.reduce((sum, e) => sum + e.overall, 0) / 3;
  const priorAvg = prior.reduce((sum, e) => sum + e.overall, 0) / 3;

  const delta = recentAvg - priorAvg;

  if (delta > 2) return 'rising';
  if (delta < -2) return 'declining';
  return 'stable';
}

/** Creates a default (empty) RelativeStrengthScore. */
export function createDefaultStrengthScore(): RelativeStrengthScore {
  return {
    overall: 0,
    breakdown: { push: 0, pull: 0, legs: 0, core: 0, flexibility: 0 },
    bodyweightRatio: 0,
    trend: 'stable',
    lastCalculated: new Date().toISOString(),
    history: [],
  };
}

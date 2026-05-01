// ============================================================================
// Boss Fight — Monthly Tier Evaluation
// ============================================================================
// Every month (or when the user triggers it), a Boss Fight evaluates
// whether they've earned a promotion to the next tier.
//
// The boss fight is a PHYSICAL TEST — a set of exercises that must be
// completed within a time window, meeting strict form and rep standards.
//
// Failing is expected and encouraged. You train harder, try again next month.
// No participation trophies. Earn it.
//
// Tier Progression:
//   Tier 0: Civilian     — Uncalibrated, onboarding
//   Tier 1: Initiate     — Basic movement patterns locked in
//   Tier 2: Adept        — Intermediate calisthenics
//   Tier 3: Operator     — Advanced bodyweight skills
//   Tier 4: Sleeper      — Elite mastery (planche, muscle-up, front lever)
// ============================================================================

// ---------------------------------------------------------------------------
// Tiers
// ---------------------------------------------------------------------------

/**
 * Tier levels (0-4).
 * Used as a numeric type for comparison operators (tier >= 2, etc.)
 */
export type Tier = 0 | 1 | 2 | 3 | 4;

/** Human-readable tier info. */
export interface TierDefinition {
  /** Numeric tier value */
  tier: Tier;

  /** Codename (e.g., "Sleeper") */
  name: string;

  /** Full title (e.g., "Tier 4 — Sleeper") */
  title: string;

  /** Description of what this tier represents */
  description: string;

  /** Minimum level required to ATTEMPT the boss fight for this tier */
  minimumLevel: number;

  /** The boss fight challenge to pass for promotion INTO this tier */
  bossChallenge: BossChallenge | null; // Tier 0 has no challenge (it's the starting tier)

  /**
   * Hex color associated with this tier (for UI theming).
   * Tier 0: grey, Tier 1: green, Tier 2: blue, Tier 3: purple, Tier 4: gold
   */
  color: string;
}

// ---------------------------------------------------------------------------
// Boss Challenge (The Test)
// ---------------------------------------------------------------------------

/** A single exercise requirement within a boss fight. */
export interface BossChallengeExercise {
  /** Reference to the skill node being tested */
  skillNodeId: string;

  /** Exercise name (for display) */
  exerciseName: string;

  /** Required reps to pass (for rep-based exercises) */
  requiredReps?: number;

  /** Required hold time in seconds (for hold-based exercises) */
  requiredHoldSeconds?: number;

  /** Required sets */
  requiredSets: number;

  /**
   * Maximum rest time between sets (seconds).
   * Part of the challenge — you can't rest 10 minutes between sets.
   */
  maxRestBetweenSets: number;

  /** Whether this exercise is REQUIRED or OPTIONAL (bonus) */
  isRequired: boolean;
}

/**
 * The complete boss fight challenge for a tier promotion.
 * ALL required exercises must be passed. Optional ones give bonus EXP.
 */
export interface BossChallenge {
  /** Unique challenge ID */
  id: string;

  /** Which tier this challenge promotes you TO */
  targetTier: Tier;

  /** Boss name (for flavor — e.g., "The Gatekeeper", "The Shadow") */
  bossName: string;

  /** Narrative description (RPG flavor text) */
  flavorText: string;

  /** All exercises in this boss fight */
  exercises: BossChallengeExercise[];

  /**
   * Total time limit for the entire boss fight (seconds).
   * All exercises must be completed within this window.
   * Example: 20 minutes = 1200 seconds
   */
  timeLimitSeconds: number;

  /** EXP awarded for passing the entire boss fight */
  passExp: number;

  /** EXP awarded per completed optional exercise */
  bonusExerciseExp: number;

  /**
   * Cooldown in days before the boss fight can be re-attempted after a failure.
   * Encourages training between attempts rather than brute-force retrying.
   */
  cooldownDays: number;
}

// ---------------------------------------------------------------------------
// Evaluation Result
// ---------------------------------------------------------------------------

/** Result of a single exercise within a boss fight attempt. */
export interface ExerciseResult {
  /** Reference to the boss exercise */
  skillNodeId: string;

  /** What was achieved */
  achievedReps: number;
  achievedHoldSeconds: number;
  achievedSets: number;

  /** Whether this specific exercise was passed */
  passed: boolean;
}

/**
 * The complete result of a boss fight attempt.
 * Stored in history for tracking improvement over time.
 */
export interface BossFightResult {
  /** Unique result ID */
  id: string;

  /** ID of the boss challenge attempted */
  challengeId: string;

  /** Which tier was being attempted */
  targetTier: Tier;

  /** ISO timestamp of the attempt */
  attemptDate: string;

  /** Total time taken (seconds) */
  totalTimeSeconds: number;

  /** Results for each exercise */
  exerciseResults: ExerciseResult[];

  /** Whether the overall boss fight was PASSED */
  passed: boolean;

  /** EXP earned from this attempt (partial EXP even on failure) */
  expEarned: number;

  /**
   * Personal notes — user can reflect on what went wrong/right.
   * Encouraged as part of the "deliberate practice" mindset.
   */
  notes: string;
}

// ---------------------------------------------------------------------------
// Boss Fight State
// ---------------------------------------------------------------------------

/**
 * Tracks the user's boss fight eligibility and history.
 */
export interface BossFightState {
  /** Whether the user is currently eligible to attempt a boss fight */
  isEligible: boolean;

  /** Reason why ineligible (null if eligible) */
  ineligibleReason: string | null;

  /** ISO date of the next available attempt (after cooldown) */
  nextAvailableDate: string | null;

  /** The challenge for the user's next tier promotion */
  nextChallenge: BossChallenge | null;

  /** Full history of all boss fight attempts, newest first */
  history: BossFightResult[];
}

// ---------------------------------------------------------------------------
// Factory Helpers
// ---------------------------------------------------------------------------

/** Creates a default boss fight state for a new user. */
export function createDefaultBossFightState(): BossFightState {
  return {
    isEligible: false,
    ineligibleReason: 'Complete baseline calibration first',
    nextAvailableDate: null,
    nextChallenge: null,
    history: [],
  };
}

/**
 * Evaluates whether a boss fight attempt was successful.
 * ALL required exercises must be passed AND total time must be within the limit.
 */
export function evaluateBossFight(
  challenge: BossChallenge,
  exerciseResults: ExerciseResult[],
  totalTimeSeconds: number
): { passed: boolean; expEarned: number } {
  // Check time limit
  if (totalTimeSeconds > challenge.timeLimitSeconds) {
    // Still award partial EXP for effort
    const partialExp = Math.floor(challenge.passExp * 0.1);
    return { passed: false, expEarned: partialExp };
  }

  // Check all required exercises
  const requiredExercises = challenge.exercises.filter((e) => e.isRequired);
  const allRequiredPassed = requiredExercises.every((required) => {
    const result = exerciseResults.find(
      (r) => r.skillNodeId === required.skillNodeId
    );
    return result?.passed ?? false;
  });

  if (!allRequiredPassed) {
    // Partial EXP: 25% of pass reward + bonus for each passed exercise
    const passedCount = exerciseResults.filter((r) => r.passed).length;
    const partialExp =
      Math.floor(challenge.passExp * 0.25) +
      passedCount * Math.floor(challenge.bonusExerciseExp * 0.5);
    return { passed: false, expEarned: partialExp };
  }

  // PASSED — full EXP + bonus for optional exercises
  const optionalPassed = challenge.exercises
    .filter((e) => !e.isRequired)
    .filter((optional) => {
      const result = exerciseResults.find(
        (r) => r.skillNodeId === optional.skillNodeId
      );
      return result?.passed ?? false;
    }).length;

  const totalExp =
    challenge.passExp + optionalPassed * challenge.bonusExerciseExp;

  return { passed: true, expEarned: totalExp };
}

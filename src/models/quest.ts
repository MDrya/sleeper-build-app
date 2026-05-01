// ============================================================================
// Quests & Micro-Workouts (Grease the Groove)
// ============================================================================
// Quests are the daily driver of engagement. Two types:
//
// 1. STRUCTURED QUESTS — Appear on the "Today's Quests" board.
//    Tied to skill tree progress. Completing them advances mastery.
//
// 2. MICRO-WORKOUTS (Grease the Groove) — Random pop-up notifications
//    throughout the day. Low intensity, high frequency.
//    "Do 10 deep squats." "Hold a wall sit for 30s." "5 slow push-ups."
//    Small EXP rewards that compound over time.
//
// Philosophy: Train movement patterns throughout the day, not just in
// a single "workout window." This is how you build real CNS adaptation.
// ============================================================================

// ---------------------------------------------------------------------------
// Quest Types
// ---------------------------------------------------------------------------

/** The type of quest determines its source and reward structure. */
export type QuestType =
  | 'skill_training'     // Progress toward mastering a skill node
  | 'micro_workout'      // Grease the Groove random prompt
  | 'posture'            // Posture & decompression daily task
  | 'boss_prep'          // Preparation for upcoming boss fight
  | 'daily_challenge';   // Special daily challenge (bonus EXP)

/** Quest difficulty — affects EXP multiplier. */
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'boss';

/** Current completion state of a quest. */
export type QuestStatus =
  | 'available'    // Can be started
  | 'in_progress'  // Started but not finished
  | 'completed'    // Successfully done
  | 'expired'      // Time window passed without completion
  | 'skipped';     // User manually skipped

// ---------------------------------------------------------------------------
// Quest Model
// ---------------------------------------------------------------------------

/**
 * A quest — any discrete task the user can complete for EXP.
 */
export interface Quest {
  /** Unique quest instance ID */
  id: string;

  /** Quest type (determines UI treatment and reward logic) */
  type: QuestType;

  /** Short title (e.g., "Push Training", "Stretch Break") */
  title: string;

  /** Longer description with specific instructions */
  description: string;

  /** Difficulty tier */
  difficulty: QuestDifficulty;

  /** Current status */
  status: QuestStatus;

  /** ID of the related skill node (null for non-skill quests) */
  skillNodeId: string | null;

  // --- Requirements ---

  /** Number of sets to complete */
  targetSets: number;

  /** Number of reps per set (for rep-based exercises) */
  targetReps?: number;

  /** Hold time in seconds per set (for hold-based exercises) */
  targetHoldSeconds?: number;

  // --- Rewards ---

  /** Base EXP reward for completing this quest */
  expReward: number;

  /** Bonus EXP for completing within the time window */
  bonusExp: number;

  // --- Timing ---

  /** ISO timestamp when the quest becomes available */
  availableAt: string;

  /** ISO timestamp when the quest expires (null = no expiry) */
  expiresAt: string | null;

  /** ISO timestamp when the quest was completed (null = not yet) */
  completedAt: string | null;
}

// ---------------------------------------------------------------------------
// Micro-Workout (Grease the Groove)
// ---------------------------------------------------------------------------

/**
 * A micro-workout prompt template.
 * These are pooled and randomly selected throughout the day.
 * The actual Quest instance is generated from this template.
 */
export interface MicroWorkoutTemplate {
  /** Unique template ID */
  id: string;

  /** The notification message (e.g., "Do 10 deep squats now") */
  prompt: string;

  /** Which skill category this targets */
  category: string;

  /** The exercise to perform */
  exerciseName: string;

  /** Related skill node ID (for EXP routing) */
  skillNodeId: string | null;

  /** Number of reps (or seconds for holds) */
  amount: number;

  /** Whether the amount is reps or seconds */
  unit: 'reps' | 'seconds';

  /** EXP reward for completing this micro-workout */
  expReward: number;

  /**
   * Minimum tier required to receive this prompt.
   * Tier 0 users only get the most basic movements.
   */
  minimumTier: number;

  /** Equipment needed (same constraint: free/public) */
  equipment: string[];
}

// ---------------------------------------------------------------------------
// Posture & Decompression Task
// ---------------------------------------------------------------------------

/**
 * A daily posture/decompression task.
 * These form their own streak tracker separate from workout streaks.
 */
export interface PostureTask {
  /** Unique task ID */
  id: string;

  /** Task name (e.g., "Dead Hang", "Cat-Cow Stretch", "Wall Angel") */
  name: string;

  /** Instructions for proper form */
  instructions: string;

  /** Target hold time in seconds (e.g., 60s dead hang) */
  targetSeconds: number;

  /** Number of sets (e.g., 3 sets of 30s hang) */
  targetSets: number;

  /** EXP reward */
  expReward: number;

  /** Equipment needed */
  equipment: string[];

  /**
   * Which body area this targets.
   * Used for ensuring daily variety.
   */
  targetArea: 'spine' | 'shoulders' | 'hips' | 'thoracic' | 'neck' | 'full_body';
}

/** Tracks completion of posture tasks for a single day. */
export interface PostureDayLog {
  /** ISO date string (YYYY-MM-DD) */
  date: string;

  /** IDs of completed posture tasks */
  completedTaskIds: string[];

  /** Total seconds held across all tasks */
  totalSecondsHeld: number;

  /** Whether this day counts toward the posture streak */
  countsForStreak: boolean;
}

// ---------------------------------------------------------------------------
// Daily Quest Board
// ---------------------------------------------------------------------------

/**
 * The complete set of quests available for today.
 * Generated fresh each day based on the user's current tier, unlocked nodes, and streaks.
 */
export interface DailyQuestBoard {
  /** ISO date string for this board (YYYY-MM-DD) */
  date: string;

  /** Structured skill training quests (2-4 per day) */
  skillQuests: Quest[];

  /** Posture/decompression tasks for today (2-3 per day) */
  postureTasks: PostureTask[];

  /** Number of micro-workouts triggered so far today */
  microWorkoutsTriggered: number;

  /** Number of micro-workouts completed today */
  microWorkoutsCompleted: number;

  /** Whether all required quests are completed */
  isComplete: boolean;

  /** Total EXP earned today */
  expEarnedToday: number;
}

// ---------------------------------------------------------------------------
// Factory Helpers
// ---------------------------------------------------------------------------

/** Creates an empty daily quest board for a given date. */
export function createEmptyQuestBoard(date: string): DailyQuestBoard {
  return {
    date,
    skillQuests: [],
    postureTasks: [],
    microWorkoutsTriggered: 0,
    microWorkoutsCompleted: 0,
    isComplete: false,
    expEarnedToday: 0,
  };
}

// ============================================================================
// Skill Tree — Progressive Bodyweight Mastery
// ============================================================================
// The skill tree is modeled as a Directed Acyclic Graph (DAG).
// Each node is an exercise. Nodes are LOCKED until all prerequisites are MASTERED.
//
// Example chain:
//   Wall Push-up (3×50) → Incline Push-up (3×30) → Knee Push-up (3×25)
//   → Standard Push-up (3×20) → Diamond Push-up (3×15) → Archer Push-up (3×10)
//   → One-Arm Push-up (3×5)
//
// Equipment philosophy: ZERO budget. Bodyweight + any public structure
// (park bars, playground, walls, stairs, floor).
// ============================================================================

import type { Tier } from './boss-fight';

// ---------------------------------------------------------------------------
// Enums & Categories
// ---------------------------------------------------------------------------

/** The five pillars of bodyweight mastery. */
export type SkillCategory = 'push' | 'pull' | 'legs' | 'core' | 'flexibility';

/** How the exercise is performed — determines which fields are tracked. */
export type ExerciseType =
  | 'reps'         // Count-based (push-ups, squats, pull-ups)
  | 'hold'         // Time-based static holds (planks, hangs, L-sits)
  | 'flow'         // Mobility flows — measured by duration + consistency
  | 'stretch';     // Stretches — measured by hold time per side

/** Current status of a skill node for the user. */
export type SkillNodeStatus =
  | 'locked'       // Prerequisites not met
  | 'unlocked'     // Available to train but not mastered
  | 'in_progress'  // User has started working toward mastery
  | 'mastered';    // Mastery threshold fully met — node complete

// ---------------------------------------------------------------------------
// Mastery & Progress
// ---------------------------------------------------------------------------

/**
 * The threshold that defines "mastery" of an exercise.
 * Once all conditions are met, the node is marked as mastered
 * and its dependents become unlockable.
 */
export interface MasteryThreshold {
  /** Number of sets required per session (e.g., 3) */
  sets: number;

  /** Number of reps per set (e.g., 50 for wall push-ups) */
  reps?: number;

  /** Hold duration in seconds per set (e.g., 60s dead hang) */
  holdSeconds?: number;

  /** Flow/stretch duration in seconds per session */
  durationSeconds?: number;

  /**
   * Number of consecutive days the threshold must be hit.
   * Prevents "one good day" mastery — consistency is king.
   * Default: 3 (must hit the threshold 3 separate days)
   */
  consecutiveDays: number;
}

/**
 * Tracks the user's current progress toward mastering a skill node.
 */
export interface ExerciseProgress {
  /** Best sets × reps achieved in a single session */
  bestSets: number;
  bestReps: number;

  /** Best hold time achieved in a single set (seconds) */
  bestHoldSeconds: number;

  /**
   * Rolling count of consecutive days where the mastery threshold was fully met.
   * Resets to 0 if a day is missed.
   */
  consecutiveDaysMet: number;

  /** ISO date of the last logged session */
  lastSessionDate: string | null;

  /** Total number of sessions ever logged for this exercise */
  totalSessions: number;

  /** Total reps ever performed (lifetime counter — satisfying to see grow) */
  totalRepsLifetime: number;
}

// ---------------------------------------------------------------------------
// Prerequisite Rules
// ---------------------------------------------------------------------------

/**
 * A single prerequisite condition for unlocking a skill node.
 * ALL prerequisites in a node's list must be satisfied (AND logic).
 */
export interface PrerequisiteRule {
  /** The ID of the required skill node */
  nodeId: string;

  /**
   * If true, the prerequisite node must be fully MASTERED.
   * If false, it only needs to be UNLOCKED (started).
   * Almost always true — we enforce progressive mastery.
   */
  requireMastery: boolean;
}

// ---------------------------------------------------------------------------
// Skill Node (Core Unit)
// ---------------------------------------------------------------------------

/**
 * A single node in the skill tree — represents one exercise.
 * This is the atomic unit of the progression system.
 */
export interface SkillNode {
  /** Unique identifier (e.g., 'push_wall', 'pull_dead_hang') */
  id: string;

  /** Human-readable name (e.g., "Wall Push-up") */
  name: string;

  /** Markdown-friendly description with form cues */
  description: string;

  /** Which movement pattern this belongs to */
  category: SkillCategory;

  /** How the exercise is performed */
  exerciseType: ExerciseType;

  /** Minimum tier required to even SEE this node */
  minimumTier: Tier;

  /**
   * Equipment needed.
   * Design constraint: must be FREE or near-free.
   * Examples: 'none', 'floor', 'wall', 'bar', 'elevated_surface', 'stairs'
   */
  equipment: string[];

  /** Form cue keywords for safety reminders during logging */
  formCues: string[];

  // --- Progression ---

  /** What must be mastered before this node unlocks. Empty = root node (always available). */
  prerequisites: PrerequisiteRule[];

  /** The threshold that defines mastery of this exercise */
  masteryThreshold: MasteryThreshold;

  /** EXP awarded per completed set during a session */
  expPerSet: number;

  /** Bonus EXP awarded once when the node reaches MASTERED status */
  masteryBonusExp: number;

  // --- User State (mutable, stored per-user) ---

  /** Current unlock/mastery status */
  status: SkillNodeStatus;

  /** User's current progress toward mastery */
  progress: ExerciseProgress;
}

// ---------------------------------------------------------------------------
// Skill Tree (Category-level Grouping)
// ---------------------------------------------------------------------------

/**
 * A complete skill tree for one movement category.
 * Contains all nodes in that category, forming a DAG.
 */
export interface SkillTree {
  /** Category this tree covers (e.g., 'push') */
  category: SkillCategory;

  /** Display name for the tree (e.g., "Push Mastery") */
  displayName: string;

  /** Description of the movement pattern */
  description: string;

  /** All nodes in this tree, keyed by node ID for O(1) lookup */
  nodes: Record<string, SkillNode>;

  /**
   * Ordered list of node IDs representing the "main path" (linear progression).
   * Side branches exist but this is the recommended route for beginners.
   */
  mainPath: string[];
}

// ---------------------------------------------------------------------------
// Factory Helpers
// ---------------------------------------------------------------------------

/** Creates default (empty) exercise progress. */
export function createDefaultProgress(): ExerciseProgress {
  return {
    bestSets: 0,
    bestReps: 0,
    bestHoldSeconds: 0,
    consecutiveDaysMet: 0,
    lastSessionDate: null,
    totalSessions: 0,
    totalRepsLifetime: 0,
  };
}

/**
 * Checks if a skill node's mastery threshold has been met for a single session.
 * Does NOT check consecutive days — that's handled by the streak tracker.
 */
export function isSessionThresholdMet(
  node: SkillNode,
  loggedSets: number,
  loggedReps: number,
  loggedHoldSeconds: number
): boolean {
  const t = node.masteryThreshold;

  if (loggedSets < t.sets) return false;

  if (node.exerciseType === 'reps' && t.reps !== undefined) {
    return loggedReps >= t.reps;
  }

  if (
    (node.exerciseType === 'hold' || node.exerciseType === 'stretch') &&
    t.holdSeconds !== undefined
  ) {
    return loggedHoldSeconds >= t.holdSeconds;
  }

  if (node.exerciseType === 'flow' && t.durationSeconds !== undefined) {
    return loggedHoldSeconds >= t.durationSeconds;
  }

  return true;
}

/**
 * Determines if all prerequisites for a node are satisfied.
 * Used to transition a node from 'locked' to 'unlocked'.
 */
export function arePrerequisitesMet(
  node: SkillNode,
  allNodes: Record<string, SkillNode>
): boolean {
  if (node.prerequisites.length === 0) return true;

  return node.prerequisites.every((prereq) => {
    const requiredNode = allNodes[prereq.nodeId];
    if (!requiredNode) return false;

    if (prereq.requireMastery) {
      return requiredNode.status === 'mastered';
    }

    return (
      requiredNode.status === 'unlocked' ||
      requiredNode.status === 'in_progress' ||
      requiredNode.status === 'mastered'
    );
  });
}

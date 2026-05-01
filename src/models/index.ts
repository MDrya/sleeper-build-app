// ============================================================================
// Barrel Export — All Models
// ============================================================================
// Single import point for all data models.
// Usage: import { UserProfile, SkillNode, Quest, ... } from '@/models';
// ============================================================================

// --- User Profile ---
export type {
  UserProfile,
  BodyMetrics,
  BodyMetricEntry,
  UserProgression,
  UserActivity,
  Gender,
  ActivityLevel,
} from './user';

export { createDefaultUserProfile } from './user';

// --- Skill Tree ---
export type {
  SkillCategory,
  ExerciseType,
  SkillNodeStatus,
  MasteryThreshold,
  ExerciseProgress,
  PrerequisiteRule,
  SkillNode,
  SkillTree,
} from './skill-tree';

export {
  createDefaultProgress,
  isSessionThresholdMet,
  arePrerequisitesMet,
} from './skill-tree';

// --- Relative Strength Score ---
export type {
  StrengthBreakdown,
  StrengthTrend,
  RelativeStrengthScore,
  StrengthScoreEntry,
  CategoryBenchmark,
} from './strength';

export {
  CATEGORY_WEIGHTS,
  DEFAULT_BENCHMARKS,
  calculateCategoryScore,
  calculateOverallScore,
  calculateTrend,
  createDefaultStrengthScore,
} from './strength';

// --- Quests & Micro-Workouts ---
export type {
  QuestType,
  QuestDifficulty,
  QuestStatus,
  Quest,
  MicroWorkoutTemplate,
  PostureTask,
  PostureDayLog,
  DailyQuestBoard,
} from './quest';

export { createEmptyQuestBoard } from './quest';

// --- Boss Fight ---
export type {
  Tier,
  TierDefinition,
  BossChallengeExercise,
  BossChallenge,
  ExerciseResult,
  BossFightResult,
  BossFightState,
} from './boss-fight';

export {
  createDefaultBossFightState,
  evaluateBossFight,
} from './boss-fight';

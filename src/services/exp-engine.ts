// ============================================================================
// EXP Engine — Experience Point Award & Level-Up Logic
// ============================================================================
// Centralized EXP management. All EXP flows through here.
// Handles: awarding, level-up detection, streak bonuses, and tier eligibility.
// ============================================================================

import type { UserProgression } from '../models';
import { getLevelProgress, EXP_REWARDS, DIFFICULTY_MULTIPLIERS } from '../constants/exp-table';
import type { QuestDifficulty } from '../models';

// ---------------------------------------------------------------------------
// Core EXP Operations
// ---------------------------------------------------------------------------

/**
 * Awards EXP to a user progression state and recalculates level.
 * Returns the updated progression AND whether a level-up occurred.
 */
export function awardExp(
  current: UserProgression,
  expAmount: number
): { progression: UserProgression; leveledUp: boolean; previousLevel: number } {
  const previousLevel = current.level;
  const newTotalExp = current.totalExp + expAmount;
  const progress = getLevelProgress(newTotalExp);

  const updated: UserProgression = {
    ...current,
    totalExp: newTotalExp,
    level: progress.level,
    currentLevelExp: progress.currentLevelExp,
    nextLevelExp: progress.nextLevelExp,
  };

  return {
    progression: updated,
    leveledUp: progress.level > previousLevel,
    previousLevel,
  };
}

// ---------------------------------------------------------------------------
// EXP Calculation Helpers
// ---------------------------------------------------------------------------

/**
 * Calculate EXP for completing a skill training set.
 * Base reward × difficulty multiplier.
 */
export function calculateSetExp(
  baseExpPerSet: number,
  difficulty: QuestDifficulty = 'medium'
): number {
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty];
  return Math.floor(baseExpPerSet * multiplier);
}

/**
 * Calculate total EXP for a completed skill training session.
 * Includes per-set EXP + first workout bonus if applicable.
 */
export function calculateSessionExp(
  expPerSet: number,
  setsCompleted: number,
  difficulty: QuestDifficulty = 'medium',
  isFirstWorkoutOfDay: boolean = false
): number {
  const setExp = calculateSetExp(expPerSet, difficulty) * setsCompleted;
  const bonus = isFirstWorkoutOfDay ? EXP_REWARDS.FIRST_WORKOUT_BONUS : 0;
  return setExp + bonus;
}

/**
 * Calculate streak bonus EXP.
 * Daily streak bonus + milestone bonuses at 7, 30, 100 days.
 */
export function calculateStreakBonus(currentStreak: number): number {
  let bonus = currentStreak * EXP_REWARDS.STREAK_DAILY_BONUS;

  if (currentStreak === 7) bonus += EXP_REWARDS.STREAK_7_DAY;
  if (currentStreak === 30) bonus += EXP_REWARDS.STREAK_30_DAY;
  if (currentStreak === 100) bonus += EXP_REWARDS.STREAK_100_DAY;

  return bonus;
}

// ---------------------------------------------------------------------------
// Streak Management
// ---------------------------------------------------------------------------

/**
 * Updates the daily streak based on activity.
 * Call this when the user completes their first activity of the day.
 *
 * Returns updated streak count and whether it's a new streak day.
 */
export function updateStreak(
  currentStreak: number,
  longestStreak: number,
  lastActiveDate: string | null,
  today: string // YYYY-MM-DD format
): {
  currentStreak: number;
  longestStreak: number;
  isNewStreakDay: boolean;
} {
  if (lastActiveDate === today) {
    // Already active today — no streak change
    return { currentStreak, longestStreak, isNewStreakDay: false };
  }

  if (lastActiveDate === null) {
    // First ever activity
    return { currentStreak: 1, longestStreak: Math.max(1, longestStreak), isNewStreakDay: true };
  }

  // Check if last activity was yesterday
  const lastDate = new Date(lastActiveDate);
  const todayDate = new Date(today);
  const diffMs = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive day — extend streak
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, longestStreak),
      isNewStreakDay: true,
    };
  }

  // Streak broken — reset to 1
  return {
    currentStreak: 1,
    longestStreak,
    isNewStreakDay: true,
  };
}

// ---------------------------------------------------------------------------
// Tier Eligibility
// ---------------------------------------------------------------------------

/**
 * Check if the user's level meets the minimum requirement for a tier's boss fight.
 */
export function isTierEligible(currentLevel: number, requiredLevel: number): boolean {
  return currentLevel >= requiredLevel;
}

// ============================================================================
// Grease the Groove — Micro-Workout Scheduling Engine
// ============================================================================
// Manages the timing, frequency, and selection of micro-workout prompts
// throughout the day. This is the CNS adaptation system.
//
// Philosophy: High frequency, low intensity, spread across the day.
// Pavel Tsatsouline's Grease the Groove method — practice the movement
// pattern often but never to failure. The nervous system adapts.
//
// Scheduling rules:
//   - Configurable active hours (default: 8 AM – 9 PM)
//   - Minimum cooldown between prompts (default: 90 minutes)
//   - Maximum prompts per day (default: 5)
//   - Smart selection: rotate categories, avoid recent repeats
//   - Respect user's current tier for exercise difficulty
// ============================================================================

import type { MicroWorkoutTemplate, Tier } from '../models';
import { getAvailableMicroWorkouts } from '../constants/micro-workouts';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface GTGConfig {
  /** Start hour of active window (24h format, e.g., 8 = 8 AM) */
  activeStartHour: number;

  /** End hour of active window (24h format, e.g., 21 = 9 PM) */
  activeEndHour: number;

  /** Minimum minutes between prompts */
  cooldownMinutes: number;

  /** Maximum number of prompts per day */
  maxPromptsPerDay: number;

  /** Whether GTG notifications are enabled */
  enabled: boolean;
}

export const DEFAULT_GTG_CONFIG: GTGConfig = {
  activeStartHour: 8,
  activeEndHour: 21,
  cooldownMinutes: 90,
  maxPromptsPerDay: 5,
  enabled: true,
};

// ---------------------------------------------------------------------------
// Scheduling State
// ---------------------------------------------------------------------------

export interface GTGScheduleState {
  /** ISO timestamps of all prompts triggered today */
  todayPromptTimes: string[];

  /** IDs of micro-workouts already used today (for dedup) */
  todayUsedIds: string[];

  /** Categories already prompted today (for rotation) */
  todayCategoriesUsed: string[];

  /** ISO date of the current schedule day */
  scheduleDate: string;
}

export function createEmptyScheduleState(): GTGScheduleState {
  return {
    todayPromptTimes: [],
    todayUsedIds: [],
    todayCategoriesUsed: [],
    scheduleDate: new Date().toISOString().split('T')[0],
  };
}

// ---------------------------------------------------------------------------
// Core Scheduling Logic
// ---------------------------------------------------------------------------

/**
 * Determines if the current time is within the active GTG window.
 */
export function isWithinActiveWindow(config: GTGConfig, now: Date = new Date()): boolean {
  const hour = now.getHours();
  return hour >= config.activeStartHour && hour < config.activeEndHour;
}

/**
 * Determines if enough time has passed since the last prompt.
 */
export function isCooldownComplete(
  config: GTGConfig,
  lastPromptTime: string | null,
  now: Date = new Date()
): boolean {
  if (!lastPromptTime) return true;

  const last = new Date(lastPromptTime);
  const diffMs = now.getTime() - last.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  return diffMinutes >= config.cooldownMinutes;
}

/**
 * Determines if the daily prompt limit has been reached.
 */
export function isDailyLimitReached(
  config: GTGConfig,
  promptCount: number
): boolean {
  return promptCount >= config.maxPromptsPerDay;
}

/**
 * Checks if a new GTG prompt should be triggered right now.
 * Evaluates all scheduling constraints.
 */
export function shouldTriggerPrompt(
  config: GTGConfig,
  state: GTGScheduleState,
  now: Date = new Date()
): { shouldTrigger: boolean; reason: string } {
  if (!config.enabled) {
    return { shouldTrigger: false, reason: 'GTG notifications are disabled' };
  }

  // Check if schedule needs reset (new day)
  const today = now.toISOString().split('T')[0];
  if (state.scheduleDate !== today) {
    // New day — always eligible (will be reset by caller)
    return { shouldTrigger: true, reason: 'New day — first prompt available' };
  }

  if (!isWithinActiveWindow(config, now)) {
    return {
      shouldTrigger: false,
      reason: `Outside active hours (${config.activeStartHour}:00 – ${config.activeEndHour}:00)`,
    };
  }

  if (isDailyLimitReached(config, state.todayPromptTimes.length)) {
    return {
      shouldTrigger: false,
      reason: `Daily limit reached (${config.maxPromptsPerDay} prompts)`,
    };
  }

  const lastPrompt = state.todayPromptTimes[state.todayPromptTimes.length - 1] ?? null;
  if (!isCooldownComplete(config, lastPrompt, now)) {
    const last = new Date(lastPrompt!);
    const nextAvailable = new Date(last.getTime() + config.cooldownMinutes * 60 * 1000);
    const minutesLeft = Math.ceil((nextAvailable.getTime() - now.getTime()) / (1000 * 60));
    return {
      shouldTrigger: false,
      reason: `Cooldown active — ${minutesLeft} minutes until next prompt`,
    };
  }

  return { shouldTrigger: true, reason: 'Ready for next prompt' };
}

// ---------------------------------------------------------------------------
// Smart Exercise Selection
// ---------------------------------------------------------------------------

/**
 * Selects the next micro-workout with smart rotation.
 * Priorities:
 *   1. Avoid repeating the same exercise
 *   2. Rotate through categories (push → pull → legs → core → flexibility)
 *   3. Respect tier restrictions
 *   4. Prefer exercises the user is currently training (in_progress nodes)
 */
export function selectSmartMicroWorkout(
  currentTier: Tier,
  state: GTGScheduleState
): MicroWorkoutTemplate | null {
  const available = getAvailableMicroWorkouts(currentTier);
  if (available.length === 0) return null;

  // Filter out already-used exercises today
  const notUsedToday = available.filter((w) => !state.todayUsedIds.includes(w.id));

  // If we've used everything, allow repeats but prefer different categories
  const pool = notUsedToday.length > 0 ? notUsedToday : available;

  // Prefer categories not yet prompted today
  const freshCategories = pool.filter(
    (w) => !state.todayCategoriesUsed.includes(w.category)
  );

  const finalPool = freshCategories.length > 0 ? freshCategories : pool;

  // Random selection from the best available pool
  const index = Math.floor(Math.random() * finalPool.length);
  return finalPool[index];
}

/**
 * Full GTG trigger pipeline — checks scheduling then selects an exercise.
 * Returns the selected workout and the updated schedule state.
 */
export function triggerGTG(
  config: GTGConfig,
  state: GTGScheduleState,
  currentTier: Tier,
  now: Date = new Date()
): {
  workout: MicroWorkoutTemplate | null;
  updatedState: GTGScheduleState;
  triggered: boolean;
  reason: string;
} {
  const today = now.toISOString().split('T')[0];

  // Reset state if new day
  let currentState = state;
  if (state.scheduleDate !== today) {
    currentState = { ...createEmptyScheduleState(), scheduleDate: today };
  }

  // Check scheduling constraints
  const check = shouldTriggerPrompt(config, currentState, now);
  if (!check.shouldTrigger) {
    return {
      workout: null,
      updatedState: currentState,
      triggered: false,
      reason: check.reason,
    };
  }

  // Select workout
  const workout = selectSmartMicroWorkout(currentTier, currentState);
  if (!workout) {
    return {
      workout: null,
      updatedState: currentState,
      triggered: false,
      reason: 'No available micro-workouts for your tier',
    };
  }

  // Update state
  const updatedState: GTGScheduleState = {
    ...currentState,
    todayPromptTimes: [...currentState.todayPromptTimes, now.toISOString()],
    todayUsedIds: [...currentState.todayUsedIds, workout.id],
    todayCategoriesUsed: [...new Set([...currentState.todayCategoriesUsed, workout.category])],
  };

  return {
    workout,
    updatedState,
    triggered: true,
    reason: `Triggered: ${workout.prompt}`,
  };
}

// ---------------------------------------------------------------------------
// Optimal Schedule Planning
// ---------------------------------------------------------------------------

/**
 * Calculates the optimal prompt times for today based on config.
 * Spreads prompts evenly across the active window.
 * Used for displaying "upcoming" GTG times on the dashboard.
 */
export function calculateOptimalSchedule(
  config: GTGConfig,
  promptsRemaining: number,
  now: Date = new Date()
): Date[] {
  if (promptsRemaining <= 0) return [];

  const currentHour = now.getHours();
  const startHour = Math.max(currentHour, config.activeStartHour);
  const hoursRemaining = config.activeEndHour - startHour;

  if (hoursRemaining <= 0) return [];

  const interval = hoursRemaining / promptsRemaining;
  const schedule: Date[] = [];

  for (let i = 0; i < promptsRemaining; i++) {
    const promptDate = new Date(now);
    promptDate.setHours(startHour + Math.floor(interval * i));
    promptDate.setMinutes(Math.floor((interval * i % 1) * 60));
    promptDate.setSeconds(0, 0);

    // Don't schedule in the past
    if (promptDate > now) {
      schedule.push(promptDate);
    }
  }

  return schedule;
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

/**
 * Calculate GTG completion stats for display.
 */
export function getGTGStats(
  config: GTGConfig,
  state: GTGScheduleState
): {
  completed: number;
  total: number;
  remaining: number;
  completionPercent: number;
  nextAvailableIn: number | null; // minutes, null if ready now
} {
  const completed = state.todayPromptTimes.length;
  const total = config.maxPromptsPerDay;
  const remaining = Math.max(0, total - completed);
  const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  let nextAvailableIn: number | null = null;
  if (remaining > 0) {
    const lastPrompt = state.todayPromptTimes[state.todayPromptTimes.length - 1];
    if (lastPrompt) {
      const last = new Date(lastPrompt);
      const nextTime = new Date(last.getTime() + config.cooldownMinutes * 60 * 1000);
      const now = new Date();
      if (nextTime > now) {
        nextAvailableIn = Math.ceil((nextTime.getTime() - now.getTime()) / (1000 * 60));
      } else {
        nextAvailableIn = 0; // Ready now
      }
    } else {
      nextAvailableIn = 0; // No prompts yet — ready now
    }
  }

  return { completed, total, remaining, completionPercent, nextAvailableIn };
}

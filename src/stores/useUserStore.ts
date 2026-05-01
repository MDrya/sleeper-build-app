// ============================================================================
// User Store — Zustand State Management
// ============================================================================
// Manages: user profile, body metrics, progression (EXP/level/tier), streaks.
// Persisted to localStorage via Zustand middleware.
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, ActivityLevel, Gender, Tier } from '../models';
import { createDefaultUserProfile } from '../models';
import { runCalibration, calculateAge } from '../services/calibration';
import { awardExp, updateStreak, calculateStreakBonus } from '../services/exp-engine';

// ---------------------------------------------------------------------------
// Store Interface
// ---------------------------------------------------------------------------

interface UserState {
  /** The current user profile (null if not yet created) */
  user: UserProfile | null;

  /** Whether the app has been initialized with a user */
  isInitialized: boolean;

  // --- Actions ---

  /** Create a new user profile */
  createUser: (displayName: string) => void;

  /** Run baseline calibration and mark as calibrated */
  calibrate: (
    heightCm: number,
    weightKg: number,
    dateOfBirth: string,
    gender: Gender,
    activityLevel: ActivityLevel
  ) => void;

  /** Log a new body metric entry (periodic weight/height check-in) */
  logBodyMetric: (weightKg: number, apparentHeightCm: number) => void;

  /** Award EXP to the user — returns whether a level-up occurred */
  addExp: (amount: number) => boolean;

  /** Promote user to the next tier */
  promoteTier: (newTier: Tier) => void;

  /** Record daily activity (updates streaks) */
  recordDailyActivity: () => number; // Returns streak bonus EXP

  /** Update activity level */
  setActivityLevel: (level: ActivityLevel) => void;

  /** Reset all progress (dangerous — for testing/debug) */
  resetProgress: () => void;
}

// ---------------------------------------------------------------------------
// Store Implementation
// ---------------------------------------------------------------------------

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isInitialized: false,

      createUser: (displayName: string) => {
        const id = crypto.randomUUID();
        const user = createDefaultUserProfile(id, displayName);
        set({ user, isInitialized: true });
      },

      calibrate: (heightCm, weightKg, dateOfBirth, gender, activityLevel) => {
        const state = get();
        if (!state.user) return;

        const age = calculateAge(dateOfBirth);
        const result = runCalibration({
          heightCm,
          weightKg,
          ageYears: age,
          gender,
          activityLevel,
        });

        set({
          user: {
            ...state.user,
            gender,
            dateOfBirth,
            activityLevel,
            isCalibrated: true,
            bodyMetrics: result.bodyMetrics,
          },
        });
      },

      logBodyMetric: (weightKg, apparentHeightCm) => {
        const state = get();
        if (!state.user) return;

        const today = new Date().toISOString().split('T')[0];
        const metrics = state.user.bodyMetrics;

        // Recalculate BMI with new weight
        const heightM = metrics.baseHeightCm / 100;
        const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

        // Recalculate TDEE with new weight
        const age = calculateAge(state.user.dateOfBirth);
        const { tdee } = (() => {
          const bmr = (() => {
            const base = 10 * weightKg + 6.25 * metrics.baseHeightCm - 5 * age;
            switch (state.user.gender) {
              case 'male': return base + 5;
              case 'female': return base - 161;
              case 'other': return base - 78;
            }
          })();
          return { tdee: Math.round(bmr * { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 }[state.user.activityLevel]) };
        })();

        const newEntry = { date: today, weightKg, apparentHeightCm };

        set({
          user: {
            ...state.user,
            bodyMetrics: {
              ...metrics,
              currentWeightKg: weightKg,
              currentApparentHeightCm: apparentHeightCm,
              bmi,
              dailyMaintenanceCalories: tdee,
              history: [...metrics.history, newEntry],
            },
          },
        });
      },

      addExp: (amount: number) => {
        const state = get();
        if (!state.user) return false;

        const result = awardExp(state.user.progression, amount);

        set({
          user: {
            ...state.user,
            progression: result.progression,
          },
        });

        return result.leveledUp;
      },

      promoteTier: (newTier: Tier) => {
        const state = get();
        if (!state.user) return;

        set({
          user: {
            ...state.user,
            progression: {
              ...state.user.progression,
              currentTier: newTier,
              lastTierPromotionDate: new Date().toISOString(),
            },
          },
        });
      },

      recordDailyActivity: () => {
        const state = get();
        if (!state.user) return 0;

        const today = new Date().toISOString().split('T')[0];
        const activity = state.user.activity;

        const streakResult = updateStreak(
          activity.currentStreak,
          activity.longestStreak,
          activity.lastActiveDate,
          today
        );

        const streakBonus = streakResult.isNewStreakDay
          ? calculateStreakBonus(streakResult.currentStreak)
          : 0;

        set({
          user: {
            ...state.user,
            activity: {
              ...activity,
              currentStreak: streakResult.currentStreak,
              longestStreak: streakResult.longestStreak,
              lastActiveDate: today,
            },
          },
        });

        // Award streak bonus EXP if applicable
        if (streakBonus > 0) {
          // Use setTimeout to avoid nested set() calls
          setTimeout(() => get().addExp(streakBonus), 0);
        }

        return streakBonus;
      },

      setActivityLevel: (level: ActivityLevel) => {
        const state = get();
        if (!state.user) return;

        set({
          user: {
            ...state.user,
            activityLevel: level,
          },
        });
      },

      resetProgress: () => {
        set({ user: null, isInitialized: false });
      },
    }),
    {
      name: 'sleeper-build-user',
    }
  )
);

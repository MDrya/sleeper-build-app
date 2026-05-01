// ============================================================================
// Boss Fight Store — Monthly Tier Evaluation State
// ============================================================================
// Manages: boss fight eligibility, attempt logging, tier promotion,
// cooldown tracking, and fight history.
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BossFightState, BossFightResult, ExerciseResult } from '../models';
import { createDefaultBossFightState, evaluateBossFight } from '../models';
import { getTierDefinition, getNextTierDefinition } from '../constants/tiers';
import { useUserStore } from './useUserStore';
import { useSkillTreeStore } from './useSkillTreeStore';

// ---------------------------------------------------------------------------
// Store Interface
// ---------------------------------------------------------------------------

interface BossFightStoreState {
  /** Boss fight state (eligibility, history, next challenge) */
  bossFight: BossFightState;

  // --- Actions ---

  /** Check and update boss fight eligibility */
  checkEligibility: () => void;

  /** Start a boss fight attempt — returns the challenge details */
  startAttempt: () => { challengeId: string; bossName: string } | null;

  /** Submit results of a boss fight attempt */
  submitAttempt: (
    challengeId: string,
    exerciseResults: ExerciseResult[],
    totalTimeSeconds: number,
    notes?: string
  ) => BossFightResult;

  /** Reset boss fight state */
  resetBossFight: () => void;
}

// ---------------------------------------------------------------------------
// Store Implementation
// ---------------------------------------------------------------------------

export const useBossFightStore = create<BossFightStoreState>()(
  persist(
    (set, get) => ({
      bossFight: createDefaultBossFightState(),

      checkEligibility: () => {
        const user = useUserStore.getState().user;
        if (!user) {
          set({
            bossFight: {
              ...get().bossFight,
              isEligible: false,
              ineligibleReason: 'No user profile found',
            },
          });
          return;
        }

        if (!user.isCalibrated) {
          set({
            bossFight: {
              ...get().bossFight,
              isEligible: false,
              ineligibleReason: 'Complete baseline calibration first',
            },
          });
          return;
        }

        const currentTier = user.progression.currentTier;
        const nextTierDef = getNextTierDefinition(currentTier);

        if (!nextTierDef) {
          set({
            bossFight: {
              ...get().bossFight,
              isEligible: false,
              ineligibleReason: 'You have reached the maximum tier. You are the Sleeper.',
              nextChallenge: null,
            },
          });
          return;
        }

        // Check level requirement
        if (user.progression.level < nextTierDef.minimumLevel) {
          set({
            bossFight: {
              ...get().bossFight,
              isEligible: false,
              ineligibleReason: `Reach Level ${nextTierDef.minimumLevel} to challenge ${nextTierDef.bossChallenge?.bossName ?? 'the boss'}. Current: Level ${user.progression.level}.`,
              nextChallenge: nextTierDef.bossChallenge,
            },
          });
          return;
        }

        // Check cooldown
        const state = get();
        if (state.bossFight.nextAvailableDate) {
          const availDate = new Date(state.bossFight.nextAvailableDate);
          if (new Date() < availDate) {
            const daysLeft = Math.ceil(
              (availDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            set({
              bossFight: {
                ...state.bossFight,
                isEligible: false,
                ineligibleReason: `Cooldown active. ${daysLeft} day(s) until next attempt.`,
                nextChallenge: nextTierDef.bossChallenge,
              },
            });
            return;
          }
        }

        // Eligible!
        set({
          bossFight: {
            ...state.bossFight,
            isEligible: true,
            ineligibleReason: null,
            nextChallenge: nextTierDef.bossChallenge,
          },
        });
      },

      startAttempt: () => {
        const state = get();
        if (!state.bossFight.isEligible || !state.bossFight.nextChallenge) {
          return null;
        }

        return {
          challengeId: state.bossFight.nextChallenge.id,
          bossName: state.bossFight.nextChallenge.bossName,
        };
      },

      submitAttempt: (challengeId, exerciseResults, totalTimeSeconds, notes = '') => {
        const state = get();
        const challenge = state.bossFight.nextChallenge;

        if (!challenge || challenge.id !== challengeId) {
          throw new Error('Challenge mismatch — cannot submit results');
        }

        // Evaluate the fight
        const evaluation = evaluateBossFight(challenge, exerciseResults, totalTimeSeconds);

        // Create result record
        const result: BossFightResult = {
          id: crypto.randomUUID(),
          challengeId,
          targetTier: challenge.targetTier,
          attemptDate: new Date().toISOString(),
          totalTimeSeconds,
          exerciseResults,
          passed: evaluation.passed,
          expEarned: evaluation.expEarned,
          notes,
        };

        // Award EXP
        useUserStore.getState().addExp(evaluation.expEarned);

        // Update boss fight attempts count
        const user = useUserStore.getState().user;
        if (user) {
          useUserStore.setState({
            user: {
              ...user,
              activity: {
                ...user.activity,
                bossFightsAttempted: user.activity.bossFightsAttempted + 1,
                bossFightsPassed: user.activity.bossFightsPassed + (evaluation.passed ? 1 : 0),
              },
            },
          });
        }

        if (evaluation.passed) {
          // TIER PROMOTION
          useUserStore.getState().promoteTier(challenge.targetTier);

          // Refresh skill tree unlock status (new tier unlocks new nodes)
          useSkillTreeStore.getState().refreshUnlockStatus();

          set({
            bossFight: {
              isEligible: false,
              ineligibleReason: `Congratulations! You are now ${getTierDefinition(challenge.targetTier)?.name ?? 'promoted'}.`,
              nextAvailableDate: null,
              nextChallenge: null,
              history: [result, ...state.bossFight.history],
            },
          });
        } else {
          // FAILED — apply cooldown
          const cooldownMs = challenge.cooldownDays * 24 * 60 * 60 * 1000;
          const nextAvailable = new Date(Date.now() + cooldownMs).toISOString();

          set({
            bossFight: {
              ...state.bossFight,
              isEligible: false,
              ineligibleReason: `Failed. Train harder. Cooldown: ${challenge.cooldownDays} days.`,
              nextAvailableDate: nextAvailable,
              history: [result, ...state.bossFight.history],
            },
          });
        }

        return result;
      },

      resetBossFight: () => {
        set({ bossFight: createDefaultBossFightState() });
      },
    }),
    {
      name: 'sleeper-build-boss-fight',
    }
  )
);

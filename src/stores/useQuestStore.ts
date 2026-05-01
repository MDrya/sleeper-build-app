// ============================================================================
// Quest Store — Daily Quests, Micro-Workouts & Posture Tracking
// ============================================================================
// Manages: daily quest board generation, micro-workout tracking,
// posture/decompression streak, and quest completion.
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Quest, DailyQuestBoard, PostureTask, PostureDayLog } from '../models';
import { createEmptyQuestBoard } from '../models';
import { pickRandomMicroWorkout } from '../constants/micro-workouts';
import { useUserStore } from './useUserStore';
import { useSkillTreeStore } from './useSkillTreeStore';
import { EXP_REWARDS } from '../constants/exp-table';

// ---------------------------------------------------------------------------
// Posture Tasks Pool
// ---------------------------------------------------------------------------

const POSTURE_TASKS: PostureTask[] = [
  {
    id: 'posture_dead_hang',
    name: 'Dead Hang',
    instructions: 'Hang from a bar with straight arms. Relax your shoulders. Let gravity decompress your spine. Breathe deeply.',
    targetSeconds: 30,
    targetSets: 3,
    expReward: EXP_REWARDS.POSTURE_TASK,
    equipment: ['bar'],
    targetArea: 'spine',
  },
  {
    id: 'posture_cat_cow',
    name: 'Cat-Cow Flow',
    instructions: 'On hands and knees, alternate between arching and rounding your spine. Slow and controlled. Feel each vertebra.',
    targetSeconds: 60,
    targetSets: 2,
    expReward: EXP_REWARDS.POSTURE_TASK,
    equipment: [],
    targetArea: 'spine',
  },
  {
    id: 'posture_wall_angel',
    name: 'Wall Angels',
    instructions: 'Back flat against wall. Arms in W position, slide up to Y while keeping contact with wall. Kills rounded shoulders.',
    targetSeconds: 0,
    targetSets: 3,
    expReward: EXP_REWARDS.POSTURE_TASK,
    equipment: ['wall'],
    targetArea: 'shoulders',
  },
  {
    id: 'posture_thoracic_rotation',
    name: 'Thoracic Rotation',
    instructions: 'On all fours, hand behind head. Rotate upper body, elbow to ceiling. Both sides. Opens up the mid-back.',
    targetSeconds: 30,
    targetSets: 2,
    expReward: EXP_REWARDS.POSTURE_TASK,
    equipment: [],
    targetArea: 'thoracic',
  },
  {
    id: 'posture_hip_flexor_stretch',
    name: 'Hip Flexor Stretch',
    instructions: 'Half-kneeling position. Push hips forward gently. Squeeze glute of the kneeling leg. Hold. Both sides.',
    targetSeconds: 45,
    targetSets: 2,
    expReward: EXP_REWARDS.POSTURE_TASK,
    equipment: [],
    targetArea: 'hips',
  },
  {
    id: 'posture_chin_tuck',
    name: 'Chin Tucks',
    instructions: 'Sit or stand tall. Pull chin straight back (make a double chin). Hold 5 seconds. Repeat. Fixes forward head posture.',
    targetSeconds: 5,
    targetSets: 10,
    expReward: EXP_REWARDS.POSTURE_TASK,
    equipment: [],
    targetArea: 'neck',
  },
  {
    id: 'posture_deep_squat_sit',
    name: 'Deep Squat Sit',
    instructions: 'Sit in a full deep squat. Heels flat, chest up. Just sit there. Breathe. This is how humans are supposed to rest.',
    targetSeconds: 60,
    targetSets: 2,
    expReward: EXP_REWARDS.POSTURE_TASK,
    equipment: [],
    targetArea: 'full_body',
  },
];

// ---------------------------------------------------------------------------
// Store Interface
// ---------------------------------------------------------------------------

interface QuestState {
  /** Today's quest board */
  questBoard: DailyQuestBoard;

  /** Posture streak — consecutive days of completing posture tasks */
  postureStreak: number;

  /** Longest posture streak */
  longestPostureStreak: number;

  /** Recent posture day logs */
  postureLogs: PostureDayLog[];

  /** IDs of micro-workouts triggered today (for deduplication) */
  todayMicroWorkoutIds: string[];

  // --- Actions ---

  /** Generate today's quest board (call on app open) */
  generateDailyBoard: () => void;

  /** Complete a skill training quest */
  completeQuest: (questId: string) => void;

  /** Trigger a new micro-workout notification */
  triggerMicroWorkout: () => Quest | null;

  /** Complete a micro-workout */
  completeMicroWorkout: (questId: string) => void;

  /** Complete a posture task */
  completePostureTask: (taskId: string) => void;

  /** Check if today's board needs refreshing (new day) */
  checkAndRefreshBoard: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function generateQuestId(): string {
  return `quest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Pick 2-3 random posture tasks for today, ensuring variety in target areas.
 */
function pickPostureTasks(count: number = 3): PostureTask[] {
  const shuffled = [...POSTURE_TASKS].sort(() => Math.random() - 0.5);
  const selected: PostureTask[] = [];
  const usedAreas = new Set<string>();

  for (const task of shuffled) {
    if (selected.length >= count) break;
    if (!usedAreas.has(task.targetArea)) {
      selected.push(task);
      usedAreas.add(task.targetArea);
    }
  }

  // Fill remaining if we couldn't get unique areas
  if (selected.length < count) {
    for (const task of shuffled) {
      if (selected.length >= count) break;
      if (!selected.find((s) => s.id === task.id)) {
        selected.push(task);
      }
    }
  }

  return selected;
}

/**
 * Generate skill training quests based on unlocked nodes.
 */
function generateSkillQuests(): Quest[] {
  const skillTreeStore = useSkillTreeStore.getState();
  const quests: Quest[] = [];
  const categories: Array<'push' | 'pull' | 'legs' | 'core' | 'flexibility'> = [
    'push', 'pull', 'legs', 'core', 'flexibility',
  ];

  // Pick one exercise from each category that has an available node
  for (const category of categories) {
    const nextExercise = skillTreeStore.getNextExercise(category);
    if (nextExercise) {
      const quest: Quest = {
        id: generateQuestId(),
        type: 'skill_training',
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Training`,
        description: `Complete ${nextExercise.masteryThreshold.sets} sets of ${nextExercise.name}`,
        difficulty: nextExercise.minimumTier >= 3 ? 'hard' : nextExercise.minimumTier >= 1 ? 'medium' : 'easy',
        status: 'available',
        skillNodeId: nextExercise.id,
        targetSets: nextExercise.masteryThreshold.sets,
        targetReps: nextExercise.masteryThreshold.reps,
        targetHoldSeconds: nextExercise.masteryThreshold.holdSeconds,
        expReward: nextExercise.expPerSet * nextExercise.masteryThreshold.sets,
        bonusExp: 25,
        availableAt: new Date().toISOString(),
        expiresAt: null, // Skill quests don't expire
        completedAt: null,
      };
      quests.push(quest);
    }
  }

  return quests;
}

// ---------------------------------------------------------------------------
// Store Implementation
// ---------------------------------------------------------------------------

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      questBoard: createEmptyQuestBoard(getToday()),
      postureStreak: 0,
      longestPostureStreak: 0,
      postureLogs: [],
      todayMicroWorkoutIds: [],

      generateDailyBoard: () => {
        const today = getToday();
        const skillQuests = generateSkillQuests();
        const postureTasks = pickPostureTasks(3);

        set({
          questBoard: {
            date: today,
            skillQuests,
            postureTasks,
            microWorkoutsTriggered: 0,
            microWorkoutsCompleted: 0,
            isComplete: false,
            expEarnedToday: 0,
          },
          todayMicroWorkoutIds: [],
        });
      },

      completeQuest: (questId: string) => {
        const state = get();
        const board = state.questBoard;

        const updatedQuests = board.skillQuests.map((q) => {
          if (q.id === questId && q.status !== 'completed') {
            return { ...q, status: 'completed' as const, completedAt: new Date().toISOString() };
          }
          return q;
        });

        const quest = board.skillQuests.find((q) => q.id === questId);
        const expGained = quest ? quest.expReward + quest.bonusExp : 0;

        set({
          questBoard: {
            ...board,
            skillQuests: updatedQuests,
            expEarnedToday: board.expEarnedToday + expGained,
            isComplete: updatedQuests.every((q) => q.status === 'completed'),
          },
        });
      },

      triggerMicroWorkout: () => {
        const state = get();
        const user = useUserStore.getState().user;
        if (!user) return null;

        const currentTier = user.progression.currentTier;
        const template = pickRandomMicroWorkout(currentTier, state.todayMicroWorkoutIds);
        if (!template) return null;

        const quest: Quest = {
          id: generateQuestId(),
          type: 'micro_workout',
          title: 'Grease the Groove',
          description: template.prompt,
          difficulty: 'easy',
          status: 'available',
          skillNodeId: template.skillNodeId,
          targetSets: 1,
          targetReps: template.unit === 'reps' ? template.amount : undefined,
          targetHoldSeconds: template.unit === 'seconds' ? template.amount : undefined,
          expReward: template.expReward,
          bonusExp: 0,
          availableAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min window
          completedAt: null,
        };

        set({
          questBoard: {
            ...state.questBoard,
            microWorkoutsTriggered: state.questBoard.microWorkoutsTriggered + 1,
          },
          todayMicroWorkoutIds: [...state.todayMicroWorkoutIds, template.id],
        });

        return quest;
      },

      completeMicroWorkout: (_questId: string) => {
        const state = get();

        set({
          questBoard: {
            ...state.questBoard,
            microWorkoutsCompleted: state.questBoard.microWorkoutsCompleted + 1,
            expEarnedToday: state.questBoard.expEarnedToday + EXP_REWARDS.MICRO_WORKOUT,
          },
        });

        // Award EXP
        useUserStore.getState().addExp(EXP_REWARDS.MICRO_WORKOUT);

        // Update micro-workout count
        const user = useUserStore.getState().user;
        if (user) {
          useUserStore.setState({
            user: {
              ...user,
              activity: {
                ...user.activity,
                totalMicroWorkouts: user.activity.totalMicroWorkouts + 1,
              },
            },
          });
        }
      },

      completePostureTask: (taskId: string) => {
        const state = get();
        const today = getToday();
        const board = state.questBoard;

        // Find the task
        const task = board.postureTasks.find((t) => t.id === taskId);
        if (!task) return;

        // Update or create today's posture log
        let todayLog = state.postureLogs.find((l) => l.date === today);
        if (!todayLog) {
          todayLog = {
            date: today,
            completedTaskIds: [],
            totalSecondsHeld: 0,
            countsForStreak: false,
          };
        }

        // Don't double-complete
        if (todayLog.completedTaskIds.includes(taskId)) return;

        const updatedLog: PostureDayLog = {
          ...todayLog,
          completedTaskIds: [...todayLog.completedTaskIds, taskId],
          totalSecondsHeld: todayLog.totalSecondsHeld + task.targetSeconds * task.targetSets,
          countsForStreak: todayLog.completedTaskIds.length + 1 >= 2, // 2+ tasks = streak day
        };

        // Update posture streak
        let newStreak = state.postureStreak;
        let newLongest = state.longestPostureStreak;

        if (updatedLog.countsForStreak && !todayLog.countsForStreak) {
          // Just became a streak day
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          const yesterdayLog = state.postureLogs.find((l) => l.date === yesterdayStr);

          if (yesterdayLog?.countsForStreak) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
          newLongest = Math.max(newLongest, newStreak);
        }

        // Update logs
        const updatedLogs = state.postureLogs.filter((l) => l.date !== today);
        updatedLogs.push(updatedLog);

        set({
          postureStreak: newStreak,
          longestPostureStreak: newLongest,
          postureLogs: updatedLogs.slice(-90), // Keep 90 days
          questBoard: {
            ...board,
            expEarnedToday: board.expEarnedToday + task.expReward,
          },
        });

        // Award EXP
        useUserStore.getState().addExp(task.expReward);
      },

      checkAndRefreshBoard: () => {
        const state = get();
        const today = getToday();

        if (state.questBoard.date !== today) {
          get().generateDailyBoard();
        }
      },
    }),
    {
      name: 'sleeper-build-quests',
    }
  )
);

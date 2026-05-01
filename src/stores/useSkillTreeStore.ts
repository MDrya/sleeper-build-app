// ============================================================================
// Skill Tree Store — Progression State Management
// ============================================================================
// Manages: all 5 skill trees, node status transitions, session logging,
// mastery detection, and prerequisite cascade unlocking.
//
// This is the heart of the RPG system.
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SkillTree, SkillNode, SkillCategory, SkillNodeStatus } from '../models';
import { arePrerequisitesMet, isSessionThresholdMet } from '../models';
import { createAllSkillTrees, flattenAllNodes } from '../constants/skill-trees';
import { useUserStore } from './useUserStore';

// ---------------------------------------------------------------------------
// Session Log (for tracking what was done)
// ---------------------------------------------------------------------------

export interface SessionLog {
  nodeId: string;
  date: string;            // ISO date string
  sets: number;
  reps: number;
  holdSeconds: number;
  expEarned: number;
  thresholdMet: boolean;   // Whether this session met the mastery threshold
}

// ---------------------------------------------------------------------------
// Store Interface
// ---------------------------------------------------------------------------

interface SkillTreeState {
  /** All 5 skill trees with current user state */
  trees: Record<SkillCategory, SkillTree>;

  /** Session history — last 100 sessions for review */
  sessionHistory: SessionLog[];

  /** Whether the trees have been initialized */
  isInitialized: boolean;

  // --- Actions ---

  /** Initialize trees with fresh data (for new users) */
  initializeTrees: () => void;

  /** Log a training session for a specific exercise */
  logSession: (
    nodeId: string,
    sets: number,
    reps: number,
    holdSeconds?: number
  ) => { expEarned: number; masteryAchieved: boolean; nodesUnlocked: string[] };

  /** Force-refresh unlock status for all nodes (cascading prerequisite check) */
  refreshUnlockStatus: () => void;

  /** Get a specific node by ID (searches all trees) */
  getNode: (nodeId: string) => SkillNode | null;

  /** Get all unlocked nodes across all trees */
  getUnlockedNodes: () => SkillNode[];

  /** Get all mastered nodes across all trees */
  getMasteredNodes: () => SkillNode[];

  /** Get the next recommended exercise for a category */
  getNextExercise: (category: SkillCategory) => SkillNode | null;

  /** Reset all trees to initial state */
  resetTrees: () => void;
}

// ---------------------------------------------------------------------------
// Helper: Find which tree a node belongs to
// ---------------------------------------------------------------------------

function findNodeCategory(
  nodeId: string,
  trees: Record<SkillCategory, SkillTree>
): SkillCategory | null {
  for (const [category, tree] of Object.entries(trees)) {
    if (tree.nodes[nodeId]) return category as SkillCategory;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Store Implementation
// ---------------------------------------------------------------------------

export const useSkillTreeStore = create<SkillTreeState>()(
  persist(
    (set, get) => ({
      trees: createAllSkillTrees(),
      sessionHistory: [],
      isInitialized: false,

      initializeTrees: () => {
        set({
          trees: createAllSkillTrees(),
          sessionHistory: [],
          isInitialized: true,
        });
      },

      logSession: (nodeId, sets, reps, holdSeconds = 0) => {
        const state = get();
        const category = findNodeCategory(nodeId, state.trees);
        if (!category) return { expEarned: 0, masteryAchieved: false, nodesUnlocked: [] };

        const tree = state.trees[category];
        const node = tree.nodes[nodeId];
        if (!node) return { expEarned: 0, masteryAchieved: false, nodesUnlocked: [] };

        // Can't train locked nodes
        if (node.status === 'locked') {
          return { expEarned: 0, masteryAchieved: false, nodesUnlocked: [] };
        }

        const today = new Date().toISOString().split('T')[0];

        // --- Update progress ---
        const updatedProgress = { ...node.progress };
        updatedProgress.bestSets = Math.max(updatedProgress.bestSets, sets);
        updatedProgress.bestReps = Math.max(updatedProgress.bestReps, reps);
        updatedProgress.bestHoldSeconds = Math.max(updatedProgress.bestHoldSeconds, holdSeconds);
        updatedProgress.totalSessions += 1;
        updatedProgress.totalRepsLifetime += reps * sets;

        // --- Check if this session meets the mastery threshold ---
        const thresholdMet = isSessionThresholdMet(node, sets, reps, holdSeconds);

        if (thresholdMet) {
          if (updatedProgress.lastSessionDate === today) {
            // Already logged today — don't double-count consecutive days
          } else {
            const lastDate = updatedProgress.lastSessionDate;
            if (lastDate) {
              const last = new Date(lastDate);
              const todayDate = new Date(today);
              const diffDays = Math.floor(
                (todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
              );
              if (diffDays === 1) {
                updatedProgress.consecutiveDaysMet += 1;
              } else if (diffDays > 1) {
                updatedProgress.consecutiveDaysMet = 1; // Reset if gap
              }
            } else {
              updatedProgress.consecutiveDaysMet = 1; // First time
            }
          }
        } else {
          // Threshold not met — reset consecutive counter
          updatedProgress.consecutiveDaysMet = 0;
        }

        updatedProgress.lastSessionDate = today;

        // --- Check mastery ---
        let masteryAchieved = false;
        let newStatus: SkillNodeStatus = node.status === 'unlocked' ? 'in_progress' : node.status;

        if (
          node.status !== 'mastered' &&
          thresholdMet &&
          updatedProgress.consecutiveDaysMet >= node.masteryThreshold.consecutiveDays
        ) {
          newStatus = 'mastered';
          masteryAchieved = true;
        }

        // --- Calculate EXP ---
        let expEarned = node.expPerSet * sets;
        if (masteryAchieved) {
          expEarned += node.masteryBonusExp;
        }

        // --- Update the tree ---
        const updatedNode: SkillNode = {
          ...node,
          status: newStatus,
          progress: updatedProgress,
        };

        const updatedTree: SkillTree = {
          ...tree,
          nodes: { ...tree.nodes, [nodeId]: updatedNode },
        };

        const updatedTrees = { ...state.trees, [category]: updatedTree };

        // --- Cascade: check if any locked nodes should now unlock ---
        const nodesUnlocked: string[] = [];
        const allNodesFlat = flattenAllNodes(updatedTrees);

        for (const [cat, t] of Object.entries(updatedTrees)) {
          for (const [nId, n] of Object.entries(t.nodes)) {
            if (n.status === 'locked' && arePrerequisitesMet(n, allNodesFlat)) {
              // Check tier requirement
              const user = useUserStore.getState().user;
              const currentTier = user?.progression.currentTier ?? 0;

              if (n.minimumTier <= currentTier) {
                (updatedTrees[cat as SkillCategory] as SkillTree).nodes[nId] = {
                  ...n,
                  status: 'unlocked',
                };
                nodesUnlocked.push(nId);
              }
            }
          }
        }

        // --- Log session ---
        const sessionLog: SessionLog = {
          nodeId,
          date: today,
          sets,
          reps,
          holdSeconds,
          expEarned,
          thresholdMet,
        };

        const updatedHistory = [sessionLog, ...state.sessionHistory].slice(0, 100);

        set({
          trees: updatedTrees,
          sessionHistory: updatedHistory,
        });

        // --- Award EXP via user store ---
        useUserStore.getState().addExp(expEarned);

        // --- Record daily activity ---
        useUserStore.getState().recordDailyActivity();

        // --- Update workout count ---
        const user = useUserStore.getState().user;
        if (user) {
          useUserStore.setState({
            user: {
              ...user,
              activity: {
                ...user.activity,
                totalWorkoutsLogged: user.activity.totalWorkoutsLogged + 1,
              },
            },
          });
        }

        return { expEarned, masteryAchieved, nodesUnlocked };
      },

      refreshUnlockStatus: () => {
        const state = get();
        const user = useUserStore.getState().user;
        const currentTier = user?.progression.currentTier ?? 0;
        const updatedTrees = { ...state.trees };
        const allNodes = flattenAllNodes(updatedTrees);

        for (const [cat, tree] of Object.entries(updatedTrees)) {
          for (const [nodeId, node] of Object.entries(tree.nodes)) {
            if (
              node.status === 'locked' &&
              node.minimumTier <= currentTier &&
              arePrerequisitesMet(node, allNodes)
            ) {
              (updatedTrees[cat as SkillCategory] as SkillTree).nodes[nodeId] = {
                ...node,
                status: 'unlocked',
              };
            }
          }
        }

        set({ trees: updatedTrees });
      },

      getNode: (nodeId: string) => {
        const state = get();
        for (const tree of Object.values(state.trees)) {
          if (tree.nodes[nodeId]) return tree.nodes[nodeId];
        }
        return null;
      },

      getUnlockedNodes: () => {
        const state = get();
        const unlocked: SkillNode[] = [];
        for (const tree of Object.values(state.trees)) {
          for (const node of Object.values(tree.nodes)) {
            if (node.status === 'unlocked' || node.status === 'in_progress') {
              unlocked.push(node);
            }
          }
        }
        return unlocked;
      },

      getMasteredNodes: () => {
        const state = get();
        const mastered: SkillNode[] = [];
        for (const tree of Object.values(state.trees)) {
          for (const node of Object.values(tree.nodes)) {
            if (node.status === 'mastered') {
              mastered.push(node);
            }
          }
        }
        return mastered;
      },

      getNextExercise: (category: SkillCategory) => {
        const state = get();
        const tree = state.trees[category];
        if (!tree) return null;

        // Find the first node on the main path that is unlocked or in_progress
        for (const nodeId of tree.mainPath) {
          const node = tree.nodes[nodeId];
          if (node && (node.status === 'unlocked' || node.status === 'in_progress')) {
            return node;
          }
        }

        // If all main path mastered, check side branches
        for (const node of Object.values(tree.nodes)) {
          if (node.status === 'unlocked' || node.status === 'in_progress') {
            return node;
          }
        }

        return null; // All mastered
      },

      resetTrees: () => {
        set({
          trees: createAllSkillTrees(),
          sessionHistory: [],
          isInitialized: false,
        });
      },
    }),
    {
      name: 'sleeper-build-skill-trees',
    }
  )
);

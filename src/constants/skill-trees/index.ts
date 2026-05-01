// ============================================================================
// Skill Trees — Barrel Export & Tree Builder
// ============================================================================

import type { SkillTree, SkillNode, SkillCategory } from '../../models';
import { PUSH_TREE_NODES, PUSH_MAIN_PATH } from './push';
import { PULL_TREE_NODES, PULL_MAIN_PATH } from './pull';
import { LEGS_TREE_NODES, LEGS_MAIN_PATH } from './legs';
import { CORE_TREE_NODES, CORE_MAIN_PATH } from './core';
import { FLEXIBILITY_TREE_NODES, FLEXIBILITY_MAIN_PATH } from './flexibility';

// ---------------------------------------------------------------------------
// Helper: Convert node array to Record<id, node> for O(1) lookups
// ---------------------------------------------------------------------------

function buildNodeMap(nodes: SkillNode[]): Record<string, SkillNode> {
  const map: Record<string, SkillNode> = {};
  for (const node of nodes) {
    map[node.id] = { ...node };
  }
  return map;
}

// ---------------------------------------------------------------------------
// Assembled Skill Trees
// ---------------------------------------------------------------------------

export function createPushTree(): SkillTree {
  return {
    category: 'push',
    displayName: 'Push Mastery',
    description: 'From wall push-ups to one-arm push-ups. Master horizontal and vertical pushing.',
    nodes: buildNodeMap(PUSH_TREE_NODES),
    mainPath: PUSH_MAIN_PATH,
  };
}

export function createPullTree(): SkillTree {
  return {
    category: 'pull',
    displayName: 'Pull Mastery',
    description: 'From dead hangs to muscle-ups. Master your bodyweight on the bar.',
    nodes: buildNodeMap(PULL_TREE_NODES),
    mainPath: PULL_MAIN_PATH,
  };
}

export function createLegsTree(): SkillTree {
  return {
    category: 'legs',
    displayName: 'Leg Mastery',
    description: 'From assisted squats to pistol squats. Build real single-leg strength.',
    nodes: buildNodeMap(LEGS_TREE_NODES),
    mainPath: LEGS_MAIN_PATH,
  };
}

export function createCoreTree(): SkillTree {
  return {
    category: 'core',
    displayName: 'Core Mastery',
    description: 'From dead bugs to front levers. Build a core that controls everything.',
    nodes: buildNodeMap(CORE_TREE_NODES),
    mainPath: CORE_MAIN_PATH,
  };
}

export function createFlexibilityTree(): SkillTree {
  return {
    category: 'flexibility',
    displayName: 'Flexibility Mastery',
    description: 'From cat-cow to full splits. Reclaim your body\'s natural range of motion.',
    nodes: buildNodeMap(FLEXIBILITY_TREE_NODES),
    mainPath: FLEXIBILITY_MAIN_PATH,
  };
}

/**
 * Creates ALL skill trees with fresh (unmodified) state.
 * Used when initializing a new user or resetting progress.
 */
export function createAllSkillTrees(): Record<SkillCategory, SkillTree> {
  return {
    push: createPushTree(),
    pull: createPullTree(),
    legs: createLegsTree(),
    core: createCoreTree(),
    flexibility: createFlexibilityTree(),
  };
}

/**
 * Flattens all nodes from all trees into a single Record for cross-tree lookups.
 */
export function flattenAllNodes(
  trees: Record<SkillCategory, SkillTree>
): Record<string, SkillNode> {
  const flat: Record<string, SkillNode> = {};
  for (const tree of Object.values(trees)) {
    for (const [id, node] of Object.entries(tree.nodes)) {
      flat[id] = node;
    }
  }
  return flat;
}

// Re-export individual tree data for direct access
export { PUSH_TREE_NODES, PUSH_MAIN_PATH } from './push';
export { PULL_TREE_NODES, PULL_MAIN_PATH } from './pull';
export { LEGS_TREE_NODES, LEGS_MAIN_PATH } from './legs';
export { CORE_TREE_NODES, CORE_MAIN_PATH } from './core';
export { FLEXIBILITY_TREE_NODES, FLEXIBILITY_MAIN_PATH } from './flexibility';

// ============================================================================
// Relative Strength Calculator — Live Scoring Service
// ============================================================================
// Pulls from the user's skill tree progress and body metrics
// to compute a real-time Relative Strength Score.
//
// The score rewards:
//   - Higher reps/hold times at the SAME bodyweight (efficiency)
//   - Maintaining performance while LOSING weight (getting leaner)
//   - Progressing to harder exercises (weighted by difficulty tier)
//
// The score penalizes (via bodyweight adjustment):
//   - Heavy bodyweight with low rep counts
//   - Stalling on easy exercises
//
// This is the core "Sleeper Build" metric — you look normal, but
// your relative strength score says otherwise.
// ============================================================================

import type {
  RelativeStrengthScore,
  StrengthBreakdown,
  StrengthScoreEntry,
  SkillTree,
  SkillCategory,
} from '../models';
import {
  calculateCategoryScore,
  calculateOverallScore,
  calculateTrend,
  DEFAULT_BENCHMARKS,
  createDefaultStrengthScore,
} from '../models';

// ---------------------------------------------------------------------------
// Category Performance Extraction
// ---------------------------------------------------------------------------

/**
 * Extracts the best raw performance metric for a skill category.
 *
 * Strategy: Uses the HIGHEST TIER exercise the user can perform,
 * weighted by the exercise's position in the skill tree.
 * A person doing 10 pull-ups scores differently than 10 Australian pull-ups.
 *
 * The "equivalent reps at benchmark exercise" formula:
 *   equivalentReps = actualReps × (exerciseDifficultyWeight / benchmarkWeight)
 */
export function extractCategoryPerformance(
  tree: SkillTree,
  benchmarkExerciseId: string
): number {
  const nodes = Object.values(tree.nodes);

  // Find the most advanced exercise the user has performed
  const performedNodes = nodes
    .filter(
      (n) =>
        n.status === 'in_progress' || n.status === 'mastered'
    )
    .filter((n) => n.progress.totalSessions > 0);

  if (performedNodes.length === 0) return 0;

  // Calculate difficulty weight based on position in tree
  // Root nodes = 1.0, each tier deeper = higher weight
  const nodeWeights = calculateNodeWeights(tree);

  // Find benchmark node weight
  const benchmarkWeight = nodeWeights[benchmarkExerciseId] ?? 1.0;

  // Find the best equivalent performance
  let bestEquivalent = 0;

  for (const node of performedNodes) {
    const nodeWeight = nodeWeights[node.id] ?? 1.0;
    const difficultyMultiplier = nodeWeight / benchmarkWeight;

    let rawPerformance: number;
    if (node.exerciseType === 'reps') {
      rawPerformance = node.progress.bestReps;
    } else {
      // For holds: 1 second ≈ 1 rep for scoring purposes
      rawPerformance = node.progress.bestHoldSeconds;
    }

    const equivalent = rawPerformance * difficultyMultiplier;
    bestEquivalent = Math.max(bestEquivalent, equivalent);
  }

  return Math.round(bestEquivalent * 10) / 10;
}

/**
 * Calculates difficulty weights for each node in a skill tree.
 * Uses BFS from root nodes — deeper nodes get higher weights.
 *
 * Weight formula: 1.0 + (depth × 0.5) + (tier × 0.3)
 */
function calculateNodeWeights(tree: SkillTree): Record<string, number> {
  const weights: Record<string, number> = {};
  const nodes = tree.nodes;

  // Find root nodes (no prerequisites)
  const rootIds = Object.keys(nodes).filter(
    (id) => nodes[id].prerequisites.length === 0
  );

  // BFS to calculate depth
  const queue: Array<{ id: string; depth: number }> = rootIds.map((id) => ({
    id,
    depth: 0,
  }));
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);

    const node = nodes[id];
    if (!node) continue;

    weights[id] = 1.0 + depth * 0.5 + node.minimumTier * 0.3;

    // Find children (nodes that have this node as a prerequisite)
    for (const [childId, childNode] of Object.entries(nodes)) {
      if (childNode.prerequisites.some((p) => p.nodeId === id)) {
        queue.push({ id: childId, depth: depth + 1 });
      }
    }
  }

  return weights;
}

// ---------------------------------------------------------------------------
// Full Strength Score Calculation
// ---------------------------------------------------------------------------

/**
 * Calculates the complete Relative Strength Score.
 * This is the main entry point — call this whenever you need the latest score.
 */
export function calculateFullStrengthScore(
  trees: Record<SkillCategory, SkillTree>,
  bodyweightKg: number,
  previousScore: RelativeStrengthScore | null = null
): RelativeStrengthScore {
  if (bodyweightKg <= 0) return createDefaultStrengthScore();

  // Extract performance per category
  const pushPerformance = extractCategoryPerformance(
    trees.push,
    DEFAULT_BENCHMARKS.push.exerciseId
  );
  const pullPerformance = extractCategoryPerformance(
    trees.pull,
    DEFAULT_BENCHMARKS.pull.exerciseId
  );
  const legsPerformance = extractCategoryPerformance(
    trees.legs,
    DEFAULT_BENCHMARKS.legs.exerciseId
  );
  const corePerformance = extractCategoryPerformance(
    trees.core,
    DEFAULT_BENCHMARKS.core.exerciseId
  );
  const flexPerformance = extractCategoryPerformance(
    trees.flexibility,
    DEFAULT_BENCHMARKS.flexibility.exerciseId
  );

  // Calculate per-category 0-100 scores
  const breakdown: StrengthBreakdown = {
    push: calculateCategoryScore(pushPerformance, DEFAULT_BENCHMARKS.push, bodyweightKg),
    pull: calculateCategoryScore(pullPerformance, DEFAULT_BENCHMARKS.pull, bodyweightKg),
    legs: calculateCategoryScore(legsPerformance, DEFAULT_BENCHMARKS.legs, bodyweightKg),
    core: calculateCategoryScore(corePerformance, DEFAULT_BENCHMARKS.core, bodyweightKg),
    flexibility: calculateCategoryScore(flexPerformance, DEFAULT_BENCHMARKS.flexibility, bodyweightKg),
  };

  // Composite score
  const overall = calculateOverallScore(breakdown);

  // Bodyweight ratio
  const totalPerformance =
    pushPerformance + pullPerformance + legsPerformance + corePerformance + flexPerformance;
  const bodyweightRatio =
    bodyweightKg > 0
      ? Math.round((totalPerformance / bodyweightKg) * 100) / 100
      : 0;

  // New history entry
  const today = new Date().toISOString().split('T')[0];
  const newEntry: StrengthScoreEntry = {
    date: today,
    overall,
    weightKg: bodyweightKg,
    bodyweightRatio,
  };

  // Merge with previous history (avoid duplicate entries for same day)
  const previousHistory = previousScore?.history ?? [];
  const filteredHistory = previousHistory.filter((e) => e.date !== today);
  const updatedHistory = [...filteredHistory, newEntry].slice(-365); // Keep 1 year

  // Calculate trend
  const trend = calculateTrend(updatedHistory);

  return {
    overall,
    breakdown,
    bodyweightRatio,
    trend,
    lastCalculated: new Date().toISOString(),
    history: updatedHistory,
  };
}

// ---------------------------------------------------------------------------
// Score Interpretation
// ---------------------------------------------------------------------------

export interface ScoreInterpretation {
  /** Tier label for the overall score */
  tier: string;

  /** Description of what this score means */
  description: string;

  /** Color hex for UI display */
  color: string;

  /** Percentile estimate (vs general population, not gym-goers) */
  estimatedPercentile: number;
}

/**
 * Interprets a strength score into human-readable context.
 */
export function interpretScore(overall: number): ScoreInterpretation {
  if (overall >= 90) {
    return {
      tier: 'Elite',
      description: 'Top 1%. You are the Sleeper. World-class bodyweight control.',
      color: '#F59E0B', // Gold
      estimatedPercentile: 99,
    };
  }
  if (overall >= 75) {
    return {
      tier: 'Advanced',
      description: 'Top 5%. Stronger than most gym-goers, without looking like it.',
      color: '#A855F7', // Purple
      estimatedPercentile: 95,
    };
  }
  if (overall >= 60) {
    return {
      tier: 'Proficient',
      description: 'Top 15%. Solid bodyweight strength. People are starting to notice.',
      color: '#3B82F6', // Blue
      estimatedPercentile: 85,
    };
  }
  if (overall >= 40) {
    return {
      tier: 'Developing',
      description: 'Top 30%. Above average. The fundamentals are solid.',
      color: '#22C55E', // Green
      estimatedPercentile: 70,
    };
  }
  if (overall >= 20) {
    return {
      tier: 'Beginner',
      description: 'Building the foundation. Every rep is progress. Stay consistent.',
      color: '#6B7280', // Grey
      estimatedPercentile: 40,
    };
  }
  return {
    tier: 'Untrained',
    description: 'Just getting started. The best time to plant a tree was 20 years ago. The second best time is now.',
    color: '#6B7280', // Grey
    estimatedPercentile: 15,
  };
}

// ---------------------------------------------------------------------------
// Category Gap Analysis
// ---------------------------------------------------------------------------

export interface CategoryGap {
  category: keyof StrengthBreakdown;
  score: number;
  label: string;
  isStrength: boolean;
  isWeakness: boolean;
  recommendation: string;
}

/**
 * Identifies the user's strongest and weakest categories.
 * Used for targeted training recommendations.
 */
export function analyzeCategoryGaps(
  breakdown: StrengthBreakdown
): CategoryGap[] {
  const categories: Array<keyof StrengthBreakdown> = [
    'push', 'pull', 'legs', 'core', 'flexibility',
  ];

  const avg =
    categories.reduce((sum, cat) => sum + breakdown[cat], 0) / categories.length;

  return categories
    .map((cat) => {
      const score = breakdown[cat];
      const delta = score - avg;
      const isStrength = delta > 10;
      const isWeakness = delta < -10;

      let label: string;
      if (isStrength) label = '💪 Strength';
      else if (isWeakness) label = '⚠️ Weakness';
      else label = '⚖️ Balanced';

      let recommendation: string;
      if (isWeakness) {
        recommendation = `Focus ${cat} training. This is dragging your overall score down by ${Math.abs(Math.round(delta))} points.`;
      } else if (isStrength) {
        recommendation = `Strong ${cat}! Maintain current volume. Consider advanced progressions.`;
      } else {
        recommendation = `${cat.charAt(0).toUpperCase() + cat.slice(1)} is balanced. Keep training consistently.`;
      }

      return { category: cat, score, label, isStrength, isWeakness, recommendation };
    })
    .sort((a, b) => b.score - a.score);
}

// ---------------------------------------------------------------------------
// Weight Impact Analysis
// ---------------------------------------------------------------------------

/**
 * Calculates how a weight change would impact the strength score.
 * Useful for the dashboard: "Losing 5kg would increase your score by X points."
 */
export function simulateWeightChange(
  trees: Record<SkillCategory, SkillTree>,
  currentWeightKg: number,
  targetWeightKg: number,
  previousScore: RelativeStrengthScore | null
): {
  currentScore: number;
  projectedScore: number;
  delta: number;
  message: string;
} {
  const currentResult = calculateFullStrengthScore(trees, currentWeightKg, previousScore);
  const projectedResult = calculateFullStrengthScore(trees, targetWeightKg, null);

  const delta = Math.round((projectedResult.overall - currentResult.overall) * 10) / 10;
  const weightDelta = Math.round((targetWeightKg - currentWeightKg) * 10) / 10;

  let message: string;
  if (delta > 0) {
    message = `Reaching ${targetWeightKg}kg (${weightDelta > 0 ? '+' : ''}${weightDelta}kg) would boost your score by +${delta} points.`;
  } else if (delta < 0) {
    message = `At ${targetWeightKg}kg, your score would decrease by ${delta} points. Focus on maintaining performance.`;
  } else {
    message = `Weight change to ${targetWeightKg}kg would have minimal impact on your score.`;
  }

  return {
    currentScore: currentResult.overall,
    projectedScore: projectedResult.overall,
    delta,
    message,
  };
}

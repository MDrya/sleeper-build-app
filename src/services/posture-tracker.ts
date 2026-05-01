// ============================================================================
// Posture & Decompression Tracker — Spinal Health Service
// ============================================================================
// Tracks daily posture work, spinal decompression habits (dead hangs),
// stretching consistency, and apparent height improvements.
//
// The "Sleeper Build" hidden stat: most people SHRINK as they age.
// Consistent decompression and mobility work can maintain — and even
// GAIN — apparent height through improved posture and disc hydration.
//
// This tracker makes that progress visible and rewarding.
// ============================================================================

import type { PostureDayLog, PostureTask, BodyMetricEntry } from '../models';

// ---------------------------------------------------------------------------
// Posture Score — Daily Health Rating
// ---------------------------------------------------------------------------

export interface PostureScore {
  /** Daily score (0-100) based on task completion and variety */
  daily: number;

  /** Rating label */
  rating: 'neglected' | 'minimal' | 'adequate' | 'excellent' | 'elite';

  /** Number of target areas covered today */
  areasCovered: number;

  /** Total areas possible */
  totalAreas: number;

  /** Total seconds of decompression/stretching today */
  totalSeconds: number;
}

const SCORE_THRESHOLDS = {
  neglected: 0,
  minimal: 20,
  adequate: 50,
  excellent: 75,
  elite: 90,
} as const;

/**
 * Calculates the daily posture score based on completed tasks.
 */
export function calculateDailyPostureScore(
  log: PostureDayLog,
  allTasks: PostureTask[]
): PostureScore {
  if (log.completedTaskIds.length === 0) {
    return {
      daily: 0,
      rating: 'neglected',
      areasCovered: 0,
      totalAreas: 6,
      totalSeconds: 0,
    };
  }

  // Count unique target areas covered
  const completedTasks = allTasks.filter((t) => log.completedTaskIds.includes(t.id));
  const areasCovered = new Set(completedTasks.map((t) => t.targetArea)).size;
  const totalAreas = 6; // spine, shoulders, hips, thoracic, neck, full_body

  // Score components
  const taskCompletionScore = Math.min(100, (log.completedTaskIds.length / 3) * 50); // 3 tasks = 50%
  const areaVarietyScore = (areasCovered / totalAreas) * 30; // Variety up to 30%
  const durationScore = Math.min(20, (log.totalSecondsHeld / 300) * 20); // 5 min = 20%

  const daily = Math.round(taskCompletionScore + areaVarietyScore + durationScore);

  let rating: PostureScore['rating'] = 'neglected';
  if (daily >= SCORE_THRESHOLDS.elite) rating = 'elite';
  else if (daily >= SCORE_THRESHOLDS.excellent) rating = 'excellent';
  else if (daily >= SCORE_THRESHOLDS.adequate) rating = 'adequate';
  else if (daily >= SCORE_THRESHOLDS.minimal) rating = 'minimal';

  return {
    daily,
    rating,
    areasCovered,
    totalAreas,
    totalSeconds: log.totalSecondsHeld,
  };
}

// ---------------------------------------------------------------------------
// Streak Analysis
// ---------------------------------------------------------------------------

export interface PostureStreakAnalysis {
  /** Current consecutive day streak */
  currentStreak: number;

  /** All-time longest streak */
  longestStreak: number;

  /** Whether today counts toward the streak */
  todayCounts: boolean;

  /** Streak status message */
  message: string;

  /** Days until next milestone (7, 14, 30, 60, 90) */
  daysToNextMilestone: number;

  /** Next milestone day count */
  nextMilestone: number;
}

const MILESTONES = [7, 14, 30, 60, 90, 180, 365];

/**
 * Analyzes the posture streak and provides motivational context.
 */
export function analyzePostureStreak(
  currentStreak: number,
  longestStreak: number,
  todayLog: PostureDayLog | null
): PostureStreakAnalysis {
  const todayCounts = todayLog?.countsForStreak ?? false;

  // Find next milestone
  let nextMilestone = MILESTONES[MILESTONES.length - 1];
  for (const m of MILESTONES) {
    if (currentStreak < m) {
      nextMilestone = m;
      break;
    }
  }
  const daysToNextMilestone = nextMilestone - currentStreak;

  // Generate motivational message
  let message: string;
  if (currentStreak === 0) {
    message = 'Start your posture streak today. Your spine will thank you.';
  } else if (currentStreak < 7) {
    message = `${currentStreak} day streak. Building the habit. Keep going.`;
  } else if (currentStreak < 30) {
    message = `${currentStreak} day streak! The habit is forming. Your posture is improving.`;
  } else if (currentStreak < 90) {
    message = `${currentStreak} day streak. This is becoming part of who you are. Remarkable.`;
  } else {
    message = `${currentStreak} day streak. Your spine is healthier than 99% of adults. Sleeper status.`;
  }

  if (!todayCounts && currentStreak > 0) {
    message += ' Complete 2+ posture tasks today to extend your streak.';
  }

  return {
    currentStreak,
    longestStreak,
    todayCounts,
    message,
    daysToNextMilestone,
    nextMilestone,
  };
}

// ---------------------------------------------------------------------------
// Decompression Progress — Height Tracking
// ---------------------------------------------------------------------------

export interface DecompressionProgress {
  /** Starting apparent height (from first measurement) */
  startingHeightCm: number;

  /** Current apparent height (latest measurement) */
  currentHeightCm: number;

  /** Height delta (positive = growth/posture improvement) */
  deltaHeightCm: number;

  /** Whether posture is improving, stable, or declining */
  trend: 'improving' | 'stable' | 'declining';

  /** Estimated height gain from posture work (vs natural variation) */
  estimatedPostureGainCm: number;

  /** Message about progress */
  message: string;
}

/**
 * Analyzes apparent height changes over time to track decompression progress.
 * Most adults can gain 1-3cm of apparent height through consistent
 * decompression (dead hangs), posture correction, and spinal mobility work.
 */
export function analyzeDecompressionProgress(
  bodyHistory: BodyMetricEntry[]
): DecompressionProgress {
  if (bodyHistory.length < 2) {
    const height = bodyHistory[0]?.apparentHeightCm ?? 0;
    return {
      startingHeightCm: height,
      currentHeightCm: height,
      deltaHeightCm: 0,
      trend: 'stable',
      estimatedPostureGainCm: 0,
      message: 'Log more body metrics to track decompression progress.',
    };
  }

  const sorted = [...bodyHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const starting = sorted[0].apparentHeightCm;
  const current = sorted[sorted.length - 1].apparentHeightCm;
  const delta = Math.round((current - starting) * 10) / 10;

  // Trend: compare last 3 vs previous 3 measurements
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (sorted.length >= 6) {
    const recent = sorted.slice(-3);
    const prior = sorted.slice(-6, -3);
    const recentAvg = recent.reduce((s, e) => s + e.apparentHeightCm, 0) / 3;
    const priorAvg = prior.reduce((s, e) => s + e.apparentHeightCm, 0) / 3;
    const trendDelta = recentAvg - priorAvg;

    if (trendDelta > 0.2) trend = 'improving';
    else if (trendDelta < -0.2) trend = 'declining';
  } else if (delta > 0) {
    trend = 'improving';
  } else if (delta < 0) {
    trend = 'declining';
  }

  // Conservative estimate: posture gains are typically 30-60% of total delta
  // (rest is measurement variation)
  const estimatedPostureGainCm =
    delta > 0 ? Math.round(delta * 0.5 * 10) / 10 : 0;

  let message: string;
  if (delta > 1.5) {
    message = `+${delta}cm apparent height gain. Significant posture improvement detected. Your spine is decompressing.`;
  } else if (delta > 0.5) {
    message = `+${delta}cm so far. Your decompression work is paying off. Keep hanging.`;
  } else if (delta > 0) {
    message = `+${delta}cm. Small but measurable improvement. Consistency is key.`;
  } else if (delta === 0) {
    message = 'No change yet. Keep doing dead hangs and mobility work daily.';
  } else {
    message = `${delta}cm. Slight decrease — could be time-of-day variation. Measure in the morning for consistency.`;
  }

  return {
    startingHeightCm: starting,
    currentHeightCm: current,
    deltaHeightCm: delta,
    trend,
    estimatedPostureGainCm,
    message,
  };
}

// ---------------------------------------------------------------------------
// Weekly Posture Report
// ---------------------------------------------------------------------------

export interface WeeklyPostureReport {
  /** Days with posture activity this week */
  activeDays: number;

  /** Total tasks completed this week */
  totalTasksCompleted: number;

  /** Total seconds of decompression/stretching this week */
  totalSeconds: number;

  /** Average daily score this week */
  averageDailyScore: number;

  /** Most consistent target area */
  strongestArea: string | null;

  /** Most neglected target area */
  weakestArea: string | null;

  /** Overall weekly grade */
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

/**
 * Generates a weekly posture report from the last 7 days of logs.
 */
export function generateWeeklyPostureReport(
  logs: PostureDayLog[],
  allTasks: PostureTask[]
): WeeklyPostureReport {
  // Get last 7 days
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekLogs = logs.filter((l) => new Date(l.date) >= weekAgo);

  const activeDays = weekLogs.filter((l) => l.completedTaskIds.length > 0).length;
  const totalTasksCompleted = weekLogs.reduce(
    (sum, l) => sum + l.completedTaskIds.length,
    0
  );
  const totalSeconds = weekLogs.reduce((sum, l) => sum + l.totalSecondsHeld, 0);

  // Calculate average daily score
  let totalScore = 0;
  for (const log of weekLogs) {
    const score = calculateDailyPostureScore(log, allTasks);
    totalScore += score.daily;
  }
  const averageDailyScore =
    weekLogs.length > 0 ? Math.round(totalScore / 7) : 0; // Divide by 7 (including missed days)

  // Find strongest/weakest areas
  const areaCounts: Record<string, number> = {};
  for (const log of weekLogs) {
    for (const taskId of log.completedTaskIds) {
      const task = allTasks.find((t) => t.id === taskId);
      if (task) {
        areaCounts[task.targetArea] = (areaCounts[task.targetArea] || 0) + 1;
      }
    }
  }

  const areaEntries = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]);
  const strongestArea = areaEntries[0]?.[0] ?? null;

  // Find weakest area (present in task pool but not done)
  const allAreas = new Set(allTasks.map((t) => t.targetArea));
  const doneAreas = new Set(Object.keys(areaCounts));
  const missedAreas = [...allAreas].filter((a) => !doneAreas.has(a));
  const weakestArea = missedAreas[0] ?? areaEntries[areaEntries.length - 1]?.[0] ?? null;

  // Grade
  let grade: WeeklyPostureReport['grade'];
  if (activeDays >= 7 && averageDailyScore >= 70) grade = 'A';
  else if (activeDays >= 5 && averageDailyScore >= 50) grade = 'B';
  else if (activeDays >= 3 && averageDailyScore >= 30) grade = 'C';
  else if (activeDays >= 1) grade = 'D';
  else grade = 'F';

  return {
    activeDays,
    totalTasksCompleted,
    totalSeconds,
    averageDailyScore,
    strongestArea,
    weakestArea,
    grade,
  };
}

// ---------------------------------------------------------------------------
// Daily Task Rotation
// ---------------------------------------------------------------------------

/**
 * Selects posture tasks for today, ensuring variety from yesterday.
 * Prioritizes target areas that were missed recently.
 */
export function selectDailyPostureTasks(
  allTasks: PostureTask[],
  recentLogs: PostureDayLog[],
  count: number = 3
): PostureTask[] {
  // Find recently covered areas (last 2 days)
  const recentAreas = new Set<string>();
  const last2Days = recentLogs.slice(-2);
  for (const log of last2Days) {
    for (const taskId of log.completedTaskIds) {
      const task = allTasks.find((t) => t.id === taskId);
      if (task) recentAreas.add(task.targetArea);
    }
  }

  // Prioritize tasks targeting uncovered areas
  const prioritized = allTasks
    .map((task) => ({
      task,
      priority: recentAreas.has(task.targetArea) ? 0 : 1,
    }))
    .sort((a, b) => b.priority - a.priority);

  // Ensure variety — pick from different areas
  const selected: PostureTask[] = [];
  const usedAreas = new Set<string>();

  for (const { task } of prioritized) {
    if (selected.length >= count) break;
    if (!usedAreas.has(task.targetArea)) {
      selected.push(task);
      usedAreas.add(task.targetArea);
    }
  }

  // Fill remaining if needed
  if (selected.length < count) {
    for (const { task } of prioritized) {
      if (selected.length >= count) break;
      if (!selected.find((s) => s.id === task.id)) {
        selected.push(task);
      }
    }
  }

  return selected;
}

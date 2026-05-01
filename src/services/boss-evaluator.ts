// ============================================================================
// Boss Fight Evaluator — Monthly Physical Test Engine
// ============================================================================
// Handles the detailed evaluation of boss fight attempts.
// Goes beyond pass/fail — provides per-exercise analysis, readiness
// assessment, training recommendations, and progress-over-time tracking.
//
// Philosophy: Failing a boss fight is DATA, not defeat.
// The evaluator tells you exactly what to train harder.
// ============================================================================

import type {
  BossChallenge,
  BossChallengeExercise,
  BossFightResult,
} from '../models';

// ---------------------------------------------------------------------------
// Readiness Assessment — Pre-Fight Analysis
// ---------------------------------------------------------------------------

export interface ReadinessAssessment {
  /** Overall readiness (0-100) */
  overallReadiness: number;

  /** Per-exercise readiness */
  exerciseReadiness: ExerciseReadiness[];

  /** Whether the user is likely to pass */
  likelyToPass: boolean;

  /** Recommended training focus areas */
  recommendations: string[];

  /** Estimated weeks of training needed (0 if ready) */
  estimatedWeeksToReady: number;

  /** Summary message */
  message: string;
}

export interface ExerciseReadiness {
  /** Exercise from the boss challenge */
  exercise: BossChallengeExercise;

  /** User's current best performance */
  currentBest: number; // reps or seconds

  /** Required performance */
  required: number; // reps or seconds

  /** Readiness percentage (current / required × 100) */
  readinessPercent: number;

  /** Whether this specific exercise is ready to pass */
  isReady: boolean;

  /** Gap description */
  gap: string;
}

/**
 * Assesses the user's readiness to attempt a boss fight.
 * Pulls from current skill tree progress to compare against requirements.
 */
export function assessReadiness(
  challenge: BossChallenge,
  nodeProgressMap: Record<string, { bestReps: number; bestHoldSeconds: number }>
): ReadinessAssessment {
  const exerciseReadiness: ExerciseReadiness[] = [];
  let totalReadiness = 0;
  const recommendations: string[] = [];

  for (const exercise of challenge.exercises) {
    const progress = nodeProgressMap[exercise.skillNodeId];
    const currentBest = progress
      ? exercise.requiredReps
        ? progress.bestReps
        : progress.bestHoldSeconds
      : 0;
    const required = exercise.requiredReps ?? exercise.requiredHoldSeconds ?? 0;

    const readinessPercent =
      required > 0 ? Math.min(100, Math.round((currentBest / required) * 100)) : 100;

    const isReady = readinessPercent >= 100;

    let gap: string;
    if (isReady) {
      gap = '✓ Ready';
    } else if (readinessPercent >= 75) {
      gap = `Almost there — need ${required - currentBest} more ${exercise.requiredReps ? 'reps' : 'seconds'}`;
    } else if (readinessPercent >= 50) {
      gap = `Getting closer — at ${readinessPercent}% of target`;
    } else if (readinessPercent > 0) {
      gap = `Significant gap — currently at ${readinessPercent}%`;
    } else {
      gap = 'No progress yet — start training this exercise';
    }

    if (!isReady && exercise.isRequired) {
      recommendations.push(
        `Train ${exercise.exerciseName}: need ${required} ${exercise.requiredReps ? 'reps' : 'seconds'}, currently at ${currentBest}`
      );
    }

    exerciseReadiness.push({
      exercise,
      currentBest,
      required,
      readinessPercent,
      isReady,
      gap,
    });

    // Weight required exercises more heavily
    totalReadiness += readinessPercent * (exercise.isRequired ? 1.5 : 0.5);
  }

  const requiredCount = challenge.exercises.filter((e) => e.isRequired).length;
  const optionalCount = challenge.exercises.length - requiredCount;
  const maxScore = requiredCount * 150 + optionalCount * 50;
  const overallReadiness = Math.round((totalReadiness / maxScore) * 100);

  const likelyToPass =
    exerciseReadiness.filter((e) => e.exercise.isRequired && !e.isReady).length === 0;

  // Estimate training time
  const biggestGap = exerciseReadiness
    .filter((e) => e.exercise.isRequired && !e.isReady)
    .sort((a, b) => a.readinessPercent - b.readinessPercent)[0];

  let estimatedWeeksToReady = 0;
  if (biggestGap) {
    const gapPercent = 100 - biggestGap.readinessPercent;
    // Rough estimate: ~10% progress per week with consistent training
    estimatedWeeksToReady = Math.ceil(gapPercent / 10);
  }

  let message: string;
  if (likelyToPass) {
    message = `You're ready to face ${challenge.bossName}. All required exercises are at or above the threshold. Go get it.`;
  } else if (overallReadiness >= 75) {
    message = `Almost ready. ${recommendations.length} exercise(s) need more work. Estimated ${estimatedWeeksToReady} week(s) of focused training.`;
  } else if (overallReadiness >= 50) {
    message = `Making progress, but not ready yet. Focus on: ${recommendations.slice(0, 2).join('; ')}.`;
  } else {
    message = `Significant training needed before this fight. Stay on the current tier and build your foundation.`;
  }

  return {
    overallReadiness,
    exerciseReadiness,
    likelyToPass,
    recommendations,
    estimatedWeeksToReady,
    message,
  };
}

// ---------------------------------------------------------------------------
// Post-Fight Analysis — Detailed Feedback
// ---------------------------------------------------------------------------

export interface PostFightAnalysis {
  /** Overall result */
  passed: boolean;

  /** Total EXP earned */
  expEarned: number;

  /** Time taken vs time limit */
  timeAnalysis: {
    timeTaken: number;
    timeLimit: number;
    timeUsedPercent: number;
    withinLimit: boolean;
  };

  /** Per-exercise breakdown with detailed feedback */
  exerciseAnalysis: ExerciseAnalysis[];

  /** Key strengths demonstrated */
  strengths: string[];

  /** Areas that need improvement */
  weaknesses: string[];

  /** Overall feedback message */
  feedback: string;

  /** Comparison to previous attempts (if any) */
  improvement: AttemptImprovement | null;
}

export interface ExerciseAnalysis {
  exerciseName: string;
  required: number;
  achieved: number;
  unit: 'reps' | 'seconds';
  passed: boolean;
  isRequired: boolean;
  performancePercent: number;
  feedback: string;
}

export interface AttemptImprovement {
  /** Previous attempt date */
  previousDate: string;

  /** Overall improvement description */
  summary: string;

  /** Exercises that improved */
  improved: string[];

  /** Exercises that declined */
  declined: string[];
}

/**
 * Generates a detailed post-fight analysis from a boss fight result.
 */
export function analyzeAttempt(
  challenge: BossChallenge,
  result: BossFightResult,
  previousAttempts: BossFightResult[] = []
): PostFightAnalysis {
  // Time analysis
  const timeAnalysis = {
    timeTaken: result.totalTimeSeconds,
    timeLimit: challenge.timeLimitSeconds,
    timeUsedPercent: Math.round(
      (result.totalTimeSeconds / challenge.timeLimitSeconds) * 100
    ),
    withinLimit: result.totalTimeSeconds <= challenge.timeLimitSeconds,
  };

  // Per-exercise analysis
  const exerciseAnalysis: ExerciseAnalysis[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  for (const challengeExercise of challenge.exercises) {
    const exerciseResult = result.exerciseResults.find(
      (r) => r.skillNodeId === challengeExercise.skillNodeId
    );

    const isRepBased = !!challengeExercise.requiredReps;
    const required = challengeExercise.requiredReps ?? challengeExercise.requiredHoldSeconds ?? 0;
    const achieved = exerciseResult
      ? isRepBased
        ? exerciseResult.achievedReps
        : exerciseResult.achievedHoldSeconds
      : 0;
    const unit: 'reps' | 'seconds' = isRepBased ? 'reps' : 'seconds';
    const passed = exerciseResult?.passed ?? false;
    const performancePercent =
      required > 0 ? Math.round((achieved / required) * 100) : 0;

    let feedback: string;
    if (passed && performancePercent >= 150) {
      feedback = `Dominated. ${achieved}/${required} ${unit} — well beyond the requirement.`;
      strengths.push(challengeExercise.exerciseName);
    } else if (passed) {
      feedback = `Passed. ${achieved}/${required} ${unit}.`;
      if (performancePercent >= 120) strengths.push(challengeExercise.exerciseName);
    } else if (performancePercent >= 80) {
      feedback = `So close! ${achieved}/${required} ${unit}. A few more weeks of training.`;
      weaknesses.push(challengeExercise.exerciseName);
    } else if (performancePercent >= 50) {
      feedback = `${achieved}/${required} ${unit}. Solid effort but needs more work.`;
      weaknesses.push(challengeExercise.exerciseName);
    } else if (achieved > 0) {
      feedback = `${achieved}/${required} ${unit}. Keep training — you'll get there.`;
      weaknesses.push(challengeExercise.exerciseName);
    } else {
      feedback = `Not attempted or unable to perform. Focus training here.`;
      weaknesses.push(challengeExercise.exerciseName);
    }

    exerciseAnalysis.push({
      exerciseName: challengeExercise.exerciseName,
      required,
      achieved,
      unit,
      passed,
      isRequired: challengeExercise.isRequired,
      performancePercent,
      feedback,
    });
  }

  // Comparison to previous attempts
  let improvement: AttemptImprovement | null = null;
  const prevSameChallenge = previousAttempts.filter(
    (a) => a.challengeId === challenge.id
  );

  if (prevSameChallenge.length > 0) {
    const prevAttempt = prevSameChallenge[0]; // Most recent previous
    const improved: string[] = [];
    const declined: string[] = [];

    for (const ex of challenge.exercises) {
      const currentResult = result.exerciseResults.find(
        (r) => r.skillNodeId === ex.skillNodeId
      );
      const prevResult = prevAttempt.exerciseResults.find(
        (r) => r.skillNodeId === ex.skillNodeId
      );

      if (currentResult && prevResult) {
        const isRepBased = !!ex.requiredReps;
        const currentVal = isRepBased
          ? currentResult.achievedReps
          : currentResult.achievedHoldSeconds;
        const prevVal = isRepBased
          ? prevResult.achievedReps
          : prevResult.achievedHoldSeconds;

        if (currentVal > prevVal) improved.push(ex.exerciseName);
        else if (currentVal < prevVal) declined.push(ex.exerciseName);
      }
    }

    improvement = {
      previousDate: prevAttempt.attemptDate,
      summary:
        improved.length > declined.length
          ? `Overall improvement since last attempt on ${prevAttempt.attemptDate.split('T')[0]}.`
          : improved.length === declined.length
            ? 'Mixed results compared to last attempt.'
            : 'Some regression — check recovery and training consistency.',
      improved,
      declined,
    };
  }

  // Overall feedback
  let feedback: string;
  if (result.passed) {
    feedback = `VICTORY. You've defeated ${challenge.bossName}. Welcome to the next tier. ${strengths.length > 0 ? `Strengths: ${strengths.join(', ')}.` : ''}`;
  } else if (timeAnalysis.withinLimit && weaknesses.length <= 1) {
    feedback = `Almost! One exercise held you back: ${weaknesses[0] ?? 'unknown'}. Focused training for 1-2 weeks and try again.`;
  } else if (!timeAnalysis.withinLimit) {
    feedback = `Ran out of time (${Math.round(timeAnalysis.timeTaken / 60)}min / ${Math.round(timeAnalysis.timeLimit / 60)}min). Work on endurance and reduce rest times between sets.`;
  } else {
    feedback = `Not this time. ${weaknesses.length} exercise(s) need more work: ${weaknesses.slice(0, 3).join(', ')}. Train consistently and come back stronger.`;
  }

  return {
    passed: result.passed,
    expEarned: result.expEarned,
    timeAnalysis,
    exerciseAnalysis,
    strengths,
    weaknesses,
    feedback,
    improvement,
  };
}

// ---------------------------------------------------------------------------
// Training Recommendations
// ---------------------------------------------------------------------------

/**
 * Generates specific training recommendations based on a failed boss fight.
 * Returns actionable guidance for the cooldown period.
 */
export function generateTrainingPlan(
  analysis: PostFightAnalysis,
  cooldownDays: number
): string[] {
  const plan: string[] = [];

  if (!analysis.passed) {
    // Focus on failed exercises
    const failedRequired = analysis.exerciseAnalysis.filter(
      (e) => e.isRequired && !e.passed
    );

    for (const exercise of failedRequired) {
      if (exercise.performancePercent >= 80) {
        plan.push(
          `${exercise.exerciseName}: You're close! Add 1-2 ${exercise.unit} per session. Practice daily.`
        );
      } else if (exercise.performancePercent >= 50) {
        plan.push(
          `${exercise.exerciseName}: Train 3-4×/week. Focus on volume — ${Math.ceil(exercise.required * 0.7)} ${exercise.unit} for 3 sets.`
        );
      } else {
        plan.push(
          `${exercise.exerciseName}: Priority training needed. Start with easier progressions and work up. Daily practice.`
        );
      }
    }

    if (!analysis.timeAnalysis.withinLimit) {
      plan.push(
        `Time management: Practice completing all exercises with shorter rest periods (max 60s between sets).`
      );
    }

    plan.push(
      `Cooldown period: ${cooldownDays} days. Use this time to train the weak points above.`
    );
    plan.push(
      `GTG micro-workouts: Accept every Grease the Groove prompt for your weak exercises.`
    );
  }

  return plan;
}

// ---------------------------------------------------------------------------
// Historical Progress Chart Data
// ---------------------------------------------------------------------------

export interface BossProgressPoint {
  date: string;
  overallPercent: number;
  passed: boolean;
}

/**
 * Extracts chart-friendly data from boss fight history for a specific challenge.
 */
export function getBossProgressHistory(
  history: BossFightResult[],
  challengeId: string,
  challenge: BossChallenge
): BossProgressPoint[] {
  return history
    .filter((r) => r.challengeId === challengeId)
    .reverse() // Oldest first
    .map((result) => {
      let totalPercent = 0;
      let count = 0;

      for (const ex of challenge.exercises) {
        const r = result.exerciseResults.find(
          (er) => er.skillNodeId === ex.skillNodeId
        );
        if (r) {
          const required = ex.requiredReps ?? ex.requiredHoldSeconds ?? 1;
          const achieved = ex.requiredReps ? r.achievedReps : r.achievedHoldSeconds;
          totalPercent += Math.min(100, (achieved / required) * 100);
          count++;
        }
      }

      return {
        date: result.attemptDate.split('T')[0],
        overallPercent: count > 0 ? Math.round(totalPercent / count) : 0,
        passed: result.passed,
      };
    });
}

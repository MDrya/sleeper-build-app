// ============================================================================
// Micro-Workout Pool — Grease the Groove
// ============================================================================
// Random, low-intensity prompts triggered throughout the day.
// Philosophy: Frequency > Intensity for CNS adaptation.
// Never go to failure. Just move. Often.
// ============================================================================

import type { MicroWorkoutTemplate } from '../models';

export const MICRO_WORKOUT_POOL: MicroWorkoutTemplate[] = [
  // --- PUSH (Tier 0+) ---
  {
    id: 'gtg_wall_push_10',
    prompt: 'Do 10 wall push-ups. Right now.',
    category: 'push',
    exerciseName: 'Wall Push-up',
    skillNodeId: 'push_wall',
    amount: 10,
    unit: 'reps',
    expReward: 8,
    minimumTier: 0,
    equipment: ['wall'],
  },
  {
    id: 'gtg_push_5',
    prompt: 'Drop and give me 5 push-ups. Slow and controlled.',
    category: 'push',
    exerciseName: 'Standard Push-up',
    skillNodeId: 'push_standard',
    amount: 5,
    unit: 'reps',
    expReward: 12,
    minimumTier: 1,
    equipment: ['none'],
  },
  {
    id: 'gtg_push_10',
    prompt: '10 push-ups. No excuses. Clean reps only.',
    category: 'push',
    exerciseName: 'Standard Push-up',
    skillNodeId: 'push_standard',
    amount: 10,
    unit: 'reps',
    expReward: 15,
    minimumTier: 1,
    equipment: ['none'],
  },
  {
    id: 'gtg_diamond_5',
    prompt: '5 diamond push-ups. Feel the triceps burn.',
    category: 'push',
    exerciseName: 'Diamond Push-up',
    skillNodeId: 'push_diamond',
    amount: 5,
    unit: 'reps',
    expReward: 15,
    minimumTier: 2,
    equipment: ['none'],
  },

  // --- PULL (Tier 0+) ---
  {
    id: 'gtg_dead_hang_15',
    prompt: 'Find a bar. Hang for 15 seconds. Decompress your spine.',
    category: 'pull',
    exerciseName: 'Dead Hang',
    skillNodeId: 'pull_dead_hang',
    amount: 15,
    unit: 'seconds',
    expReward: 8,
    minimumTier: 0,
    equipment: ['bar'],
  },
  {
    id: 'gtg_dead_hang_30',
    prompt: '30-second dead hang. Grip it and breathe.',
    category: 'pull',
    exerciseName: 'Dead Hang',
    skillNodeId: 'pull_dead_hang',
    amount: 30,
    unit: 'seconds',
    expReward: 12,
    minimumTier: 0,
    equipment: ['bar'],
  },
  {
    id: 'gtg_australian_8',
    prompt: 'Find a low bar or table. 8 Australian pull-ups.',
    category: 'pull',
    exerciseName: 'Australian Pull-up',
    skillNodeId: 'pull_australian',
    amount: 8,
    unit: 'reps',
    expReward: 12,
    minimumTier: 1,
    equipment: ['bar'],
  },
  {
    id: 'gtg_pullup_3',
    prompt: '3 perfect pull-ups. Dead hang to chin over bar.',
    category: 'pull',
    exerciseName: 'Pull-up',
    skillNodeId: 'pull_pullup',
    amount: 3,
    unit: 'reps',
    expReward: 18,
    minimumTier: 2,
    equipment: ['bar'],
  },

  // --- LEGS (Tier 0+) ---
  {
    id: 'gtg_squat_10',
    prompt: 'Do 10 deep squats. Full depth. Own the movement.',
    category: 'legs',
    exerciseName: 'Bodyweight Squat',
    skillNodeId: 'legs_squat',
    amount: 10,
    unit: 'reps',
    expReward: 8,
    minimumTier: 0,
    equipment: ['none'],
  },
  {
    id: 'gtg_squat_20',
    prompt: '20 bodyweight squats. Ass to grass. No half reps.',
    category: 'legs',
    exerciseName: 'Bodyweight Squat',
    skillNodeId: 'legs_squat',
    amount: 20,
    unit: 'reps',
    expReward: 12,
    minimumTier: 0,
    equipment: ['none'],
  },
  {
    id: 'gtg_calf_raise_15',
    prompt: '15 calf raises each leg. Use a step for full range.',
    category: 'legs',
    exerciseName: 'Single-Leg Calf Raise',
    skillNodeId: 'legs_calf_raise',
    amount: 15,
    unit: 'reps',
    expReward: 10,
    minimumTier: 0,
    equipment: ['stairs'],
  },
  {
    id: 'gtg_split_squat_8',
    prompt: '8 split squats each leg. Back knee touches the floor.',
    category: 'legs',
    exerciseName: 'Split Squat',
    skillNodeId: 'legs_split_squat',
    amount: 8,
    unit: 'reps',
    expReward: 12,
    minimumTier: 1,
    equipment: ['none'],
  },

  // --- CORE (Tier 0+) ---
  {
    id: 'gtg_plank_30',
    prompt: 'Hold a plank for 30 seconds. Squeeze everything.',
    category: 'core',
    exerciseName: 'Plank Hold',
    skillNodeId: 'core_plank',
    amount: 30,
    unit: 'seconds',
    expReward: 8,
    minimumTier: 0,
    equipment: ['none'],
  },
  {
    id: 'gtg_dead_bug_10',
    prompt: '10 dead bugs. Slow. Lower back glued to the floor.',
    category: 'core',
    exerciseName: 'Dead Bug',
    skillNodeId: 'core_dead_bug',
    amount: 10,
    unit: 'reps',
    expReward: 8,
    minimumTier: 0,
    equipment: ['none'],
  },
  {
    id: 'gtg_hollow_20',
    prompt: '20-second hollow body hold. Arms overhead. No arching.',
    category: 'core',
    exerciseName: 'Hollow Body Hold',
    skillNodeId: 'core_hollow_body',
    amount: 20,
    unit: 'seconds',
    expReward: 12,
    minimumTier: 1,
    equipment: ['none'],
  },

  // --- FLEXIBILITY (Tier 0+) ---
  {
    id: 'gtg_cat_cow_30',
    prompt: '30 seconds of cat-cow. Wake up your spine.',
    category: 'flexibility',
    exerciseName: 'Cat-Cow Flow',
    skillNodeId: 'flex_cat_cow',
    amount: 30,
    unit: 'seconds',
    expReward: 8,
    minimumTier: 0,
    equipment: ['none'],
  },
  {
    id: 'gtg_deep_squat_30',
    prompt: 'Sit in a deep squat for 30 seconds. Breathe. Be human.',
    category: 'flexibility',
    exerciseName: 'Deep Squat Hold',
    skillNodeId: 'flex_deep_squat_hold',
    amount: 30,
    unit: 'seconds',
    expReward: 10,
    minimumTier: 0,
    equipment: ['none'],
  },
  {
    id: 'gtg_pike_30',
    prompt: 'Touch your toes. Hold for 30 seconds. Breathe into it.',
    category: 'flexibility',
    exerciseName: 'Standing Pike Stretch',
    skillNodeId: 'flex_pike',
    amount: 30,
    unit: 'seconds',
    expReward: 10,
    minimumTier: 1,
    equipment: ['none'],
  },
  {
    id: 'gtg_wall_angel_10',
    prompt: '10 wall angels. Stand against a wall, arms in W position, slide up to Y.',
    category: 'flexibility',
    exerciseName: 'Wall Angel',
    skillNodeId: null,
    amount: 10,
    unit: 'reps',
    expReward: 8,
    minimumTier: 0,
    equipment: ['wall'],
  },
];

/**
 * Get micro-workouts available for the user's current tier.
 * Filters out workouts that require higher tier access.
 */
export function getAvailableMicroWorkouts(
  currentTier: number
): MicroWorkoutTemplate[] {
  return MICRO_WORKOUT_POOL.filter((w) => w.minimumTier <= currentTier);
}

/**
 * Pick a random micro-workout from the available pool.
 * Optionally exclude recently used IDs to add variety.
 */
export function pickRandomMicroWorkout(
  currentTier: number,
  excludeIds: string[] = []
): MicroWorkoutTemplate | null {
  const available = getAvailableMicroWorkouts(currentTier).filter(
    (w) => !excludeIds.includes(w.id)
  );

  if (available.length === 0) return null;

  const index = Math.floor(Math.random() * available.length);
  return available[index];
}

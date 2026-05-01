// ============================================================================
// Tier Definitions
// ============================================================================
// The 5 tiers of the Sleeper Build progression system.
// Each tier gates content, skill tree nodes, and micro-workout variety.
//
// Tier 0: Civilian   — You just downloaded the app
// Tier 1: Initiate   — You've proven basic movement competency
// Tier 2: Adept      — You own the fundamentals
// Tier 3: Operator   — You can do things most gym-goers can't
// Tier 4: Sleeper    — You look normal. You are not normal.
// ============================================================================

import type { TierDefinition, BossChallenge } from '../models';

// ---------------------------------------------------------------------------
// Boss Fight Challenges per Tier
// ---------------------------------------------------------------------------

const TIER_1_CHALLENGE: BossChallenge = {
  id: 'boss_tier1',
  targetTier: 1,
  bossName: 'The Gatekeeper',
  flavorText:
    'Before you can walk the path, you must prove you can stand. The Gatekeeper tests your foundation — nothing fancy, just control.',
  exercises: [
    {
      skillNodeId: 'push_wall',
      exerciseName: 'Wall Push-up',
      requiredReps: 30,
      requiredSets: 2,
      maxRestBetweenSets: 60,
      isRequired: true,
    },
    {
      skillNodeId: 'legs_assisted_squat',
      exerciseName: 'Assisted Squat',
      requiredReps: 20,
      requiredSets: 2,
      maxRestBetweenSets: 60,
      isRequired: true,
    },
    {
      skillNodeId: 'pull_dead_hang',
      exerciseName: 'Dead Hang',
      requiredHoldSeconds: 20,
      requiredSets: 2,
      maxRestBetweenSets: 90,
      isRequired: true,
    },
    {
      skillNodeId: 'core_plank',
      exerciseName: 'Plank Hold',
      requiredHoldSeconds: 30,
      requiredSets: 2,
      maxRestBetweenSets: 60,
      isRequired: true,
    },
  ],
  timeLimitSeconds: 900, // 15 minutes
  passExp: 500,
  bonusExerciseExp: 100,
  cooldownDays: 7,
};

const TIER_2_CHALLENGE: BossChallenge = {
  id: 'boss_tier2',
  targetTier: 2,
  bossName: 'The Foundation',
  flavorText:
    'The Foundation doesn\'t test strength — it tests consistency. Can you perform the basics with control and endurance? Prove it.',
  exercises: [
    {
      skillNodeId: 'push_standard',
      exerciseName: 'Standard Push-up',
      requiredReps: 15,
      requiredSets: 3,
      maxRestBetweenSets: 60,
      isRequired: true,
    },
    {
      skillNodeId: 'legs_squat',
      exerciseName: 'Bodyweight Squat',
      requiredReps: 25,
      requiredSets: 3,
      maxRestBetweenSets: 60,
      isRequired: true,
    },
    {
      skillNodeId: 'pull_dead_hang',
      exerciseName: 'Dead Hang',
      requiredHoldSeconds: 60,
      requiredSets: 1,
      maxRestBetweenSets: 0,
      isRequired: true,
    },
    {
      skillNodeId: 'core_plank',
      exerciseName: 'Plank Hold',
      requiredHoldSeconds: 60,
      requiredSets: 2,
      maxRestBetweenSets: 45,
      isRequired: true,
    },
    {
      skillNodeId: 'pull_australian',
      exerciseName: 'Australian Pull-up (Inverted Row)',
      requiredReps: 10,
      requiredSets: 2,
      maxRestBetweenSets: 60,
      isRequired: false, // Bonus
    },
  ],
  timeLimitSeconds: 1200, // 20 minutes
  passExp: 1200,
  bonusExerciseExp: 250,
  cooldownDays: 14,
};

const TIER_3_CHALLENGE: BossChallenge = {
  id: 'boss_tier3',
  targetTier: 3,
  bossName: 'The Shadow',
  flavorText:
    'The Shadow moves without sound, strikes without warning. To become an Operator, you must demonstrate strength that doesn\'t advertise itself.',
  exercises: [
    {
      skillNodeId: 'push_diamond',
      exerciseName: 'Diamond Push-up',
      requiredReps: 15,
      requiredSets: 3,
      maxRestBetweenSets: 45,
      isRequired: true,
    },
    {
      skillNodeId: 'pull_pullup',
      exerciseName: 'Pull-up',
      requiredReps: 10,
      requiredSets: 3,
      maxRestBetweenSets: 90,
      isRequired: true,
    },
    {
      skillNodeId: 'legs_pistol',
      exerciseName: 'Pistol Squat (each leg)',
      requiredReps: 5,
      requiredSets: 2,
      maxRestBetweenSets: 60,
      isRequired: true,
    },
    {
      skillNodeId: 'core_lsit',
      exerciseName: 'L-Sit Hold',
      requiredHoldSeconds: 15,
      requiredSets: 3,
      maxRestBetweenSets: 60,
      isRequired: true,
    },
    {
      skillNodeId: 'pull_dead_hang',
      exerciseName: 'Dead Hang',
      requiredHoldSeconds: 90,
      requiredSets: 1,
      maxRestBetweenSets: 0,
      isRequired: false, // Bonus
    },
    {
      skillNodeId: 'flex_pike',
      exerciseName: 'Pike Stretch (palms to floor)',
      requiredHoldSeconds: 30,
      requiredSets: 1,
      maxRestBetweenSets: 0,
      isRequired: false, // Bonus
    },
  ],
  timeLimitSeconds: 1500, // 25 minutes
  passExp: 3000,
  bonusExerciseExp: 500,
  cooldownDays: 21,
};

const TIER_4_CHALLENGE: BossChallenge = {
  id: 'boss_tier4',
  targetTier: 4,
  bossName: 'Anatoly',
  flavorText:
    'He walks into the gym in jeans and a polo. People smirk. Then he casually muscle-ups onto the bar, holds a front lever, and walks away. You want to be him? Prove it.',
  exercises: [
    {
      skillNodeId: 'pull_muscle_up',
      exerciseName: 'Muscle-Up',
      requiredReps: 3,
      requiredSets: 2,
      maxRestBetweenSets: 120,
      isRequired: true,
    },
    {
      skillNodeId: 'push_archer',
      exerciseName: 'Archer Push-up',
      requiredReps: 10,
      requiredSets: 3,
      maxRestBetweenSets: 60,
      isRequired: true,
    },
    {
      skillNodeId: 'legs_pistol',
      exerciseName: 'Pistol Squat (each leg)',
      requiredReps: 10,
      requiredSets: 3,
      maxRestBetweenSets: 45,
      isRequired: true,
    },
    {
      skillNodeId: 'core_front_lever',
      exerciseName: 'Front Lever Hold',
      requiredHoldSeconds: 10,
      requiredSets: 2,
      maxRestBetweenSets: 120,
      isRequired: true,
    },
    {
      skillNodeId: 'pull_dead_hang',
      exerciseName: 'Dead Hang',
      requiredHoldSeconds: 120,
      requiredSets: 1,
      maxRestBetweenSets: 0,
      isRequired: true,
    },
    {
      skillNodeId: 'push_handstand',
      exerciseName: 'Wall Handstand Hold',
      requiredHoldSeconds: 30,
      requiredSets: 2,
      maxRestBetweenSets: 90,
      isRequired: false, // Bonus — true balance mastery
    },
    {
      skillNodeId: 'flex_full_bridge',
      exerciseName: 'Full Bridge Hold',
      requiredHoldSeconds: 30,
      requiredSets: 1,
      maxRestBetweenSets: 0,
      isRequired: false, // Bonus — flexibility elite
    },
  ],
  timeLimitSeconds: 1800, // 30 minutes
  passExp: 8000,
  bonusExerciseExp: 1000,
  cooldownDays: 30,
};

// ---------------------------------------------------------------------------
// Tier Definitions
// ---------------------------------------------------------------------------

export const TIER_DEFINITIONS: TierDefinition[] = [
  {
    tier: 0,
    name: 'Civilian',
    title: 'Tier 0 — Civilian',
    description:
      'Uncalibrated. You haven\'t proven anything yet. Complete the baseline calibration to begin your journey.',
    minimumLevel: 1,
    bossChallenge: null, // Starting tier — no challenge
    color: '#6B7280', // Slate grey
  },
  {
    tier: 1,
    name: 'Initiate',
    title: 'Tier 1 — Initiate',
    description:
      'You\'ve learned to move. Basic patterns are locked in. The journey of a thousand reps begins with a single wall push-up.',
    minimumLevel: 5,
    bossChallenge: TIER_1_CHALLENGE,
    color: '#22C55E', // Green
  },
  {
    tier: 2,
    name: 'Adept',
    title: 'Tier 2 — Adept',
    description:
      'The fundamentals are yours. Push-ups, pull-ups, squats — no longer challenging, now just part of who you are.',
    minimumLevel: 15,
    bossChallenge: TIER_2_CHALLENGE,
    color: '#3B82F6', // Blue
  },
  {
    tier: 3,
    name: 'Operator',
    title: 'Tier 3 — Operator',
    description:
      'You can do things most people in the gym cannot. Pistol squats, muscle-ups, L-sits. You don\'t look the part. That\'s the point.',
    minimumLevel: 30,
    bossChallenge: TIER_3_CHALLENGE,
    color: '#A855F7', // Purple
  },
  {
    tier: 4,
    name: 'Sleeper',
    title: 'Tier 4 — Sleeper',
    description:
      'The final form. You walk in looking average. You are anything but. Front levers, muscle-ups, one-arm movements — effortless. You are the Sleeper.',
    minimumLevel: 50,
    bossChallenge: TIER_4_CHALLENGE,
    color: '#F59E0B', // Gold
  },
];

/**
 * Get a tier definition by tier number.
 */
export function getTierDefinition(tier: number): TierDefinition | undefined {
  return TIER_DEFINITIONS.find((t) => t.tier === tier);
}

/**
 * Get the next tier's definition (for "next boss fight" display).
 * Returns undefined if the user is already at max tier.
 */
export function getNextTierDefinition(
  currentTier: number
): TierDefinition | undefined {
  return TIER_DEFINITIONS.find((t) => t.tier === currentTier + 1);
}

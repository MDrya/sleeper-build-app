// ============================================================================
// Core Skill Tree — Stability to Front Lever
// ============================================================================
// Dead Bug → Plank → Side Plank → Hollow Body → Hanging Knee Raise
// → L-Sit → Hanging Leg Raise → Dragon Flag → Front Lever
// Equipment: floor, bar
// ============================================================================

import type { SkillNode } from '../../models';
import { createDefaultProgress } from '../../models';

export const CORE_TREE_NODES: SkillNode[] = [
  {
    id: 'core_dead_bug',
    name: 'Dead Bug',
    description:
      'Lie on your back, arms up, knees at 90°. Extend opposite arm and leg while keeping lower back pressed into the floor. The ultimate core activation exercise — looks easy, humbles everyone.',
    category: 'core',
    exerciseType: 'reps',
    minimumTier: 0,
    equipment: ['none'],
    formCues: ['lower back to floor', 'opposite arm/leg', 'slow and controlled', 'breathe out on extension'],
    prerequisites: [],
    masteryThreshold: { sets: 3, reps: 20, consecutiveDays: 3 },
    expPerSet: 10,
    masteryBonusExp: 150,
    status: 'unlocked',
    progress: createDefaultProgress(),
  },
  {
    id: 'core_plank',
    name: 'Plank Hold',
    description:
      'Forearms on floor, body straight as a board. Don\'t let your hips sag or pike. This builds isometric endurance in the entire core. The foundation of everything.',
    category: 'core',
    exerciseType: 'hold',
    minimumTier: 0,
    equipment: ['none'],
    formCues: ['straight line head to heels', 'squeeze glutes', 'brace core', 'breathe steadily'],
    prerequisites: [{ nodeId: 'core_dead_bug', requireMastery: true }],
    masteryThreshold: { sets: 3, holdSeconds: 60, consecutiveDays: 3 },
    expPerSet: 12,
    masteryBonusExp: 200,
    status: 'locked',
    progress: createDefaultProgress(),
  },
  {
    id: 'core_side_plank',
    name: 'Side Plank Hold',
    description:
      'On one forearm, body straight, hips stacked. Targets obliques and lateral stability. Both sides equally — no imbalances.',
    category: 'core',
    exerciseType: 'hold',
    minimumTier: 1,
    equipment: ['none'],
    formCues: ['hips stacked', 'straight line', 'top arm on hip or extended', 'both sides'],
    prerequisites: [{ nodeId: 'core_plank', requireMastery: true }],
    masteryThreshold: { sets: 2, holdSeconds: 45, consecutiveDays: 3 },
    expPerSet: 15,
    masteryBonusExp: 250,
    status: 'locked',
    progress: createDefaultProgress(),
  },
  {
    id: 'core_hollow_body',
    name: 'Hollow Body Hold',
    description:
      'Lie on back. Arms overhead, legs extended, lift both off the ground. Press lower back into floor. This is what gymnasts use — the foundation of L-sits and levers.',
    category: 'core',
    exerciseType: 'hold',
    minimumTier: 1,
    equipment: ['none'],
    formCues: ['lower back to floor', 'arms overhead', 'legs straight', 'toes pointed', 'no arch'],
    prerequisites: [{ nodeId: 'core_plank', requireMastery: true }],
    masteryThreshold: { sets: 3, holdSeconds: 30, consecutiveDays: 5 },
    expPerSet: 18,
    masteryBonusExp: 350,
    status: 'locked',
    progress: createDefaultProgress(),
  },
  {
    id: 'core_hanging_knee_raise',
    name: 'Hanging Knee Raise',
    description:
      'Hang from a bar. Raise knees to chest. Lower with control. No swinging. Combines grip endurance with core compression strength.',
    category: 'core',
    exerciseType: 'reps',
    minimumTier: 1,
    equipment: ['bar'],
    formCues: ['dead hang start', 'knees to chest', 'no swinging', 'controlled descent'],
    prerequisites: [{ nodeId: 'core_plank', requireMastery: true }],
    masteryThreshold: { sets: 3, reps: 15, consecutiveDays: 3 },
    expPerSet: 18,
    masteryBonusExp: 350,
    status: 'locked',
    progress: createDefaultProgress(),
  },
  {
    id: 'core_lsit',
    name: 'L-Sit Hold',
    description:
      'Support yourself on parallel bars, dip bars, or the floor with straight arms. Lift legs to 90° (L-position) and hold. Requires core compression strength, hip flexor endurance, and tricep lockout. A true test.',
    category: 'core',
    exerciseType: 'hold',
    minimumTier: 2,
    equipment: ['bar'],
    formCues: ['locked arms', 'legs at 90°', 'toes pointed', 'shoulders down', 'breathe'],
    prerequisites: [
      { nodeId: 'core_hollow_body', requireMastery: true },
      { nodeId: 'core_hanging_knee_raise', requireMastery: true },
    ],
    masteryThreshold: { sets: 3, holdSeconds: 15, consecutiveDays: 5 },
    expPerSet: 25,
    masteryBonusExp: 600,
    status: 'locked',
    progress: createDefaultProgress(),
  },
  {
    id: 'core_hanging_leg_raise',
    name: 'Hanging Leg Raise',
    description:
      'Hang from a bar. Raise STRAIGHT legs to 90° or higher. The strict version — no kipping, no momentum. Your abs will shake.',
    category: 'core',
    exerciseType: 'reps',
    minimumTier: 2,
    equipment: ['bar'],
    formCues: ['straight legs', 'toes to bar if possible', 'no swinging', 'slow descent'],
    prerequisites: [{ nodeId: 'core_hanging_knee_raise', requireMastery: true }],
    masteryThreshold: { sets: 3, reps: 10, consecutiveDays: 5 },
    expPerSet: 25,
    masteryBonusExp: 600,
    status: 'locked',
    progress: createDefaultProgress(),
  },
  {
    id: 'core_dragon_flag',
    name: 'Dragon Flag',
    description:
      'Lie on a bench, grip behind your head. Lift your ENTIRE body off the bench (only upper back/shoulders touching), lower as a rigid plank. Bruce Lee\'s signature move. Pure core devastation.',
    category: 'core',
    exerciseType: 'reps',
    minimumTier: 3,
    equipment: ['elevated_surface'],
    formCues: ['only upper back contacts bench', 'rigid body line', 'slow negative', 'no hip bend'],
    prerequisites: [
      { nodeId: 'core_lsit', requireMastery: true },
      { nodeId: 'core_hanging_leg_raise', requireMastery: true },
    ],
    masteryThreshold: { sets: 3, reps: 5, consecutiveDays: 5 },
    expPerSet: 35,
    masteryBonusExp: 1000,
    status: 'locked',
    progress: createDefaultProgress(),
  },
  {
    id: 'core_front_lever',
    name: 'Front Lever Hold',
    description:
      'Hang from a bar. Raise your body to HORIZONTAL, face up, arms straight. Hold. Your body is parallel to the ground, suspended by grip and core alone. The ultimate display of relative strength. Sleeper territory.',
    category: 'core',
    exerciseType: 'hold',
    minimumTier: 4,
    equipment: ['bar'],
    formCues: ['body horizontal', 'arms straight', 'depressed scapulae', 'full body tension', 'breathe'],
    prerequisites: [{ nodeId: 'core_dragon_flag', requireMastery: true }],
    masteryThreshold: { sets: 3, holdSeconds: 10, consecutiveDays: 5 },
    expPerSet: 50,
    masteryBonusExp: 2000,
    status: 'locked',
    progress: createDefaultProgress(),
  },
];

export const CORE_MAIN_PATH = [
  'core_dead_bug',
  'core_plank',
  'core_hollow_body',
  'core_lsit',
  'core_dragon_flag',
  'core_front_lever',
];

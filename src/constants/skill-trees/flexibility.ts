// ============================================================================
// Flexibility Skill Tree — Mobility & Movement Freedom
// ============================================================================
// Cat-Cow → Pike → Pancake → Bridge → Full Bridge → Front Split → Full Split
// Equipment: none (floor only)
// Philosophy: Flexibility IS strength in ranges your body forgot.
// A flexible body is a resilient body. MovementbyDavid knows this.
// ============================================================================

import type { SkillNode } from '../../models';
import { createDefaultProgress } from '../../models';

export const FLEXIBILITY_TREE_NODES: SkillNode[] = [
  {
    id: 'flex_cat_cow',
    name: 'Cat-Cow Flow',
    description:
      'On hands and knees, alternate between arching (cow) and rounding (cat) your spine. The most basic spinal mobility drill — should be done DAILY. Wakes up your spine and decompresses after sitting.',
    category: 'flexibility',
    exerciseType: 'flow',
    minimumTier: 0,
    equipment: ['none'],
    formCues: ['full arch and round', 'breathe with movement', 'slow and fluid', 'feel each vertebra'],
    prerequisites: [],
    masteryThreshold: { sets: 3, durationSeconds: 60, consecutiveDays: 5 },
    expPerSet: 8,
    masteryBonusExp: 100,
    status: 'unlocked',
    progress: createDefaultProgress(),
  },
  {
    id: 'flex_downward_dog',
    name: 'Downward Dog Hold',
    description:
      'Inverted V — hands and feet on floor, hips high. Press chest toward thighs, heels toward floor. Stretches hamstrings, calves, shoulders, and decompresses the spine all at once.',
    category: 'flexibility',
    exerciseType: 'hold',
    minimumTier: 0,
    equipment: ['none'],
    formCues: ['press chest through arms', 'heels toward floor', 'straight arms', 'relax neck'],
    prerequisites: [{ nodeId: 'flex_cat_cow', requireMastery: true }],
    masteryThreshold: { sets: 3, holdSeconds: 45, consecutiveDays: 3 },
    expPerSet: 10,
    masteryBonusExp: 150,
    status: 'locked',
    progress: createDefaultProgress(),
  },
  {
    id: 'flex_pike',
    name: 'Standing Pike Stretch',
    description:
      'Standing, fold forward, reach for toes (then palms to floor). Keep legs straight. This is the benchmark flexibility test — if your palms touch the floor with straight legs, you have solid hamstring flexibility.',
    category: 'flexibility',
    exerciseType: 'hold',
    minimumTier: 1,
    equipment: ['none'],
    formCues: ['straight legs', 'fold from hips', 'relax neck', 'breathe into stretch', 'hold, don\'t bounce'],
    prerequisites: [{ nodeId: 'flex_downward_dog', requireMastery: true }],
    masteryThreshold: { sets: 3, holdSeconds: 60, consecutiveDays: 5 },
    expPerSet: 12,
    masteryBonusExp: 250,
    status: 'locked',
    progress: createDefaultProgress(),
  },
  {
    id: 'flex_deep_squat_hold',
    name: 'Deep Squat Hold',
    description:
      'Sit in a full deep squat — heels flat, chest up. Hold. This is the resting position of most humans on earth outside the Western world. Reclaim it. Builds ankle, hip, and thoracic mobility.',
    category: 'flexibility',
    exerciseType: 'hold',
    minimumTier: 1,
    equipment: ['none'],
    formCues: ['heels flat', 'chest up', 'elbows press knees out', 'breathe deeply', 'relax'],
    prerequisites: [{ nodeId: 'flex_cat_cow', requireMastery: true }],
    masteryThreshold: { sets: 3, holdSeconds: 60, consecutiveDays: 5 },
    expPerSet: 12,
    masteryBonusExp: 250,
    status: 'locked',
    progress: createDefaultProgress(),
  },
  {
    id: 'flex_pancake',
    name: 'Pancake Stretch',
    description:
      'Seated, legs spread wide, fold forward trying to get chest to floor. Extreme adductor and hamstring flexibility. The gateway to side splits.',
    category: 'flexibility',
    exerciseType: 'hold',
    minimumTier: 2,
    equipment: ['none'],
    formCues: ['legs wide', 'fold from hips', 'chest toward floor', 'breathe into it', 'no bouncing'],
    prerequisites: [{ nodeId: 'flex_pike', requireMastery: true }],
    masteryThreshold: { sets: 3, holdSeconds: 60, consecutiveDays: 5 },
    expPerSet: 15,
    masteryBonusExp: 400,
    status: 'locked',
    progress: createDefaultProgress(),
  },
  {
    id: 'flex_bridge',
    name: 'Glute Bridge Hold',
    description:
      'Lying on back, feet flat, push hips to ceiling. Squeeze glutes hard at top. Builds hip extension strength and counteracts sitting all day. The precursor to the full bridge.',
    category: 'flexibility',
    exerciseType: 'hold',
    minimumTier: 1,
    equipment: ['none'],
    formCues: ['squeeze glutes at top', 'feet flat', 'straight line from shoulders to knees', 'hold'],
    prerequisites: [{ nodeId: 'flex_cat_cow', requireMastery: true }],
    masteryThreshold: { sets: 3, holdSeconds: 30, consecutiveDays: 3 },
    expPerSet: 10,
    masteryBonusExp: 200,
    status: 'locked',
    progress: createDefaultProgress(),
  },
  {
    id: 'flex_full_bridge',
    name: 'Full Bridge Hold',
    description:
      'Hands and feet on floor, push body into an arch. Full back bend. Requires shoulder, thoracic, and hip flexibility all at once. If you can hold this for 30s, your spine is healthier than 95% of adults.',
    category: 'flexibility',
    exerciseType: 'hold',
    minimumTier: 3,
    equipment: ['none'],
    formCues: ['arms straight', 'push hips high', 'head neutral', 'breathe steadily', 'feet flat if possible'],
    prerequisites: [
      { nodeId: 'flex_bridge', requireMastery: true },
      { nodeId: 'flex_pike', requireMastery: true },
    ],
    masteryThreshold: { sets: 3, holdSeconds: 30, consecutiveDays: 5 },
    expPerSet: 25,
    masteryBonusExp: 800,
    status: 'locked',
    progress: createDefaultProgress(),
  },
  {
    id: 'flex_front_split',
    name: 'Front Split (each leg)',
    description:
      'One leg forward, one back, hips square to the floor. Work toward the floor over weeks and months. Patience and consistency, not force. The mark of true lower body freedom.',
    category: 'flexibility',
    exerciseType: 'hold',
    minimumTier: 3,
    equipment: ['none'],
    formCues: ['hips square', 'back leg straight', 'ease into it', 'breathe and relax', 'both sides'],
    prerequisites: [{ nodeId: 'flex_pancake', requireMastery: true }],
    masteryThreshold: { sets: 2, holdSeconds: 60, consecutiveDays: 5 },
    expPerSet: 30,
    masteryBonusExp: 1000,
    status: 'locked',
    progress: createDefaultProgress(),
  },
  {
    id: 'flex_middle_split',
    name: 'Middle Split',
    description:
      'Legs spread to the sides, working toward the floor. The ultimate test of hip adductor flexibility. Combined with the front split and full bridge, this represents complete movement freedom.',
    category: 'flexibility',
    exerciseType: 'hold',
    minimumTier: 4,
    equipment: ['none'],
    formCues: ['toes pointed up', 'ease into position', 'support with hands', 'breathe and relax', 'never force'],
    prerequisites: [
      { nodeId: 'flex_front_split', requireMastery: true },
      { nodeId: 'flex_full_bridge', requireMastery: true },
    ],
    masteryThreshold: { sets: 2, holdSeconds: 60, consecutiveDays: 5 },
    expPerSet: 40,
    masteryBonusExp: 1500,
    status: 'locked',
    progress: createDefaultProgress(),
  },
];

export const FLEXIBILITY_MAIN_PATH = [
  'flex_cat_cow',
  'flex_downward_dog',
  'flex_pike',
  'flex_pancake',
  'flex_front_split',
  'flex_middle_split',
];

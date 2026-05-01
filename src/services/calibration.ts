// ============================================================================
// Baseline Calibration — Initial Body Assessment
// ============================================================================
// Runs during onboarding (Tier 0 → Tier 0 calibrated).
// Takes: height, weight, age, gender, activity level
// Produces: ideal target weight, BMR, TDEE, BMI
//
// Formulas used:
//   BMR: Mifflin-St Jeor (most accurate for general population)
//   TDEE: BMR × activity multiplier
//   Ideal Weight: Devine formula (adjusted)
//   BMI: standard formula
// ============================================================================

import type { Gender, ActivityLevel, BodyMetrics } from '../models';

// ---------------------------------------------------------------------------
// Activity Level Multipliers (for TDEE)
// ---------------------------------------------------------------------------

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// ---------------------------------------------------------------------------
// BMR — Basal Metabolic Rate (Mifflin-St Jeor)
// ---------------------------------------------------------------------------

/**
 * Calculates BMR using the Mifflin-St Jeor equation.
 * More accurate than Harris-Benedict for modern populations.
 *
 * Male:   BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
 * Female: BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  gender: Gender
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;

  switch (gender) {
    case 'male':
      return Math.round(base + 5);
    case 'female':
      return Math.round(base - 161);
    case 'other':
      // Average of male and female for non-binary users
      return Math.round(base - 78);
  }
}

// ---------------------------------------------------------------------------
// TDEE — Total Daily Energy Expenditure
// ---------------------------------------------------------------------------

/**
 * Calculates daily maintenance calories (TDEE).
 * TDEE = BMR × activity multiplier
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

// ---------------------------------------------------------------------------
// Ideal Target Weight — Devine Formula (Modified)
// ---------------------------------------------------------------------------

/**
 * Calculates ideal body weight using the Devine formula.
 * This gives a RANGE, we return the midpoint.
 *
 * Male:   50 + 2.3 × (height_inches - 60)
 * Female: 45.5 + 2.3 × (height_inches - 60)
 *
 * Modified: We use the midpoint and add a ±5kg tolerance band
 * since "ideal weight" varies significantly by body composition.
 *
 * For the Sleeper Build philosophy, the ideal weight is where your
 * relative strength ratio is maximized — strong but not heavy.
 */
export function calculateIdealWeight(
  heightCm: number,
  gender: Gender
): { idealKg: number; rangeLowKg: number; rangeHighKg: number } {
  const heightInches = heightCm / 2.54;
  const heightAbove5ft = Math.max(0, heightInches - 60);

  let baseIdeal: number;
  switch (gender) {
    case 'male':
      baseIdeal = 50 + 2.3 * heightAbove5ft;
      break;
    case 'female':
      baseIdeal = 45.5 + 2.3 * heightAbove5ft;
      break;
    case 'other':
      baseIdeal = 47.75 + 2.3 * heightAbove5ft;
      break;
  }

  return {
    idealKg: Math.round(baseIdeal * 10) / 10,
    rangeLowKg: Math.round((baseIdeal - 5) * 10) / 10,
    rangeHighKg: Math.round((baseIdeal + 5) * 10) / 10,
  };
}

// ---------------------------------------------------------------------------
// BMI
// ---------------------------------------------------------------------------

/**
 * Calculates BMI (Body Mass Index).
 * BMI = weight_kg / (height_m)²
 *
 * Note: BMI is a rough population-level metric. For the Sleeper Build,
 * Relative Strength Score is far more meaningful. We track BMI because
 * users expect it, but de-emphasize it in the UI.
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

// ---------------------------------------------------------------------------
// Full Calibration
// ---------------------------------------------------------------------------

export interface CalibrationInput {
  heightCm: number;
  weightKg: number;
  ageYears: number;
  gender: Gender;
  activityLevel: ActivityLevel;
}

export interface CalibrationResult {
  bodyMetrics: BodyMetrics;
  bmr: number;
  tdee: number;
  idealWeight: { idealKg: number; rangeLowKg: number; rangeHighKg: number };
  bmi: number;
}

/**
 * Runs the full baseline calibration.
 * Called once during onboarding. Results populate the user's BodyMetrics.
 */
export function runCalibration(input: CalibrationInput): CalibrationResult {
  const bmr = calculateBMR(input.weightKg, input.heightCm, input.ageYears, input.gender);
  const tdee = calculateTDEE(bmr, input.activityLevel);
  const idealWeight = calculateIdealWeight(input.heightCm, input.gender);
  const bmi = calculateBMI(input.weightKg, input.heightCm);

  const today = new Date().toISOString().split('T')[0];

  const bodyMetrics: BodyMetrics = {
    baseHeightCm: input.heightCm,
    currentWeightKg: input.weightKg,
    currentApparentHeightCm: input.heightCm, // Starts equal to base; improves with posture work
    idealTargetWeightKg: idealWeight.idealKg,
    dailyMaintenanceCalories: tdee,
    bmi,
    history: [
      {
        date: today,
        weightKg: input.weightKg,
        apparentHeightCm: input.heightCm,
      },
    ],
  };

  return { bodyMetrics, bmr, tdee, idealWeight, bmi };
}

/**
 * Calculates age from a date of birth string (YYYY-MM-DD).
 */
export function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

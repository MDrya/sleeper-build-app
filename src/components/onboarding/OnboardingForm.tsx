// ============================================================================
// Onboarding Form — User Calibration Input
// ============================================================================

import { useState } from 'react';
import { useUserStore } from '../../stores/useUserStore';
import { useSkillTreeStore } from '../../stores/useSkillTreeStore';
import type { Gender, ActivityLevel } from '../../models';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Desk job, no exercise' },
  { value: 'light', label: 'Light', desc: '1-2 days/week light activity' },
  { value: 'moderate', label: 'Moderate', desc: '3-5 days/week moderate exercise' },
  { value: 'active', label: 'Active', desc: '6-7 days/week hard exercise' },
  { value: 'very_active', label: 'Very Active', desc: 'Athlete / physical job' },
];

export function OnboardingForm() {
  const createUser = useUserStore((s) => s.createUser);
  const calibrate = useUserStore((s) => s.calibrate);
  const initTrees = useSkillTreeStore((s) => s.initializeTrees);

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');

  const handleSubmit = () => {
    const name = displayName.trim() || 'Sleeper';
    const height = parseFloat(heightCm);
    const weight = parseFloat(weightKg);

    if (!height || !weight || !dateOfBirth) return;

    createUser(name);
    calibrate(height, weight, dateOfBirth, gender, activityLevel);
    initTrees();
  };

  const canProceed = () => {
    switch (step) {
      case 0: return displayName.trim().length > 0;
      case 1: return parseFloat(heightCm) > 0 && parseFloat(weightKg) > 0;
      case 2: return dateOfBirth.length > 0;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="onboarding">
      <div className="onboarding__container">
        {/* Progress dots */}
        <div className="onboarding__progress">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`onboarding__dot ${i === step ? 'onboarding__dot--active' : ''} ${i < step ? 'onboarding__dot--done' : ''}`}
            />
          ))}
        </div>

        {/* Step 0: Name */}
        {step === 0 && (
          <div className="onboarding__step">
            <div className="onboarding__emoji">🥷</div>
            <h1 className="onboarding__title">What should we call you?</h1>
            <p className="onboarding__desc">This is your codename. Choose wisely.</p>
            <input
              type="text"
              className="onboarding__input"
              placeholder="Enter your name..."
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canProceed() && setStep(1)}
              autoFocus
            />
          </div>
        )}

        {/* Step 1: Height & Weight */}
        {step === 1 && (
          <div className="onboarding__step">
            <div className="onboarding__emoji">📏</div>
            <h1 className="onboarding__title">Body Metrics</h1>
            <p className="onboarding__desc">We need these to calculate your relative strength score. Be honest — this is for you, not Instagram.</p>
            <div className="onboarding__row">
              <div className="onboarding__field">
                <label className="onboarding__label">Height (cm)</label>
                <input
                  type="number"
                  className="onboarding__input"
                  placeholder="170"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  min="100"
                  max="250"
                  autoFocus
                />
              </div>
              <div className="onboarding__field">
                <label className="onboarding__label">Weight (kg)</label>
                <input
                  type="number"
                  className="onboarding__input"
                  placeholder="70"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  min="30"
                  max="300"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Date of Birth */}
        {step === 2 && (
          <div className="onboarding__step">
            <div className="onboarding__emoji">🎂</div>
            <h1 className="onboarding__title">Date of Birth</h1>
            <p className="onboarding__desc">Used to calculate your BMR. We don't share this with anyone.</p>
            <input
              type="date"
              className="onboarding__input"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              autoFocus
            />
          </div>
        )}

        {/* Step 3: Gender */}
        {step === 3 && (
          <div className="onboarding__step">
            <div className="onboarding__emoji">⚡</div>
            <h1 className="onboarding__title">Biological Sex</h1>
            <p className="onboarding__desc">Affects BMR and ideal weight calculations. Nothing else.</p>
            <div className="onboarding__options">
              {GENDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`onboarding__option ${gender === opt.value ? 'onboarding__option--selected' : ''}`}
                  onClick={() => setGender(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Activity Level */}
        {step === 4 && (
          <div className="onboarding__step">
            <div className="onboarding__emoji">🏃</div>
            <h1 className="onboarding__title">Current Activity Level</h1>
            <p className="onboarding__desc">Be honest about where you are NOW. Not where you want to be.</p>
            <div className="onboarding__options onboarding__options--vertical">
              {ACTIVITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`onboarding__option onboarding__option--wide ${activityLevel === opt.value ? 'onboarding__option--selected' : ''}`}
                  onClick={() => setActivityLevel(opt.value)}
                >
                  <span className="onboarding__option-label">{opt.label}</span>
                  <span className="onboarding__option-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="onboarding__nav">
          {step > 0 && (
            <button className="onboarding__btn onboarding__btn--back" onClick={() => setStep(step - 1)}>
              ← Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < 4 ? (
            <button
              className="onboarding__btn onboarding__btn--next"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Next →
            </button>
          ) : (
            <button
              className="onboarding__btn onboarding__btn--submit"
              onClick={handleSubmit}
            >
              Begin Training →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

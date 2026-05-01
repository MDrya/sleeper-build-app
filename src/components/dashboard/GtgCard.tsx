// ============================================================================
// GTG Micro-Workout Card — Interactive Trigger + Complete
// ============================================================================

import { useState } from 'react';
import type { MicroWorkoutTemplate } from '../../models';
import { useQuestStore } from '../../stores/useQuestStore';
import { useUserStore } from '../../stores/useUserStore';
import { getAvailableMicroWorkouts } from '../../constants/micro-workouts';

interface GtgCardProps {
  completed: number;
  maxDaily: number;
  expToday: number;
}

export function GtgCard({ completed, maxDaily, expToday }: GtgCardProps) {
  const user = useUserStore((s) => s.user);
  const completeMicro = useQuestStore((s) => s.completeMicroWorkout);

  const [activeWorkout, setActiveWorkout] = useState<MicroWorkoutTemplate | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);

  const isDone = completed >= maxDaily;
  const currentTier = user?.progression.currentTier ?? 0;

  const handleTrigger = () => {
    if (isDone || activeWorkout) return;

    const available = getAvailableMicroWorkouts(currentTier);
    if (available.length === 0) return;

    // Simple random selection
    const index = Math.floor(Math.random() * available.length);
    const workout = available[index];

    if (workout) {
      setActiveWorkout(workout);
      setJustCompleted(false);
    }
  };

  const handleComplete = () => {
    if (!activeWorkout) return;
    // Pass a generated ID — the store just increments the counter
    completeMicro(`gtg_${Date.now()}`);
    setJustCompleted(true);

    setTimeout(() => {
      setActiveWorkout(null);
      setJustCompleted(false);
    }, 2000);
  };

  const handleSkip = () => {
    setActiveWorkout(null);
    setJustCompleted(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
          {completed}
        </span>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          / {maxDaily} micro-workouts
        </span>
      </div>

      {/* Progress bar */}
      <div className="exp-bar" style={{ marginBottom: 12 }}>
        <div
          className="exp-bar__fill"
          style={{
            width: `${Math.min(100, (completed / maxDaily) * 100)}%`,
            background: 'linear-gradient(90deg, #00D4AA, #22C55E)',
          }}
        />
      </div>

      {/* Active workout */}
      {activeWorkout && !justCompleted && (
        <div className="gtg-active">
          <div className="gtg-active__header">
            <span className="gtg-active__emoji">⚡</span>
            <span className="gtg-active__category">{activeWorkout.category}</span>
          </div>
          <div className="gtg-active__name">{activeWorkout.exerciseName}</div>
          <div className="gtg-active__target">
            {activeWorkout.unit === 'reps'
              ? `Do ${activeWorkout.amount} reps`
              : `Hold for ${activeWorkout.amount}s`}
          </div>
          <div className="gtg-active__desc">{activeWorkout.prompt}</div>
          <div className="gtg-active__actions">
            <button className="gtg-active__done" onClick={handleComplete}>
              Done ✓
            </button>
            <button className="gtg-active__skip" onClick={handleSkip}>
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Just completed feedback */}
      {justCompleted && (
        <div className="gtg-complete">
          <span className="gtg-complete__icon">✅</span>
          <span className="gtg-complete__text">Micro-workout logged! +{activeWorkout?.expReward ?? 5} EXP</span>
        </div>
      )}

      {/* Trigger button */}
      {!activeWorkout && !justCompleted && (
        <button
          className={`gtg-trigger ${isDone ? 'gtg-trigger--done' : ''}`}
          onClick={handleTrigger}
          disabled={isDone}
        >
          {isDone ? '✓ All Done For Today' : '⚡ Do Micro-Workout'}
        </button>
      )}

      <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        +{expToday} EXP earned today
      </div>
    </div>
  );
}

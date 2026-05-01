// ============================================================================
// Workout Logger Modal — Record Sets, Reps, Hold Times
// ============================================================================

import { useState } from 'react';
import type { SkillNode } from '../../models';
import { useSkillTreeStore } from '../../stores/useSkillTreeStore';
import { useQuestStore } from '../../stores/useQuestStore';

interface WorkoutLoggerProps {
  node: SkillNode;
  questId?: string;
  onClose: () => void;
}

export function WorkoutLogger({ node, questId, onClose }: WorkoutLoggerProps) {
  const logSession = useSkillTreeStore((s) => s.logSession);
  const completeQuest = useQuestStore((s) => s.completeQuest);

  const isHold = node.exerciseType === 'hold' || node.exerciseType === 'flow';
  const thresholdSets = node.masteryThreshold.sets;
  const thresholdTarget = isHold
    ? (node.masteryThreshold.holdSeconds ?? node.masteryThreshold.durationSeconds ?? 0)
    : (node.masteryThreshold.reps ?? 0);

  const [sets, setSets] = useState(thresholdSets);
  const [reps, setReps] = useState(isHold ? 0 : thresholdTarget);
  const [holdSeconds, setHoldSeconds] = useState(isHold ? thresholdTarget : 0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ expEarned: number; masteryAchieved: boolean; nodesUnlocked: string[] } | null>(null);

  const handleSubmit = () => {
    const res = logSession(node.id, sets, reps, holdSeconds);
    setResult(res);
    setSubmitted(true);
    if (questId) {
      completeQuest(questId);
    }
  };

  const progress = node.progress;
  const consecutiveNeeded = node.masteryThreshold.consecutiveDays;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            <div className="modal__category">{node.category}</div>
            <h2 className="modal__title">{node.name}</h2>
          </div>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <p className="modal__desc">{node.description}</p>

        {/* Form cues */}
        <div className="modal__cues">
          <div className="modal__cues-label">Form Cues</div>
          <div className="modal__cues-list">
            {node.formCues.map((cue, i) => (
              <span key={i} className="modal__cue">✓ {cue}</span>
            ))}
          </div>
        </div>

        {/* Mastery target info */}
        <div className="modal__target">
          <div className="modal__target-label">Mastery Target</div>
          <div className="modal__target-value">
            {thresholdSets} sets × {thresholdTarget} {isHold ? 'seconds' : 'reps'}
            <span className="modal__target-days"> for {consecutiveNeeded} consecutive days</span>
          </div>
          <div className="modal__progress-bar">
            <div className="modal__progress-fill" style={{ width: `${Math.min(100, (progress.consecutiveDaysMet / consecutiveNeeded) * 100)}%` }} />
          </div>
          <div className="modal__progress-text">
            {progress.consecutiveDaysMet} / {consecutiveNeeded} consecutive days
          </div>
        </div>

        {!submitted ? (
          <>
            {/* Input fields */}
            <div className="modal__inputs">
              <div className="modal__field">
                <label className="modal__label">Sets</label>
                <div className="modal__counter">
                  <button className="modal__counter-btn" onClick={() => setSets(Math.max(1, sets - 1))}>−</button>
                  <span className="modal__counter-value">{sets}</span>
                  <button className="modal__counter-btn" onClick={() => setSets(sets + 1)}>+</button>
                </div>
              </div>

              {isHold ? (
                <div className="modal__field">
                  <label className="modal__label">Hold (seconds)</label>
                  <div className="modal__counter">
                    <button className="modal__counter-btn" onClick={() => setHoldSeconds(Math.max(1, holdSeconds - 5))}>−5</button>
                    <span className="modal__counter-value">{holdSeconds}s</span>
                    <button className="modal__counter-btn" onClick={() => setHoldSeconds(holdSeconds + 5)}>+5</button>
                  </div>
                </div>
              ) : (
                <div className="modal__field">
                  <label className="modal__label">Reps per set</label>
                  <div className="modal__counter">
                    <button className="modal__counter-btn" onClick={() => setReps(Math.max(1, reps - 1))}>−</button>
                    <span className="modal__counter-value">{reps}</span>
                    <button className="modal__counter-btn" onClick={() => setReps(reps + 1)}>+</button>
                  </div>
                </div>
              )}
            </div>

            {/* What this means */}
            <div className="modal__summary">
              You're logging: <strong>{sets} sets × {isHold ? `${holdSeconds}s hold` : `${reps} reps`}</strong>
              <br />
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                Total: {isHold ? `${sets * holdSeconds}s` : `${sets * reps} reps`} · EXP: +{node.expPerSet * sets}
              </span>
            </div>

            <button className="modal__submit" onClick={handleSubmit}>
              Log Workout 💪
            </button>
          </>
        ) : result && (
          <div className="modal__result">
            {result.masteryAchieved ? (
              <div className="modal__mastery">
                <div className="modal__mastery-icon">🏆</div>
                <div className="modal__mastery-text">MASTERED!</div>
                <div className="modal__mastery-desc">{node.name} is now mastered. +{node.masteryBonusExp} bonus EXP!</div>
              </div>
            ) : (
              <div className="modal__logged">
                <div className="modal__logged-icon">✅</div>
                <div className="modal__logged-text">Workout Logged</div>
              </div>
            )}
            <div className="modal__exp-earned">+{result.expEarned} EXP</div>
            {result.nodesUnlocked.length > 0 && (
              <div className="modal__unlocked">
                🔓 New exercises unlocked: {result.nodesUnlocked.join(', ')}
              </div>
            )}
            <button className="modal__submit" onClick={onClose} style={{ marginTop: 16 }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

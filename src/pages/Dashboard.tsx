// ============================================================================
// Dashboard — Main Screen
// ============================================================================

import { useEffect, useState } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { useSkillTreeStore } from '../stores/useSkillTreeStore';
import { useQuestStore } from '../stores/useQuestStore';
import { useBossFightStore } from '../stores/useBossFightStore';
import { getLevelProgress } from '../constants/exp-table';
import { getTierDefinition } from '../constants/tiers';
import { calculateFullStrengthScore } from '../services/strength-calc';
import { interpretScore, analyzeCategoryGaps } from '../services/strength-calc';
import type { Quest, SkillNode } from '../models';

import { TileCard } from '../components/ui/TileCard';
import { LevelBadge } from '../components/ui/LevelBadge';
import { ExpBar } from '../components/ui/ExpBar';
import { StreakFlame } from '../components/ui/StreakFlame';
import { StatBlock } from '../components/dashboard/StatBlock';
import { QuestTile } from '../components/dashboard/QuestTile';
import { BossFightBanner } from '../components/dashboard/BossFightBanner';
import { OnboardingForm } from '../components/onboarding/OnboardingForm';
import { WorkoutLogger } from '../components/workout/WorkoutLogger';
import { PostureTaskList } from '../components/dashboard/PostureTaskList';
import { GtgCard } from '../components/dashboard/GtgCard';

export function Dashboard() {
  const user = useUserStore((s) => s.user);
  const isInitialized = useUserStore((s) => s.isInitialized);
  const trees = useSkillTreeStore((s) => s.trees);
  const questBoard = useQuestStore((s) => s.questBoard);
  const postureStreak = useQuestStore((s) => s.postureStreak);
  const bossFight = useBossFightStore((s) => s.bossFight);
  const checkAndRefreshBoard = useQuestStore((s) => s.checkAndRefreshBoard);
  const generateDailyBoard = useQuestStore((s) => s.generateDailyBoard);
  const checkEligibility = useBossFightStore((s) => s.checkEligibility);
  const getNode = useSkillTreeStore((s) => s.getNode);
  const completePostureTask = useQuestStore((s) => s.completePostureTask);

  // Modal state
  const [activeNode, setActiveNode] = useState<SkillNode | null>(null);
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);
  const [completedPostureIds, setCompletedPostureIds] = useState<string[]>([]);

  // Refresh quest board and boss eligibility on mount
  useEffect(() => {
    if (user && isInitialized) {
      checkAndRefreshBoard();
      checkEligibility();
      if (questBoard.skillQuests.length === 0) {
        generateDailyBoard();
      }
    }
  }, [user, isInitialized]);

  // --- Show onboarding if no user ---
  if (!user || !isInitialized) {
    return <OnboardingForm />;
  }

  // --- Handle quest click → open workout logger ---
  const handleQuestClick = (quest: Quest) => {
    if (quest.skillNodeId) {
      const node = getNode(quest.skillNodeId);
      if (node) {
        setActiveNode(node);
        setActiveQuestId(quest.id);
      }
    }
  };

  const handleCloseModal = () => {
    setActiveNode(null);
    setActiveQuestId(null);
    // Refresh board after logging
    checkAndRefreshBoard();
    if (questBoard.skillQuests.length === 0) {
      generateDailyBoard();
    }
  };

  // --- Derived data ---
  const progression = user.progression;
  const activity = user.activity;
  const levelProgress = getLevelProgress(progression.totalExp);
  const tierDef = getTierDefinition(progression.currentTier);

  // Strength score
  const strengthScore = calculateFullStrengthScore(
    trees,
    user.bodyMetrics.currentWeightKg
  );
  const scoreInterp = interpretScore(strengthScore.overall);
  const gaps = analyzeCategoryGaps(strengthScore.breakdown);

  // Category colors
  const categoryColors: Record<string, string> = {
    push: '#EF4444',
    pull: '#3B82F6',
    legs: '#22C55E',
    core: '#F97316',
    flexibility: '#A855F7',
  };

  return (
    <>
      <div className="dashboard">
        {/* --- Header --- */}
        <div className="dashboard__header">
          <div className="dashboard__logo">
            <div className="dashboard__logo-mark">SB</div>
            Sleeper Build
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* --- Hero Tile: Level + EXP --- */}
        <TileCard className="tile--hero" delay={0}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <LevelBadge
              level={levelProgress.level}
              displayName={user.displayName}
              tierName={tierDef?.title ?? 'Civilian'}
              tierNumber={progression.currentTier}
            />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>
                Total EXP
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                {progression.totalExp.toLocaleString()}
              </div>
            </div>
          </div>
          <ExpBar
            currentExp={levelProgress.currentLevelExp}
            nextLevelExp={levelProgress.nextLevelExp}
            level={levelProgress.level}
            progressPercent={levelProgress.progressPercent}
          />
        </TileCard>

        {/* --- Stat Blocks Row --- */}
        <TileCard className="tile--stat" delay={1}>
          <StatBlock
            label="Weight"
            value={`${user.bodyMetrics.currentWeightKg}kg`}
            sub={`Target: ${user.bodyMetrics.idealTargetWeightKg}kg`}
            icon="⚖️"
          />
        </TileCard>

        <TileCard className="tile--stat" delay={2}>
          <StatBlock
            label="Height"
            value={`${user.bodyMetrics.currentApparentHeightCm}cm`}
            sub={`Base: ${user.bodyMetrics.baseHeightCm}cm`}
            icon="📏"
          />
        </TileCard>

        <TileCard className="tile--stat" delay={3}>
          <StatBlock
            label="Daily Calories"
            value={user.bodyMetrics.dailyMaintenanceCalories.toLocaleString()}
            sub="Maintenance TDEE"
            icon="🔥"
          />
        </TileCard>

        <TileCard className="tile--stat" delay={4}>
          <StatBlock
            label="Workouts"
            value={activity.totalWorkoutsLogged}
            sub={`${activity.totalMicroWorkouts} micro-workouts`}
            icon="📊"
          />
        </TileCard>

        {/* --- Strength Score --- */}
        <TileCard className="tile--strength" delay={5} label="Relative Strength Score">
          <div className="strength-gauge">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <div className="strength-gauge__score" style={{ color: scoreInterp.color }}>
                {strengthScore.overall}
              </div>
              <div>
                <div className="strength-gauge__label" style={{ color: scoreInterp.color }}>
                  {scoreInterp.tier}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Top {100 - scoreInterp.estimatedPercentile}%
                </div>
              </div>
            </div>
            <div className="strength-gauge__bars">
              {gaps.map((gap) => (
                <div className="strength-bar" key={gap.category}>
                  <div className="strength-bar__label">{gap.category}</div>
                  <div className="strength-bar__track">
                    <div
                      className="strength-bar__fill"
                      style={{
                        width: `${gap.score}%`,
                        background: categoryColors[gap.category] || 'var(--accent)',
                      }}
                    />
                  </div>
                  <div className="strength-bar__value">{gap.score}</div>
                </div>
              ))}
            </div>
          </div>
        </TileCard>

        {/* --- Streak --- */}
        <TileCard className="tile--streak" delay={6} label="Activity Streak">
          <StreakFlame streak={activity.currentStreak} />
          <div style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Longest: {activity.longestStreak} days
          </div>
        </TileCard>

        {/* --- Today's Quests (CLICKABLE) --- */}
        <TileCard className="tile--quest" delay={7}>
          <QuestTile
            quests={questBoard.skillQuests}
            title="Today's Quests — Tap to Log"
            emptyMessage="Complete calibration to unlock quests"
            onQuestClick={handleQuestClick}
          />
        </TileCard>

        {/* --- Posture (INTERACTIVE CHECKLIST) --- */}
        <TileCard className="tile--posture" delay={8} label="Posture & Decompression">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <StreakFlame streak={postureStreak} label="Posture Streak" />
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
              {completedPostureIds.length}/{questBoard.postureTasks.length} done
            </div>
          </div>
          {questBoard.postureTasks.length > 0 ? (
            <PostureTaskList
              tasks={questBoard.postureTasks}
              completedIds={completedPostureIds}
              onComplete={(taskId) => {
                if (!completedPostureIds.includes(taskId)) {
                  setCompletedPostureIds([...completedPostureIds, taskId]);
                  completePostureTask(taskId);
                }
              }}
            />
          ) : (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '12px 0' }}>
              No posture tasks yet — your board will refresh daily
            </div>
          )}
        </TileCard>

        {/* --- GTG (INTERACTIVE TRIGGER) --- */}
        <TileCard className="tile--gtg" delay={9} label="Grease the Groove">
          <GtgCard
            completed={questBoard.microWorkoutsCompleted}
            maxDaily={5}
            expToday={questBoard.expEarnedToday}
          />
        </TileCard>

        {/* --- Boss Fight Banner --- */}
        <TileCard className="tile--boss" delay={10}>
          <BossFightBanner
            isEligible={bossFight.isEligible}
            bossName={bossFight.nextChallenge?.bossName ?? null}
            tierNumber={progression.currentTier}
            message={bossFight.ineligibleReason ?? 'You are ready to face the next challenge.'}
          />
        </TileCard>
      </div>

      {/* --- Workout Logger Modal --- */}
      {activeNode && (
        <WorkoutLogger
          node={activeNode}
          questId={activeQuestId ?? undefined}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

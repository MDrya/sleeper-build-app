import type { Quest } from '../../models';

interface QuestTileProps {
  quests: Quest[];
  title: string;
  emptyMessage?: string;
  onQuestClick?: (quest: Quest) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  push: '💪',
  pull: '🏋️',
  legs: '🦵',
  core: '🎯',
  flexibility: '🧘',
  posture: '🧬',
  micro_workout: '⚡',
  default: '📋',
};

function getCategoryFromTitle(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('push')) return 'push';
  if (lower.includes('pull')) return 'pull';
  if (lower.includes('leg')) return 'legs';
  if (lower.includes('core')) return 'core';
  if (lower.includes('flex')) return 'flexibility';
  return 'default';
}

export function QuestTile({ quests, title, emptyMessage = 'No quests available', onQuestClick }: QuestTileProps) {
  return (
    <div>
      <div className="tile__label">{title}</div>
      {quests.length === 0 ? (
        <div className="tile__sub" style={{ padding: '20px 0', textAlign: 'center' }}>
          {emptyMessage}
        </div>
      ) : (
        <div>
          {quests.map((quest) => {
            const category = getCategoryFromTitle(quest.title);
            const icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.default;
            const isCompleted = quest.status === 'completed';

            return (
              <div
                key={quest.id}
                className={`quest-card ${isCompleted ? 'quest-card--completed' : ''}`}
                onClick={() => !isCompleted && onQuestClick?.(quest)}
                role="button"
                tabIndex={0}
              >
                <div className={`quest-card__icon quest-card__icon--${category}`}>
                  {isCompleted ? '✅' : icon}
                </div>
                <div className="quest-card__content">
                  <div className="quest-card__title">{quest.title}</div>
                  <div className="quest-card__desc">{quest.description}</div>
                </div>
                <div className="quest-card__exp">
                  {isCompleted ? 'Done' : `+${quest.expReward} XP`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

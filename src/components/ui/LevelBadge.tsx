import { colors } from '../../theme';

interface LevelBadgeProps {
  level: number;
  displayName: string;
  tierName: string;
  tierNumber: number;
}

export function LevelBadge({ level, displayName, tierName, tierNumber }: LevelBadgeProps) {
  const tierColor = colors.tier[tierNumber] || colors.tier[0];

  return (
    <div className="level-badge">
      <div
        className="level-badge__circle"
        style={{ background: `${tierColor}20`, color: tierColor }}
      >
        {level}
      </div>
      <div className="level-badge__info">
        <div className="level-badge__tier" style={{ color: tierColor }}>
          {tierName}
        </div>
        <div className="level-badge__name">{displayName}</div>
      </div>
    </div>
  );
}

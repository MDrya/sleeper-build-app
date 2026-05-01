import { colors } from '../../theme';

interface BossFightBannerProps {
  isEligible: boolean;
  bossName: string | null;
  tierNumber: number;
  message: string;
  onChallenge?: () => void;
}

export function BossFightBanner({
  isEligible,
  bossName,
  tierNumber,
  message,
  onChallenge,
}: BossFightBannerProps) {
  const tierColor = colors.tier[tierNumber + 1] || colors.tier[4];

  return (
    <div className="boss-banner" onClick={isEligible ? onChallenge : undefined}>
      <div className="boss-banner__icon">⚔️</div>
      <div className="boss-banner__content">
        <div className="boss-banner__title">
          {bossName
            ? `Boss Fight: ${bossName}`
            : tierNumber >= 4
              ? '👑 Maximum Tier Reached'
              : 'Next Boss Fight'}
        </div>
        <div className="boss-banner__sub">
          {message}
        </div>
      </div>
      {tierNumber < 4 && (
        <button
          className={`boss-banner__cta ${!isEligible ? 'boss-banner__cta--locked' : ''}`}
          style={isEligible ? { background: tierColor } : undefined}
          disabled={!isEligible}
        >
          {isEligible ? 'Challenge' : 'Locked'}
        </button>
      )}
    </div>
  );
}

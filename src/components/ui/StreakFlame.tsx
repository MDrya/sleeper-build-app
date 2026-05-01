interface StreakFlameProps {
  streak: number;
  label?: string;
}

export function StreakFlame({ streak, label = 'Day Streak' }: StreakFlameProps) {
  const flameEmoji = streak >= 30 ? '🔥' : streak >= 7 ? '🔥' : streak >= 1 ? '🕯️' : '💀';

  return (
    <div className="streak">
      <div className="streak__icon">{flameEmoji}</div>
      <div>
        <div className="streak__count">{streak}</div>
        <div className="streak__label">{label}</div>
      </div>
    </div>
  );
}

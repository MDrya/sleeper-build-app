import { motion } from 'framer-motion';

interface ExpBarProps {
  currentExp: number;
  nextLevelExp: number;
  level: number;
  progressPercent: number;
}

export function ExpBar({ currentExp, nextLevelExp, level, progressPercent }: ExpBarProps) {
  return (
    <div>
      <div className="exp-bar">
        <motion.div
          className="exp-bar__fill"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="exp-bar__text">
        <span>{currentExp.toLocaleString()} / {nextLevelExp.toLocaleString()} EXP</span>
        <span>Level {level + 1} in {(nextLevelExp - currentExp).toLocaleString()} EXP</span>
      </div>
    </div>
  );
}

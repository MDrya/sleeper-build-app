import { motion } from 'framer-motion';

interface StatBlockProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: string;
}

export function StatBlock({ label, value, sub, color, icon }: StatBlockProps) {
  return (
    <div>
      <div className="tile__label">{icon && <span style={{ marginRight: 4 }}>{icon}</span>}{label}</div>
      <motion.div
        className="tile__value"
        style={color ? { color } : undefined}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {value}
      </motion.div>
      {sub && <div className="tile__sub">{sub}</div>}
    </div>
  );
}

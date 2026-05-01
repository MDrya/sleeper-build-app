import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface TileCardProps {
  children: ReactNode;
  className?: string;
  label?: string;
  delay?: number;
}

export function TileCard({ children, className = '', label, delay = 0 }: TileCardProps) {
  return (
    <motion.div
      className={`tile ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      {label && <div className="tile__label">{label}</div>}
      {children}
    </motion.div>
  );
}

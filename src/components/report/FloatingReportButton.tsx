import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';

export function FloatingReportButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      className="fab"
      onClick={onClick}
      aria-label="Report busyness"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 18 }}
    >
      <Megaphone size={22} />
    </motion.button>
  );
}

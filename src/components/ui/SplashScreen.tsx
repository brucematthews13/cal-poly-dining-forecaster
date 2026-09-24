import { motion, AnimatePresence } from 'framer-motion';

export function SplashScreen({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span
            className="splash-emoji"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            🍽️
          </motion.span>
          <span className="splash-title">Cal Poly Dining Forecaster</span>
          <span className="splash-subtitle">Loading campus data…</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import { submitReport } from '../../lib/api';
import { LEVEL_EMOJIS, LEVEL_LABELS } from '../../types';
import type { LocationOverview } from '../../types';

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  locations: LocationOverview[];
  defaultLocationId: number | null;
  onSuccess: (message: string) => void;
}

export function ReportModal({ open, onClose, locations, defaultLocationId, onSuccess }: ReportModalProps) {
  const [locationId, setLocationId] = useState<number | null>(defaultLocationId);
  const [level, setLevel] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const activeLocationId = locationId ?? defaultLocationId;

  async function handleSubmit() {
    if (!activeLocationId || !level) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitReport({ location_id: activeLocationId, level });
      if (!res.success) {
        setError(res.message);
        return;
      }
      setDone(true);
      setTimeout(() => {
        onSuccess(res.message);
        handleClose();
      }, 1200);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setLevel(null);
    setError(null);
    setDone(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="modal glass-card"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="modal-close" onClick={handleClose} aria-label="Close">
              <X size={18} />
            </button>

            {done ? (
              <motion.div
                className="modal-success"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <CheckCircle2 size={48} color="var(--level-1)" />
                <p>Thanks for helping fellow Mustangs! 🐴</p>
              </motion.div>
            ) : (
              <>
                <h3>Report Busyness</h3>
                <label className="modal-label" htmlFor="report-location">
                  Location
                </label>
                <select
                  id="report-location"
                  className="select"
                  value={activeLocationId ?? ''}
                  onChange={(e) => setLocationId(Number(e.target.value))}
                >
                  <option value="" disabled>
                    Select a location
                  </option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>

                <span className="modal-label">How busy is it right now?</span>
                <div className="emoji-row">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <motion.button
                      key={lvl}
                      type="button"
                      className={`emoji-btn ${level === lvl ? 'emoji-btn-active' : ''}`}
                      onClick={() => setLevel(lvl)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <span className="emoji">{LEVEL_EMOJIS[lvl]}</span>
                      <span className="emoji-label">{LEVEL_LABELS[lvl]}</span>
                    </motion.button>
                  ))}
                </div>

                {error && <p className="modal-error">{error}</p>}

                <button
                  type="button"
                  className="btn btn-primary modal-submit"
                  disabled={!activeLocationId || !level || submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? 'Submitting…' : 'Submit Report'}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

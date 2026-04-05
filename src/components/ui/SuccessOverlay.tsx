import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface SuccessOverlayProps {
  show: boolean;
  title?: string;
  subtitle?: string;
  onComplete?: () => void;
  duration?: number;
}

const spring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 20,
};

const SuccessOverlay = ({
  show,
  title = "Done",
  subtitle,
  onComplete,
  duration = 1800,
}: SuccessOverlayProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Content */}
          <motion.div
            className="relative flex flex-col items-center gap-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={spring}
          >
            {/* Checkmark circle */}
            <motion.div
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...spring, delay: 0.1 }}
            >
              {/* Ripple rings */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-bronze/30"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-bronze/20"
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 2.8, opacity: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              />

              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-bronze to-bronze-dark flex items-center justify-center shadow-lg">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ ...spring, delay: 0.25 }}
                >
                  <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                </motion.div>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <h3 className="font-vollkorn text-xl font-bold text-foreground">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessOverlay;

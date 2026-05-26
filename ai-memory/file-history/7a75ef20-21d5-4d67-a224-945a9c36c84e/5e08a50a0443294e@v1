import { Button } from "@/components/ui/button";
import { AlertCircle, Zap, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface UsageLimitBannerProps {
  current: number;
  limit: number;
  feature: string;
}

const UsageLimitBanner = ({ current, limit, feature }: UsageLimitBannerProps) => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const percentage = (current / limit) * 100;
  const isAtLimit = current >= limit;
  const isNearLimit = percentage >= 80 && !isAtLimit;

  if ((!isAtLimit && !isNearLimit) || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={`flex items-center gap-3 px-4 py-2.5 text-sm ${
          isAtLimit
            ? "bg-destructive/10 border-b border-destructive/20 text-destructive"
            : "bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-400"
        }`}
      >
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1">
          {isAtLimit
            ? `You've reached your ${feature} limit (${current}/${limit}). Upgrade to continue.`
            : `You're almost at your ${feature} limit — ${current}/${limit} used.`}
        </span>
        <Button
          size="sm"
          className="h-7 text-xs bg-bronze hover:bg-bronze/90 text-background gap-1 flex-shrink-0"
          onClick={() => navigate("/profile/payments-billing")}
        >
          <Zap className="w-3 h-3" />
          Upgrade
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded hover:bg-black/10 transition-colors flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default UsageLimitBanner;

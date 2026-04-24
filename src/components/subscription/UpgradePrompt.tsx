import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Sparkles, ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface UpgradePromptProps {
  feature: string;
  description?: string;
  compact?: boolean;
}

const UpgradePrompt = ({ feature, description, compact = false }: UpgradePromptProps) => {
  const navigate = useNavigate();

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 p-2 rounded-lg bg-bronze/5 border border-bronze/20"
      >
        <Lock className="w-3.5 h-3.5 text-bronze flex-shrink-0" />
        <span className="text-xs text-muted-foreground flex-1">{feature} is a Pro feature</span>
        <Button
          size="sm"
          className="h-6 text-[10px] px-2 bg-bronze hover:bg-bronze/90 text-background"
          onClick={() => navigate("/profile/payments-billing")}
        >
          Upgrade
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-8 text-center border-bronze/20 bg-gradient-to-br from-bronze/5 to-background">
        <div className="w-16 h-16 rounded-full bg-bronze/10 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-bronze" />
        </div>

        <Badge className="bg-bronze/10 text-bronze border-bronze/20 mb-4">
          <Sparkles className="w-3 h-3 mr-1" />
          Pro Feature
        </Badge>

        <h3 className="font-vollkorn text-xl font-bold mb-2">{feature}</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
          {description || `Upgrade to Pro to unlock ${feature} and take your creative business to the next level.`}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate("/profile/payments-billing")}
            className="bg-bronze hover:bg-bronze/90 text-background gap-2"
          >
            <Zap className="w-4 h-4" />
            Upgrade to Pro
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/pricing")}
            className="border-bronze/30 text-bronze hover:bg-bronze/10"
          >
            View Plans
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default UpgradePrompt;

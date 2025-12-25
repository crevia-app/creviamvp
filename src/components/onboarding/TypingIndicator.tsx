import { motion } from "framer-motion";
import kiraMascot from "@/assets/kira-mascot-new.png";

const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-bronze/20 to-bronze/10 flex items-center justify-center overflow-hidden">
        <img 
          src={kiraMascot} 
          alt="Kira" 
          className="w-8 h-8 object-contain"
        />
      </div>
      
      <div className="bg-card rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm border border-border/50">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-bronze/60"
              animate={{
                y: [0, -6, 0],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;

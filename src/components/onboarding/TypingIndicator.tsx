import { motion } from "framer-motion";

const TypingIndicator = () => {
  return (
    <div className="bg-card rounded-2xl px-5 py-4 shadow-sm border border-border/50 inline-block">
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
  );
};

export default TypingIndicator;

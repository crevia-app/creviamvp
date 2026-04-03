import { motion } from "framer-motion";

interface KiraMessageProps {
  content: string;
}

const KiraMessage = ({ content }: KiraMessageProps) => {
  const lines = content.split("\n");

  return (
    <div className="flex items-start gap-3">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-bronze/20 to-bronze/10 flex items-center justify-center"
      >
        <span className="text-lg">✨</span>
      </motion.div>
      
      <div className="flex-1 bg-card rounded-2xl rounded-tl-sm p-4 shadow-sm border border-border/50 max-w-[85%]">
        {lines.map((line, index) => (
          <p key={index} className={`text-foreground leading-relaxed ${index > 0 ? "mt-2" : ""}`}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

export default KiraMessage;

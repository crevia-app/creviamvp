import { motion } from "framer-motion";
import kiraMascot from "@/assets/kira-mascot-new.png";

interface KiraMessageProps {
  content: string;
}

const KiraMessage = ({ content }: KiraMessageProps) => {
  // Split content by newlines to handle multi-line messages
  const lines = content.split("\n");

  return (
    <div className="flex items-start gap-3">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-bronze/20 to-bronze/10 flex items-center justify-center overflow-hidden"
      >
        <img 
          src={kiraMascot} 
          alt="Kira" 
          className="w-8 h-8 object-contain"
        />
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

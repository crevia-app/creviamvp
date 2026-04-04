import { motion } from "framer-motion";

interface KiraMessageProps {
  content: string;
}

const KiraMessage = ({ content }: KiraMessageProps) => {
  const lines = content.split("\n");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 max-w-[85%]">
        {lines.map((line, index) => (
          <p key={index} className={`text-foreground leading-relaxed ${index > 0 ? "mt-2" : ""}`}>
            {line}
          </p>
        ))}
      </div>
    </motion.div>
  );
};

export default KiraMessage;

import { motion } from "framer-motion";
import { Send } from "lucide-react";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "textarea";
  prefix?: string;
  onSubmit?: () => void;
}

const TextInput = ({ value, onChange, placeholder, type = "text", prefix, onSubmit }: TextInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && type === "text" && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {prefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          {prefix}
        </span>
      )}
      
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-bronze/50 focus:border-bronze transition-all resize-none"
        />
      ) : (
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`
              w-full bg-card border border-border rounded-xl py-3 pr-12 text-foreground placeholder:text-muted-foreground 
              focus:outline-none focus:ring-2 focus:ring-bronze/50 focus:border-bronze transition-all
              ${prefix ? "pl-28" : "pl-4"}
            `}
          />
          {onSubmit && (
            <button
              type="button"
              onClick={onSubmit}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-bronze hover:bg-bronze-dark text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default TextInput;

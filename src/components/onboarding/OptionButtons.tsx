import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface OptionButtonsProps {
  options: Option[];
  selected: string[];
  onSelect: (value: string) => void;
  multiSelect?: boolean;
}

const OptionButtons = ({ options, selected, onSelect, multiSelect = false }: OptionButtonsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option, index) => {
        const isSelected = selected.includes(option.value);
        
        return (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(option.value)}
            className={`
              relative px-4 py-2.5 rounded-xl font-medium text-sm transition-all
              ${isSelected 
                ? "bg-bronze text-white shadow-md shadow-bronze/20" 
                : "bg-card border border-border hover:border-bronze/50 text-foreground"
              }
            `}
          >
            <span className="flex items-center gap-2">
              {multiSelect && isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex-shrink-0"
                >
                  <Check className="w-4 h-4" />
                </motion.span>
              )}
              {option.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default OptionButtons;

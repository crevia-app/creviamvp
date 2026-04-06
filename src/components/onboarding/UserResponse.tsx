import { motion } from "framer-motion";

interface UserResponseProps {
  content: string;
}

const UserResponse = ({ content }: UserResponseProps) => {
  return (
    <div className="flex justify-end">
      <motion.div 
        initial={{ scale: 0.92, opacity: 0, x: 16 }}
        animate={{ scale: 1, opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="bg-bronze text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] shadow-sm"
      >
        <p className="leading-relaxed">{content}</p>
      </motion.div>
    </div>
  );
};

export default UserResponse;

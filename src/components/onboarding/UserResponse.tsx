import { motion } from "framer-motion";

interface UserResponseProps {
  content: string;
}

const UserResponse = ({ content }: UserResponseProps) => {
  return (
    <div className="flex justify-end">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-bronze text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] shadow-sm"
      >
        <p className="leading-relaxed">{content}</p>
      </motion.div>
    </div>
  );
};

export default UserResponse;

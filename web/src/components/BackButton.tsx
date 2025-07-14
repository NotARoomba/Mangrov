import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

export default function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="flex items-center gap-1 text-sm opacity-80 hover:opacity-100 mb-4 cursor-pointer transition-all duration-300"
    >
      <ArrowLeft size={18} /> Back
    </motion.button>
  );
}

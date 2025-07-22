import { motion } from "framer-motion";

export default function GreenSpinner() {
  return (
    <motion.div
      className="w-8 h-8 border-6 border-green-500 border-t-transparent rounded-full animate-spin"
      aria-label="Loading"
      role="status"
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    />
  );
}

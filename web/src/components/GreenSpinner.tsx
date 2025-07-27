import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

export default function GreenSpinner() {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ opacity: 1 });
  }, [controls]);

  return (
    <motion.div
      className="w-8 h-8 border-6 border-primary border-t-transparent rounded-full animate-spin"
      aria-label="Loading"
      role="status"
      initial={{ opacity: 0 }}
      animate={controls}
      transition={{ duration: 0.4, ease: "easeOut" }}
    />
  );
}

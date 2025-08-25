import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Languages } from "lucide-react";

interface LanguageToggleProps {
  onLanguageChange: (language: "en" | "es") => void;
  currentLanguage: "en" | "es";
}

export default function LanguageToggle({
  onLanguageChange,
  currentLanguage,
}: LanguageToggleProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    const newLanguage = currentLanguage === "en" ? "es" : "en";

    // Add a small delay for the animation
    setTimeout(() => {
      onLanguageChange(newLanguage);
      setIsAnimating(false);
    }, 150);
  };

  return (
    <div className="flex items-center justify-center my-8">
      <div className="flex items-center space-x-4 bg-neutral-900 p-2 rounded-2xl border border-neutral-800">
        <div className="flex items-center space-x-2 px-3 py-2">
          <Globe className="w-4 h-4 text-neutral-400" />
          <span
            className={`text-sm font-medium transition-colors ${
              currentLanguage === "en" ? "text-primary" : "text-neutral-400"
            }`}
          >
            EN
          </span>
        </div>

        <button
          onClick={handleToggle}
          disabled={isAnimating}
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
            currentLanguage === "es" ? "bg-primary" : "bg-neutral-700"
          } ${isAnimating ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          <motion.div
            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
            animate={{
              x: currentLanguage === "en" ? 2 : 26,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          />
        </button>

        <div className="flex items-center space-x-2 px-3 py-2">
          <Languages className="w-4 h-4 text-neutral-400" />
          <span
            className={`text-sm font-medium transition-colors ${
              currentLanguage === "es" ? "text-primary" : "text-neutral-400"
            }`}
          >
            ES
          </span>
        </div>
      </div>
    </div>
  );
}

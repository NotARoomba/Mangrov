import { motion, easeInOut, easeOut } from "motion/react";
import AboutButtons from "../components/AboutHeader";
import ImageStrip from "../components/ImageStrip";
import useWindowSize from "../hooks/useWindowSize";
import AuthBox from "../components/AuthBox";

// Animation variants
const containerVariants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easeInOut,
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.4, ease: easeInOut },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

export default function Home() {
  const [width, height] = useWindowSize();

  return (
    <motion.div
      className="flex flex-col md:flex-row justify-center h-screen overflow-hidden"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Left Text Content */}
      <motion.div
        className="w-full md:w-1/2 px-6 py-12 md:p-20 flex flex-col min-h-screen justify-start md:justify-between text-center md:text-left space-y-8"
        variants={containerVariants}
      >
        <motion.h1
          className="text-5xl md:text-7xl xl:text-8xl font-semibold leading-tight"
          variants={itemVariants}
        >
          Welcome to Mangrov
        </motion.h1>

        <motion.p
          className="text-lg sm:text-2xl md:text-3xl xl:text-4xl leading-relaxed text-neutral-300"
          variants={itemVariants}
        >
          A{" "}
          <span className="text-primary font-semibold">
            shopping experience
          </span>{" "}
          designed by meaningful, raw,{" "}
          <span className="text-primary font-semibold">human experiences</span>.
        </motion.p>

        {/* AuthBox for small screens */}
        <motion.div
          className="block md:hidden"
          variants={itemVariants}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4, ease: easeOut }}
        >
          <AuthBox />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="self-center md:self-start"
        >
          <AboutButtons />
        </motion.div>
      </motion.div>

      {/* AuthBox for medium+ screens */}
      <motion.div
        className="hidden md:flex w-full md:w-1/2 items-center justify-center p-6 md:p-0"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.5, ease: easeOut }}
      >
        <AuthBox />
      </motion.div>

      {/* Floating Image Strip */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <ImageStrip
          start={{ x: -200, y: (height * 3) / 4 }}
          end={{ x: (width + 400) / 2, y: -300 }}
          speed={12}
          className="absolute bottom-0 left-0 w-full h-screen"
          imgHeightTW="h-32 sm:h-40 md:h-44"
          imgWidthTW="w-44 sm:w-52 md:w-56"
        />
      </div>
    </motion.div>
  );
}

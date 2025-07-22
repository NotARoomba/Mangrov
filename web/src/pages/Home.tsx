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
      className="flex justify-center h-screen overflow-hidden"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        className="w-1/2 p-20 flex flex-col justify-between"
        variants={containerVariants}
      >
        <motion.h1 className="text-8xl font-semibold" variants={itemVariants}>
          Welcome to Mangrov
        </motion.h1>
        <motion.p
          className="text-5xl leading-14 w-full"
          variants={itemVariants}
        >
          A{" "}
          <span className="text-primary font-semibold">
            shopping experience
          </span>{" "}
          designed by meaningful, <br />
          raw,{" "}
          <span className="text-primary font-semibold">human experiences</span>.
        </motion.p>
        <motion.div variants={itemVariants}>
          <AboutButtons />
        </motion.div>
      </motion.div>

      <motion.div
        className="w-1/2 h-full flex items-center justify-center"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.5, ease: easeOut }}
      >
        <AuthBox />
      </motion.div>

      <ImageStrip
        start={{ x: -200, y: (height * 3) / 4 }}
        end={{ x: (width + 400) / 2, y: -300 }}
        speed={12}
        imgHeightTW="h-44"
        imgWidthTW="w-56"
      />
    </motion.div>
  );
}

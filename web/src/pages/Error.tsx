import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Home, AlertTriangle } from "lucide-react";
import PageWrapper from "../components/PageWrapper";

export default function Error() {
  const navigate = useNavigate();

  return (
    <PageWrapper className="min-h-screen bg-neutral-950">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          {/* Error Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <AlertTriangle size={48} className="text-white" />
          </div>

          {/* Error Message */}
          <h1 className="text-4xl font-bold text-white mb-4">
            Oops! Something went wrong
          </h1>

          <p className="text-lg text-neutral-400 mb-8 leading-relaxed">
            We encountered an unexpected error. Don't worry, it's not your
            fault!
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <motion.button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-primary to-primary/80 text-white px-8 py-4 rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all duration-200 flex items-center justify-center gap-3 font-semibold shadow-lg cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Home size={20} />
              Return to Home
            </motion.button>

            <motion.button
              onClick={() => window.location.reload()}
              className="w-full bg-neutral-800 text-white px-8 py-4 rounded-xl hover:bg-neutral-700 transition-all duration-200 font-semibold cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Try Again
            </motion.button>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-sm text-neutral-500">
            <p>If the problem persists, please contact support.</p>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}

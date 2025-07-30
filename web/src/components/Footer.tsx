import { SiInstagram, SiYoutube } from "@icons-pack/react-simple-icons";
import { Link } from "react-router";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-900 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Mangrov</h2>
          <p className="text-neutral-400">
            Shop through <span className="text-primary">sustainable</span>{" "}
            products enabling
            <span className="text-primary"> memorable experiences</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/about"
            className="border-2 border-primary rounded-lg bg-transparent tracking-widest text-white px-8 py-2 uppercase font-bold hover:bg-primary transition-all duration-300"
          >
            About
          </Link>
          <Link to="https://instagram.com/_mangrov_" target="_blank">
            <SiInstagram className="text-white w-8 h-8 hover:text-primary transition-colors" />
          </Link>
          <Link to="https://youtube.com" target="_blank">
            <SiYoutube className="text-white w-8 h-8 hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
      <p className="text-xs text-neutral-500 mt-4">© 2025 Mangrov</p>
    </motion.div>
  );
}

import { SiInstagram, SiYoutube } from "@icons-pack/react-simple-icons";
import { Link } from "react-router";

export default function AboutButtons() {
  return (
    <div className="flex items-center justify-center sm:justify-start gap-4 flex-wrap w-full">
      <Link
        to="/about"
        className="border-2 border-primary rounded-lg bg-transparent tracking-widest text-white px-8 2xs:px-16 py-2 uppercase font-extrabold text-lg sm:text-xl hover:bg-primary transition-all duration-300 text-center"
      >
        About
      </Link>
      <Link to="https://instagram.com/_mangrov_" target="_blank">
        <SiInstagram className="text-white w-8 h-8 sm:w-10 sm:h-10" />
      </Link>
      <Link to="https://youtube.com" target="_blank">
        <SiYoutube className="text-white w-8 h-8 sm:w-10 sm:h-10" />
      </Link>
    </div>
  );
}

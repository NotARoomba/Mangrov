import { SiInstagram, SiYoutube } from "@icons-pack/react-simple-icons";
import { Link } from "react-router";

export default function AboutButtons() {
  return (
    <div className="flex items-center justify-start  space-x-4">
      <Link
        to={"/about"}
        className="border-2 border-primary rounded-lg bg-transparent tracking-widest text-white px-16 py-2 uppercase font-extrabold text-xl hover:bg-primary transition-all duration-300 hover:z-50"
      >
        About
      </Link>
      <Link to={"https://instagram.com/_mangrov_"} target="_blank">
        <SiInstagram
          href="https://intagram.com"
          className="text-white w-10 h-10"
        />
      </Link>
      <Link to={"https://youtube.com"} target="_blank">
        <SiYoutube className="text-white w-10 h-10" />
      </Link>
    </div>
  );
}

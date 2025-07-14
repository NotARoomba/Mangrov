import AboutButtons from "../components/AboutHeader";
import ImageStrip from "../components/ImageStrip";
import useWindowSize from "../hooks/useWindowSize";
import AuthBox from "../components/AuthBox";

export default function Home() {
  const [width, height] = useWindowSize();
  return (
    <div className="flex justify-center h-screen ">
      <div className="w-1/2 p-20 flex flex-col justify-between">
        <h1 className="text-8xl font-semibold">Welcome to Mangrov</h1>
        <p className="text-5xl  leading-14 w-full">
          A{" "}
          <span className="text-primary font-semibold">
            shopping experience
          </span>{" "}
          designed by meaningful, <br />
          raw,{" "}
          <span className="text-primary font-semibold">human experiences</span>.
        </p>
        <AboutButtons />
      </div>
      <div className="w-1/2 h-full flex items-center justify-center">
        <AuthBox />
      </div>
      <ImageStrip
        start={{ x: -200, y: (height * 3) / 4 }}
        end={{ x: (width + 400) / 2, y: -300 }}
        speed={12}
        imgHeightTW="h-44"
        imgWidthTW="w-56"
      />
    </div>
  );
}

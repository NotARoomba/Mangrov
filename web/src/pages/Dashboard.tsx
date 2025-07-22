import { ArrowRightIcon, BellIcon, SearchIcon, UserIcon } from "lucide-react";
import { SiInstagram, SiYoutube } from "@icons-pack/react-simple-icons";
import { Link } from "react-router";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { motion } from "motion/react";
import PageWrapper from "../components/PageWrapper";

export default function Dashboard() {
  const [updates, setUpdates] = useState([]);
  const [loadedImages, setLoadedImages] = useState<number[]>([]);
  const { user } = useAuth();

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => [...prev, index]);
  };

  return (
    <PageWrapper className="flex h-screen w-full bg-neutral-950 text-white">
      <main className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
        {/* Search & Feed Section */}
        <section className="flex-[2] rounded-2xl p-4 flex flex-col">
          <div className="mb-6 min-h-[56px]">
            {user?.displayName ? (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-5xl font-bold"
              >
                Good Evening, {user?.displayName}
              </motion.h1>
            ) : (
              <div className="w-3/4 h-12 bg-neutral-700 rounded-xl animate-pulse" />
            )}
          </div>

          <div className="mb-4">
            <h2 className="text-3xl font-semibold text-primary flex items-center gap-2">
              <SearchIcon size={30} /> Quick Search
            </h2>
            <input
              type="text"
              placeholder="Type something..."
              className="mt-2 w-full rounded-md bg-muted text-sm px-3 py-2 focus:outline-none focus:ring-2 ring-primary"
            />
          </div>

          <div className="flex-1 overflow-y-auto grid grid-cols-4 gap-4 pr-2">
            {Array.from({ length: 12 }).map((_, i) => {
              const isLoaded = loadedImages.includes(i);
              return (
                <div
                  key={i}
                  className="rounded-xl aspect-square bg-white/10 relative "
                >
                  {!isLoaded && (
                    <div className="absolute inset-0 animate-pulse rounded-xl bg-neutral-700" />
                  )}
                  <img
                    src={`https://picsum.photos/300/300?random=${i}`}
                    alt={`img-${i}`}
                    className={`w-full h-full object-cover rounded-xl transition-all duration-500 ${
                      isLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => handleImageLoad(i)}
                    loading="lazy"
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Updates and Footer Section */}
        <section className="flex-1 flex flex-col gap-4">
          {/* Updates */}
          <div className="flex-[2] flex-col bg-neutral-900 rounded-2xl p-4">
            <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
              <BellIcon size={30} /> Updates
            </h2>
            {updates.length === 0 && (
              <p className="text-sm text-white/60 mt-12 text-center">
                No updates available at the moment.
              </p>
            )}
            <div className="mt-4 space-y-3 text-sm">
              {updates.map((update: any, i: number) => (
                <UpdateItem key={i} message={update.message} />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-[1] bg-neutral-900 rounded-2xl p-6 flex flex-col justify-between">
            <h2 className="text-5xl font-bold">Mangrov</h2>
            <p className="text-xl">
              Shop through <span className="text-primary">sustainable</span>{" "}
              products enabling
              <span className="text-primary"> memorable experiences</span>
            </p>
            <div className="flex items-center justify-start space-x-4">
              <Link
                to={"/about"}
                className="border-2 border-primary rounded-lg bg-transparent tracking-widest text-white px-12 py-1.5 uppercase font-extrabold text-lg hover:bg-primary transition-all duration-300 hover:z-50"
              >
                About
              </Link>
              <Link to={"https://instagram.com/_mangrov_"} target="_blank">
                <SiInstagram className="text-white w-10 h-10" />
              </Link>
              <Link to={"https://youtube.com"} target="_blank">
                <SiYoutube className="text-white w-10 h-10" />
              </Link>
            </div>
            <p className="text-xs text-white/40 mt-2">@ 2025 Mangrov</p>
          </div>
        </section>
      </main>
    </PageWrapper>
  );
}

function UpdateItem({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-md bg-[#1a1a1a]">
      <div className="flex items-center gap-2">
        <UserIcon className="w-4 h-4" />
        <span className="text-white text-xs">{message}</span>
      </div>
      <ArrowRightIcon className="w-4 h-4 text-primary" />
    </div>
  );
}

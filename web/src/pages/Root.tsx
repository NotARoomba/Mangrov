import { useEffect, useState } from "react";
import { Outlet, useNavigation, useLocation, useNavigate } from "react-router";
import GlobalSpinner from "../components/GlobalSpinner";
import Sidebar from "../components/Sidebar";
import "../utils/firebase";
import { AnimatePresence } from "motion/react";
import { useAuth } from "../hooks/useAuth";

export default function Root() {
  const { isSignedIn, pending } = useAuth();
  const [spinnerVisible, setSpinnerVisible] = useState(true);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  const navigation = useNavigation();
  const location = useLocation();
  const navigate = useNavigate();

  const showSidebar = !["/", "/about"].includes(location.pathname);

  useEffect(() => {
    if (
      !pending &&
      !isSignedIn &&
      !["/", "/about"].includes(location.pathname)
    ) {
      navigate("/");
    }
  }, [isSignedIn, location.pathname, pending]);

  useEffect(() => {
    const handleLoad = () => setAssetsLoaded(true);

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => window.removeEventListener("load", handleLoad);
  }, []);

  const isNavigating = Boolean(navigation.location);

  useEffect(() => {
    if (assetsLoaded && !isNavigating) {
      const timeout = setTimeout(() => setSpinnerVisible(false), 0);
      return () => clearTimeout(timeout);
    }
  }, [assetsLoaded, isNavigating]);

  return (
    <div className="max-h-screen font-inter bg-neutral-950 text-white">
      {/* <AnimatePresence>
        {spinnerVisible && location.pathname !== "/" && (
          <GlobalSpinner
            key="global-spinner"
            onDone={() => setSpinnerVisible(false)}
          />
        )}
      </AnimatePresence> */}

      {showSidebar && <Sidebar />}
      <main className={`${showSidebar ? "pl-14 md:pl-20" : ""}`}>
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>
    </div>
  );
}
